const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || 500;

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        error = new AppError(`${field} already exists`, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        error = new AppError(messages.join(', '), 400);
    }

    // Mongoose cast error
    if (err.name === 'CastError') {
        error = new AppError('Invalid ID format', 400);
    }

    // JWT errors are handled in tokenUtils

    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
        console.error('ERROR:', err);
    }

    // Send response
    res.status(error.statusCode).json({
        status: error.status || 'error',
        message: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;