class ApiError extends Error {
    /**
     * @param {number} statusCode - HTTP Status Code (e.g., 400, 404, 500)
     * @param {string} message - Custom Error Message
     * @param {Array} errors - Detailed errors array (optional, useful for validation errors)
     * @param {string} stack - Custom stack trace (optional)
     */
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

module.exports = ApiError;