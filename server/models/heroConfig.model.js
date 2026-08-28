const mongoose = require('mongoose');

const featureItemSchema = new mongoose.Schema({
    icon: { type: String, required: true, default: '✅' },
    text: { type: String, required: true, trim: true },
    bgColor: { type: String, default: 'bg-green-100' }
});

const heroConfigSchema = new mongoose.Schema(
    {
        badgeText: {
            type: String,
            default: 'Trusted by 35,000+ Customers',
            trim: true
        },
        subHeading: {
            type: String,
            default: 'Style & Closet এ অর্ডার করুন',
            trim: true
        },
        mainHeading: {
            type: String,
            default: 'একেবারেই নিশ্চিন্তে',
            trim: true
        },
        discountBadge: {
            tag: { type: String, default: 'New Arrival' },
            discountText: { type: String, default: '30% OFF' }
        },
        bannerImage: {
            url: { type: String, required: true },
            public_id: { type: String, required: true }
        },
        features: [featureItemSchema],
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model('HeroConfig', heroConfigSchema);