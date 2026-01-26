const User = require('../models/User');
const { verifyAccessToken } = require('../utils/tokenUtils');
const AppError = require('../utils/AppError');

const protect = async (req, res, next) => {
    try {
        let token;

        // Extract token from Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('Authentication required. Please log in.', 401));
        }

        // Verify token
        const decoded = verifyAccessToken(token);

        // Check if user still exists
        const user = await User.findById(decoded.userId).select('+isActive');

        if (!user) {
            return next(new AppError('User no longer exists', 401));
        }

        // Check if user is active
        if (!user.isActive) {
            return next(new AppError('Your account has been deactivated', 403));
        }

        // Attach user to request
        req.user = {
            userId: user._id,
            email: user.email,
            role: user.role,
        };

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = protect;