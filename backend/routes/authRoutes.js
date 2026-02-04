/**
 * Authentication Routes
 * Defines all auth-related endpoints
 */

const express = require('express');
const router = express.Router();
const {
    registerAdmin,
    adminLogin,
    employeeLogin,
    getMe,
    logout,
    registerValidation,
    loginValidation
} = require('../controllers/authController');
const { protect, rateLimit } = require('../middleware/authMiddleware');
const { upload, handleUploadError } = require('../utils/upload');

/**
 * @route   POST /api/auth/register
 * @desc    Register new admin with company
 * @access  Public (but only creates ADMIN role)
 */
router.post(
    '/register',
    rateLimit(5, 60000), // 5 requests per minute
    upload.single('companyLogo'),
    handleUploadError,
    registerValidation,
    registerAdmin
);

/**
 * @route   POST /api/auth/admin/login
 * @desc    Admin login
 * @access  Public
 */
router.post(
    '/admin/login',
    rateLimit(10, 60000), // 10 requests per minute
    loginValidation,
    adminLogin
);

/**
 * @route   POST /api/auth/employee/login
 * @desc    Employee login (HR, Manager, Employee, Intern)
 * @access  Public
 */
router.post(
    '/employee/login',
    rateLimit(10, 60000), // 10 requests per minute
    loginValidation,
    employeeLogin
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get('/me', protect, getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', protect, logout);

/**
 * @route   GET /api/auth/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Auth service is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;