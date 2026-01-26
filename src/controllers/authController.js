const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    const result = await authService.register({ name, email, password, role });

    res.status(201).json({
        status: 'success',
        data: {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        },
    });
});

const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.status(200).json({
        status: 'success',
        data: {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        },
    });
});

const refreshToken = asyncHandler(async (req, res, next) => {
    const { refreshToken } = req.body;

    const tokens = await authService.refreshTokens(refreshToken);

    res.status(200).json({
        status: 'success',
        data: tokens,
    });
});

const logout = asyncHandler(async (req, res, next) => {
    await authService.logout(req.user.userId);

    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully',
    });
});

module.exports = {
    register,
    login,
    refreshToken,
    logout,
};