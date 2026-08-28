const HeroConfig = require('../models/heroConfig.model');
const cloudinary = require('../config/cloudinary');

// @desc    Get Hero Banner Data
// @route   GET /api/v1/hero
// @access  Public
exports.getHeroConfig = async (req, res) => {
    try {
        let heroData = await HeroConfig.findOne({ isActive: true }).sort({ createdAt: -1 });

        if (!heroData) {
            return res.status(200).json({
                success: true,
                data: {
                    badgeText: "Trusted by 35,000+ Customers",
                    subHeading: "Style & Closet এ অর্ডার করুন",
                    mainHeading: "একেবারেই নিশ্চিন্তে",
                    discountBadge: { tag: "New Arrival", discountText: "30% OFF" },
                    bannerImage: { url: "", public_id: "" },
                    features: [
                        { icon: "👁️", text: "ডেলিভারি ম্যান এর সামনে ড্রেস দেখবেন", bgColor: "bg-orange-100" },
                        { icon: "✅", text: "ড্রেস পছন্দ হলে পেমেন্ট করবেন", bgColor: "bg-green-100" },
                        { icon: "↩️", text: "না হলে কুরিয়ার ফি দিয়ে রিটার্ন করবেন", bgColor: "bg-blue-100" },
                        { icon: "🔄", text: "যে কোন সমস্যায় ৩ দিনের মধ্যে এক্সচেঞ্জ", bgColor: "bg-sky-100" }
                    ]
                }
            });
        }

        res.status(200).json({
            success: true,
            data: heroData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Hero configuration লোড করা যায়নি।',
            error: error.message
        });
    }
};

// @desc    Update Hero Config with Cloudinary Image Upload
// @route   POST /api/v1/hero/admin
// @access  Private/Admin
exports.updateHeroConfig = async (req, res) => {
    try {
        const { badgeText, subHeading, mainHeading, discountBadge, features } = req.body;

        // আগের সক্রিয় Hero Config খোঁজা (আগের ছবি ডিলিট করার জন্য)
        const previousConfig = await HeroConfig.findOne({ isActive: true });

        let imageObj = previousConfig?.bannerImage || { url: '', public_id: '' };

        // যদি নতুন ইমেজ ফাইল আপলোড করা হয়ে থাকে
        if (req.file) {
            // ১. আগের ছবি Cloudinary তে থাকলে ডিলিট করে দেওয়া
            if (previousConfig?.bannerImage?.public_id) {
                await cloudinary.uploader.destroy(previousConfig.bannerImage.public_id);
            }

            // ২. নতুন ছবি Cloudinary তে আপলোড করা (Buffer Stream এর মাধ্যমে)
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'hero_banners' },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                stream.end(req.file.buffer);
            });

            imageObj = {
                url: uploadResult.secure_url,
                public_id: uploadResult.public_id
            };
        }

        // features যদি স্ট্রিং হিসেবে আসে (FormData থেকে), পার্স করা
        let parsedFeatures = features;
        if (typeof features === 'string') {
            parsedFeatures = JSON.parse(features);
        }

        let parsedDiscountBadge = discountBadge;
        if (typeof discountBadge === 'string') {
            parsedDiscountBadge = JSON.parse(discountBadge);
        }

        // আগের কনফিগ ডিঅ্যাক্টিভ করে দেওয়া
        await HeroConfig.updateMany({}, { isActive: false });

        // নতুন সেটিং সেভ
        const newHeroConfig = await HeroConfig.create({
            badgeText,
            subHeading,
            mainHeading,
            discountBadge: parsedDiscountBadge,
            bannerImage: imageObj,
            features: parsedFeatures,
            isActive: true
        });

        res.status(200).json({
            success: true,
            message: 'Cloudinary তে ইমেজ সহ Hero Config সফলভাবে আপডেট করা হয়েছে।',
            data: newHeroConfig
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Hero Config আপডেট করতে ব্যর্থ হয়েছে।',
            error: error.message
        });
    }
};