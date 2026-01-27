const jwt = require('jsonwebtoken');
const AppError = require('./AppError');

const generateAccessToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRY }
    );
};

const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRY }
    );
};

const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new AppError('Access token expired', 401);
        }
        throw new AppError('Invalid access token', 401);
    }
};

const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new AppError('Refresh token expired', 401);
        }
        throw new AppError('Invalid refresh token', 401);
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};