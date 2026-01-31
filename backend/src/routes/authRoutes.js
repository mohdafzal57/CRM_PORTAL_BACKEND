const express = require('express');
const authController = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../utils/validators');
const validateRequest = require('../middlewares/validateRequest');
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

router.post(
    '/register',
    registerValidator,
    validateRequest,
    authController.register
);

router.post(
    '/login',   
    loginValidator,
    validateRequest,
    authController.login
);

router.post('/refresh', authController.refreshToken);

router.post('/logout', protect, authController.logout);

module.exports = router;