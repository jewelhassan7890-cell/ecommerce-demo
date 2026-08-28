const mongoose = require("mongoose");

const siteSettingSchema = new mongoose.Schema(
    {
        siteName: {
            type: String,
            default: "Style & Closet",
            trim: true,
        },
        tagline: {
            type: String,
            default: "EVERGREEN FOREVER",
            trim: true,
        },
        logo: {
            url: {
                type: String,
                required: true,
            },
            public_id: {
                type: String,
                required: true,
            },
        },
        favicon: {
            url: {
                type: String,
            },
            public_id: {
                type: String,
            },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("SiteSetting", siteSettingSchema);