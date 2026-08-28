const Complaint = require("../models/Complaint");
const cloudinary = require("../config/cloudinary"); // Cloudinary কনফিগারেশন ইম্পোর্ট


// @desc    নতুন অভিযোগ জমা দেওয়া (User Submit)
// @route   POST /api/v1/complaints
// @access  Public
exports.submitComplaint = async (req, res) => {
    try {
        const { name, phone, message } = req.body;

        if (!name || !phone || !message) {
            return res.status(400).json({
                success: false,
                message: "অনুগ্রহ করে নাম, মোবাইল নম্বর এবং অভিযোগের বিবরণ পূরণ করুন।",
            });
        }

        let attachmentData = { url: "", public_id: "" };

        // Cloudinary-তে ছবি সফলভাবে আপলোড হলে
        if (req.file) {
            attachmentData = {
                url: req.file.path,
                public_id: req.file.filename,
            };
        }

        const newComplaint = await Complaint.create({
            name,
            phone,
            message,
            attachment: attachmentData,
        });

        return res.status(201).json({
            success: true,
            message: "আপনার অভিযোগটি সফলভাবে জমা নেওয়া হয়েছে। ২-৩ কার্যদিবসের মধ্যে সমাধান করা হবে।",
            data: newComplaint,
        });
    } catch (error) {
        console.error("Submit Complaint Error:", error);
        return res.status(500).json({
            success: false,
            message: "সার্ভারে সমস্যা হয়েছে, পুনরায় চেষ্টা করুন।",
        });
    }
};

// @desc    সকল অভিযোগ দেখা (Admin Get All)
// @route   GET /api/v1/complaints
// @access  Private/Admin




// @desc    সকল অভিযোগ দেখা (Admin Get All with Pagination)
// @route   GET /api/v1/complaints?page=1&limit=6
// @access  Private/Admin
exports.getAllComplaints = async (req, res) => {
    try {
        // পেজিনেশন প্যারামিটার (ডিফল্ট: page=1, limit=6)
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 6;
        const skip = (page - 1) * limit;

        // মোট ডাটা সংখ্যা গণনা
        const totalComplaints = await Complaint.countDocuments();

        // ডাটাবেজ থেকে পেজিনেশন অনুযায়ী ডাটা ফেচ করা
        const complaints = await Complaint.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalComplaints / limit);

        return res.status(200).json({
            success: true,
            count: complaints.length,
            totalComplaints,
            totalPages,
            currentPage: page,
            limit,
            data: complaints,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "অভিযোগের তালিকা আনতে সমস্যা হয়েছে।",
        });
    }
};

// @desc    অভিযোগের স্ট্যাটাস আপডেট ও নোট যোগ করা (Admin Update)
// @route   PATCH /api/v1/complaints/:id
// @access  Private/Admin
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "অভিযোগ পাওয়া যায়নি।",
            });
        }

        if (status) complaint.status = status;
        if (notes !== undefined) complaint.notes = notes;

        await complaint.save();

        return res.status(200).json({
            success: true,
            message: "অভিযোগের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।",
            data: complaint,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।",
        });
    }
};

// @desc    অভিযোগ ডিলিট করা (Admin Delete)
// @route   DELETE /api/v1/complaints/:id
// @access  Private/Admin
exports.deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "অভিযোগ পাওয়া যায়নি।",
            });
        }

        // Cloudinary থেকে ছবি ডিলিট করা (যদি থাকে)
        if (complaint.attachment && complaint.attachment.public_id) {
            await cloudinary.uploader.destroy(complaint.attachment.public_id);
        }

        await complaint.deleteOne();

        return res.status(200).json({
            success: true,
            message: "অভিযোগটি সফলভাবে মুছে ফেলা হয়েছে।",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "অভিযোগ ডিলিট করতে সমস্যা হয়েছে।",
        });
    }
};