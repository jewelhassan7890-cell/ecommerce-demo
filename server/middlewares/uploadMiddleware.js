const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary"); // আপনার আগের ফাইল ইম্পোর্ট

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "complaints_attachments",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        public_id: (req, file) => {
            const fileName = file.originalname.split(".")[0].replace(/\s+/g, "-");
            return `${Date.now()}-${fileName}`;
        },
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // সর্বোচ্চ 5MB
});

module.exports = upload;