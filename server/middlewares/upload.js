const multer = require("multer");

// মেমোরি স্টোরেজ
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("শুধুমাত্র ইমেজ ফাইল আপলোড করা যাবে!"), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // সর্বোচ্চ ৫MB
    fileFilter,
});

// ❌ পুরানো লাইন: exports.uploadProductImages = upload.array("images", 5);

// ✅ সঠিক লাইন: ProductCreate.jsx এর সাথে সামঞ্জস্য রেখে Fields ব্যবহার করা হলো
exports.uploadProductImages = upload.fields([
    { name: "thumbnail", maxCount: 1 }, // ১টি থাম্বনেইল
    { name: "gallery", maxCount: 5 }     // সর্বোচ্চ ৫টি গ্যালারি ইমেজ
]);