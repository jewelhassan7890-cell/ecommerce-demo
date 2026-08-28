const notFoundMiddleware = (req, res, next) => {

    const error = new Error(

        `Route Not Found - ${req.originalUrl}`

    );

    res.status(404);

    next(error);

};

module.exports = notFoundMiddleware;