const SiteSetting = require("../models/SiteSetting");
const cloudinary = require("../config/cloudinary"); // Cloudinary Config
const streamifier = require("streamifier");

// Cloudinary Upload Helper
const uploadToCloudinary = (fileBuffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: folder },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

// @desc    Get Site Settings (Public for Frontend Header/Footer)
// @route   GET /api/v1/site-settings
// @access  Public
const getSiteSettings = async (req, res) => {
    try {
        let settings = await SiteSetting.findOne();
        if (!settings) {
            return res.status(200).json({
                success: true,
                data: null,
                message: "No settings configured yet.",
            });
        }
        res.status(200).json({
            success: true,
            data: settings,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Create or Update Site Settings & Logo
// @route   POST /api/v1/site-settings
// @access  Private/Admin
const updateSiteSettings = async (req, res) => {
    try {
        const { siteName, tagline } = req.body;
        let settings = await SiteSetting.findOne();

        let logoData = settings?.logo;
        let faviconData = settings?.favicon;

        // ১. যদি নতুন লোগো ফাইল আপলোড করা হয়
        if (req.files && req.files.logo) {
            // পুরনো লোগো Cloudinary থেকে ডিলিট করা
            if (settings && settings.logo && settings.logo.public_id) {
                await cloudinary.uploader.destroy(settings.logo.public_id);
            }
            // নতুন লোগো আপলোড
            const result = await uploadToCloudinary(
                req.files.logo[0].buffer,
                "style_and_closet/brand"
            );
            logoData = {
                url: result.secure_url,
                public_id: result.public_id,
            };
        }

        // ২. যদি নতুন ফেভিকন ফাইল আপলোড করা হয়
        if (req.files && req.files.favicon) {
            if (settings && settings.favicon && settings.favicon.public_id) {
                await cloudinary.uploader.destroy(settings.favicon.public_id);
            }
            const result = await uploadToCloudinary(
                req.files.favicon[0].buffer,
                "style_and_closet/brand"
            );
            faviconData = {
                url: result.secure_url,
                public_id: result.public_id,
            };
        }

        // ৩. ডাটাবেজ আপডেট বা নতুন ডকুমেন্ট ক্রিয়েট
        if (settings) {
            settings.siteName = siteName || settings.siteName;
            settings.tagline = tagline || settings.tagline;
            if (logoData) settings.logo = logoData;
            if (faviconData) settings.favicon = faviconData;

            await settings.save();
        } else {
            if (!logoData) {
                return res.status(400).json({
                    success: false,
                    message: "Please upload a brand logo",
                });
            }
            settings = await SiteSetting.create({
                siteName: siteName || "Style & Closet",
                tagline: tagline || "EVERGREEN FOREVER",
                logo: logoData,
                favicon: faviconData,
            });
        }

        res.status(200).json({
            success: true,
            message: "Site settings updated successfully",
            data: settings,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

module.exports = {
    getSiteSettings,
    updateSiteSettings,
};