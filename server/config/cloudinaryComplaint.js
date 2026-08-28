const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const dotenv = require("dotenv");

dotenv.config();

// Cloudinary Credentials Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary Storage for Complaints/Attachments
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "complaints_attachments",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        public_id: (req, file) => {
            const fileName = file.originalname.split(".")[0];
            return `${Date.now()}-${fileName}`;
        },
    },
});

module.exports = { cloudinary, storage };