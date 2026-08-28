const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

/**
 * Express Middleware to handle request validation errors.
 * Extracts errors caught by express-validator rules.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    // If there are no validation errors, move to the next middleware/controller
    if (errors.isEmpty()) {
        return next();
    }

    // Extract and format error messages
    const extractedErrors = errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
    }));

    // Construct a clear single error summary message for top-level logging
    const firstErrorMessage = extractedErrors[0]?.message || "Validation Error";

    // Option 1: Throw custom ApiError if you have global error handler
    // (Passes 400 Bad Request status instead of 500 Internal Server Error)
    const error = new ApiError(400, firstErrorMessage, extractedErrors);
    return next(error);

    /* 
    // Option 2: Direct response (Use this if you don't have a global error middleware)
    return res.status(400).json({
      success: false,
      message: firstErrorMessage,
      errors: extractedErrors,
    });
    */
};

module.exports = validate;