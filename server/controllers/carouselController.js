const Carousel = require('../models/Carousel');
const { cloudinary } = require('../config/reviewcloudinary');

// @desc    Upload image to Cloudinary and create Carousel
// @route   POST /api/carousels
// @access  Private (Admin)
exports.createCarousel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an image file' });
        }

        // Multer-Storage-Cloudinary ফাইল আপলোড করে req.file এ path (URL) এবং filename (public_id) দেয়
        const newCarousel = await Carousel.create({
            title: req.body.title || '',
            imageUrl: req.file.path,
            publicId: req.file.filename,
        });

        res.status(201).json({ success: true, data: newCarousel });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all active carousel images for public website
// @route   GET /api/carousels
// @access  Public
exports.getPublicCarousels = async (req, res) => {
    try {
        const carousels = await Carousel.find({ isActive: true })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: carousels.length,
            data: carousels,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete carousel image from Cloudinary & DB
// @route   DELETE /api/carousels/:id
// @access  Private (Admin)
exports.deleteCarousel = async (req, res) => {
    try {
        const carousel = await Carousel.findById(req.params.id);

        if (!carousel) {
            return res.status(404).json({ success: false, message: 'Carousel not found' });
        }

        // ১. ক্লাউডিনারি থেকে ইমেজ ডিলিট করা
        await cloudinary.uploader.destroy(carousel.publicId);

        // ২. ডাটাবেজ থেকে রেকর্ড ডিলিট করা
        await carousel.deleteOne();

        res.status(200).json({ success: true, message: 'Carousel image deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};