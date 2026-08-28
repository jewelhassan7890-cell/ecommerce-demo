const Contact = require("../models/Contact");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");

// =========================================
// PUBLIC CONTROLLERS
// =========================================

/**
 * @desc    Submit contact message from storefront
 * @route   POST /api/contacts
 * @access  Public
 */
exports.submitContactForm = async (req, res) => {
    try {
        const { fullName, email, phone, subject, message } = req.body;

        // Validations
        if (!fullName || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "প্রয়োজনীয় সকল ফিল্ড (fullName, email, subject, message) প্রদান করুন।",
            });
        }

        const newContact = await Contact.create({
            fullName,
            email,
            phone: phone || "",
            subject,
            message,
        });

        // Non-blocking background email to admin
        emailService.sendAdminContactNotification(newContact);

        return res.status(201).json({
            success: true,
            message: "আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে। ধন্যবাদ!",
            data: { id: newContact._id },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "সার্ভার ত্রুটি! বার্তা পাঠানো যায়নি।",
            error: error.message,
        });
    }
};

// =========================================
// ADMIN CONTROLLERS
// =========================================

/**
 * @desc    Get all contact messages (With Search, Filter & Pagination)
 * @route   GET /api/admin/contacts
 * @access  Private / Admin
 */
exports.getAllContactsAdmin = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            isRead,
            search,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        let query = { isDeleted: false };

        if (status) query.status = status;
        if (isRead !== undefined) query.isRead = isRead === "true";

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { subject: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
            ];
        }

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.max(1, parseInt(limit));
        const skip = (pageNum - 1) * limitNum;

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

        const [contacts, totalContacts, unreadCount] = await Promise.all([
            Contact.find(query).sort(sortOptions).skip(skip).limit(limitNum),
            Contact.countDocuments(query),
            Contact.countDocuments({ isRead: false, isDeleted: false }),
        ]);

        return res.status(200).json({
            success: true,
            meta: {
                unreadCount,
                totalContacts,
                totalPages: Math.ceil(totalContacts / limitNum) || 1,
                currentPage: pageNum,
                limit: limitNum,
            },
            data: contacts,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get single message details and mark as read automatically
 * @route   GET /api/admin/contacts/:id
 * @access  Private / Admin
 */
exports.getContactByIdAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "অকার্যকর আইডি।" });
        }

        const contact = await Contact.findOne({ _id: id, isDeleted: false });

        if (!contact) {
            return res.status(404).json({ success: false, message: "মেসেজ পাওয়া যায়নি।" });
        }

        // Auto-mark read status when opened
        if (!contact.isRead) {
            contact.isRead = true;
            if (contact.status === "new") contact.status = "read";
            await contact.save();
        }

        return res.status(200).json({ success: true, data: contact });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Reply to customer via Resend Email Service
 * @route   POST /api/admin/contacts/:id/reply
 * @access  Private / Admin
 */
exports.replyToContactAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminReply, adminNote } = req.body;

        if (!adminReply) {
            return res.status(400).json({
                success: false,
                message: "উত্তর (adminReply) প্রদান করা বাধ্যতামূলক।",
            });
        }

        const contact = await Contact.findOne({ _id: id, isDeleted: false });

        if (!contact) {
            return res.status(404).json({ success: false, message: "মেসেজ পাওয়া যায়নি।" });
        }

        // Send Email via Resend
        const emailResult = await emailService.sendCustomerReplyEmail({
            customerEmail: contact.email,
            customerName: contact.fullName,
            subject: contact.subject,
            replyMessage: adminReply,
            originalMessage: contact.message,
        });

        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: "ইমেইল পাঠানো সম্ভব হয়নি।",
                error: emailResult.error,
            });
        }

        // Update DB
        contact.adminReply = adminReply;
        contact.replied = true;
        contact.repliedAt = new Date();
        contact.status = "replied";
        if (adminNote) contact.adminNote = adminNote;

        await contact.save();

        return res.status(200).json({
            success: true,
            message: "গ্রাহককে সফলভাবে উত্তর পাঠানো হয়েছে।",
            data: contact,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Update status or admin note manually
 * @route   PATCH /api/admin/contacts/:id
 * @access  Private / Admin
 */
exports.updateContactAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNote, isRead } = req.body;

        const contact = await Contact.findOne({ _id: id, isDeleted: false });

        if (!contact) {
            return res.status(404).json({ success: false, message: "মেসেজ পাওয়া যায়নি।" });
        }

        if (status) contact.status = status;
        if (adminNote !== undefined) contact.adminNote = adminNote;
        if (isRead !== undefined) contact.isRead = isRead;

        await contact.save();

        return res.status(200).json({
            success: true,
            message: "মেসেজ আপডেট করা হয়েছে।",
            data: contact,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Soft Delete Contact
 * @route   DELETE /api/admin/contacts/:id
 * @access  Private / Admin
 */
exports.deleteContactAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findById(id);

        if (!contact) {
            return res.status(404).json({ success: false, message: "মেসেজ পাওয়া যায়নি।" });
        }

        contact.isDeleted = true;
        await contact.save();

        return res.status(200).json({
            success: true,
            message: "মেসেজটি ট্র্যাশে সরানো হয়েছে (Soft Delete)।",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};