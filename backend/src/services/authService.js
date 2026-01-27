const User = require('../models/User');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} = require('../utils/tokenUtils');
const AppError = require('../utils/AppError');

class AuthService {
    async register(userData) {
        const { name, email, password, role } = userData;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError('Email already registered', 400);
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'Sales',
        });

        // Generate tokens
        const accessToken = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id);

        // Store refresh token
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return {
            user,
            accessToken,
            refreshToken,
        };
    }

    async login(email, password) {
        // Find user with password field
        const user = await User.findOne({ email }).select('+password +isActive');

        if (!user || !(await user.comparePassword(password))) {
            throw new AppError('Invalid email or password', 401);
        }

        // Check if user is active
        if (!user.isActive) {
            throw new AppError('Your account has been deactivated', 403);
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id);

        // Store refresh token
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return {
            user,
            accessToken,
            refreshToken,
        };
    }

    async refreshTokens(refreshToken) {
        if (!refreshToken) {
            throw new AppError('Refresh token required', 401);
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Find user and verify stored token matches
        const user = await User.findById(decoded.userId).select('+refreshToken');

        if (!user || user.refreshToken !== refreshToken) {
            throw new AppError('Invalid refresh token', 401);
        }

        // Generate new tokens
        const newAccessToken = generateAccessToken(user._id, user.role);
        const newRefreshToken = generateRefreshToken(user._id);

        // Update stored refresh token
        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }

    async logout(userId) {
        const user = await User.findById(userId);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Clear refresh token
        user.refreshToken = null;
        await user.save({ validateBeforeSave: false });

        return { message: 'Logged out successfully' };
    }
}

module.exports = new AuthService();