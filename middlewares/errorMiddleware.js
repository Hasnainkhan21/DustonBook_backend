const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // Log error for developers
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }

    res.status(statusCode).json({
        message: err.message || 'Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

module.exports = { errorHandler, notFound };
