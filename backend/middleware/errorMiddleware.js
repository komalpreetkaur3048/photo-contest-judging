
 // Handle routes that do not exist
export const notFound = (req, res, next) => {
    const error = new Error(`Route Not Found - ${req.originalUrl}`);

    res.status(404);
    next(error);
};

// Handle application errors
export const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode;

    if (statusCode === 200) {
        statusCode = 500;
    }

    let message = err.message;

    // Handle invalid MongoDB ObjectId
    if (err.name === "CastError" && err.kind === "ObjectId") {
        statusCode = 400;
        message = "Resource not found (Invalid ID format).";
    }

    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
        statusCode = 400;

        const errors = Object.values(err.errors);
        const messages = errors.map((error) => error.message);

        message = messages.join(", ");
    }

    return res.status(statusCode).json({
        success: false,
        message: message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack
    });
};
