const mongoose = require("mongoose");

const errorMiddleware = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || "Internal Server Error";

    // =====================================
    // 1. Mongoose Cast Error (Invalid ObjectId)
    // =====================================
    if (err instanceof mongoose.Error.CastError) {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // =====================================
    // 2. Duplicate Key Error (MongoDB Code 11000)
    // =====================================
    if (err.code === 11000) {
        statusCode = 400;
        const field = err.keyValue ? Object.keys(err.keyValue).join(", ") : "field";
        message = `Duplicate value entered for ${field}`;
    }

    // =====================================
    // 3. Mongoose Validation Error
    // =====================================
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((item) => item.message)
            .join(", ");
    }

    // =====================================
    // 4. JWT Authentication Errors
    // =====================================
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid JSON Web Token. Please log in again.";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Your session has expired. Please log in again.";
    }

    // =====================================
    // 5. Cloudinary / API Upload Errors
    // =====================================
    if (err.http_code) {
        statusCode = err.http_code;
        message = `Cloudinary Error: ${err.message}`;
    }

    // =====================================
    // Response Payload
    // =====================================
    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};

module.exports = errorMiddleware;