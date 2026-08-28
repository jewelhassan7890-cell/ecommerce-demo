const jwt = require("jsonwebtoken");
const User = require("../models/auth");
// আপনার ইউজারের Mongoose মডেলের সঠিক পাথ দিন

/**
 * Optional Authentication Middleware
 * Allows both logged-in users and guest users to access the route.
 */
const optionalAuth = async (req, res, next) => {
    let token;

    // ১. Authorization হেডার থেকে Bearer token বের করা
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    // ২. টোকেন না থাকলে ইউজারকে Guest (null) হিসেবে ধরে পরবর্তী প্রসেসে পাঠান
    if (!token) {
        req.user = null;
        return next();
    }

    try {
        // ৩. টোকেন ডিকোড ও ভ্যালিডেট করা
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ৪. ডাটাবেজ থেকে ইউজার বের করে req.user এ সেট করা (পাসওয়ার্ড ছাড়া)
        const user = await User.findById(decoded.id).select("-password");

        if (user) {
            req.user = user; // ইউজার পাওয়া গেলে সেট করা হলো
        } else {
            req.user = null; // ইউজার ডাটাবেজে না পাওয়া গেলে গেস্ট
        }

        next();
    } catch (error) {
        // টোকেন ভুল বা Expired হলেও কোনো এরর রিটার্ন না করে Guest হিসেবে পাস করে দেয়া হলো
        req.user = null;
        next();
    }
};

module.exports = optionalAuth;