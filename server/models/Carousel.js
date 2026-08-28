const mongoose = require('mongoose');

const carouselSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
        },
        imageUrl: {
            type: String,
            required: [true, 'Image URL is required'],
        },
        publicId: {
            type: String,
            required: [true, 'Cloudinary Public ID is required for deletion'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Carousel', carouselSchema);