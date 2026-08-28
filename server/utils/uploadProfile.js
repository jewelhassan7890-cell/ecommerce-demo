// const multer = require("multer");
// const path = require("path");

// // Storage config
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "uploads/profile"); // ফাইল যাবে uploads ফোল্ডারে
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//         cb(
//             null,
//             file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
//         );
//     },
// });

// // File filter (only image)
// const fileFilter = (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png|gif/;
//     const extname = allowedTypes.test(
//         path.extname(file.originalname).toLowerCase()
//     );
//     const mimetype = allowedTypes.test(file.mimetype);

//     if (extname && mimetype) {
//         cb(null, true);
//     } else {
//         cb(new Error("Only images are allowed!"));
//     }
// };

// const upload = multer({
//     storage,
//     limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
//     fileFilter,
// });

// module.exports = upload;





const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // Max 2MB
});

module.exports = upload;