// 404 Not Found Handler
export const notFound = (req, res, next) => {
    const error = new Error(`Route Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Centralized Error Handler
export const errorHandler = (err, req, res, next) => {
    // If statusCode is still 200, default to 500
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Handle Mongoose invalid ObjectId (CastError)
    if (err.name === "CastError" && err.kind === "ObjectId") {
        statusCode = 400;
        message = "Resource not found (Invalid ID format).";
    }

    // Handle Mongoose ValidationError
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(", ");
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack
    });
};
