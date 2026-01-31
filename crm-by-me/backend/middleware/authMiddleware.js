/**
 * Authentication & Authorization Middleware
 * Handles JWT validation, role-based access, and company association
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ROLES } = require('../models/User');

/**
 * Protect routes - Verify JWT token
 */
const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No authentication token provided.'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        const user = await User.findById(decoded.id)
            .select('-password')
            .populate('companyId', 'companyName isActive');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Token is invalid.'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Your account has been deactivated. Contact administrator.'
            });
        }

        // Check if company is active
        if (!user.companyId || !user.companyId.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Your company account is inactive. Contact support.'
            });
        }

        // Attach user to request object
        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please log in again.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please log in again.'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Authentication error.',
            error: error.message
        });
    }
};

/**
 * Authorize by role - Check if user has required role(s)
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. This action requires ${roles.join(' or ')} role.`
            });
        }

        next();
    };
};

/**
 * Admin only middleware
 */
const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== ROLES.ADMIN) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

/**
 * Check company association - Ensure user belongs to the correct company
 */
const checkCompanyAccess = (req, res, next) => {
    const requestedCompanyId = req.params.companyId || req.body.companyId;

    if (requestedCompanyId && req.user.companyId.toString() !== requestedCompanyId) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. You can only access your own company data.'
        });
    }

    next();
};

/**
 * Rate limiting by user (simple implementation)
 */
const rateLimitMap = new Map();

const rateLimit = (maxRequests = 100, windowMs = 60000) => {
    return (req, res, next) => {
        const key = req.ip || req.user?.id || 'anonymous';
        const now = Date.now();
        
        if (!rateLimitMap.has(key)) {
            rateLimitMap.set(key, { count: 1, startTime: now });
            return next();
        }

        const record = rateLimitMap.get(key);

        if (now - record.startTime > windowMs) {
            // Reset window
            rateLimitMap.set(key, { count: 1, startTime: now });
            return next();
        }

        if (record.count >= maxRequests) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.'
            });
        }

        record.count++;
        next();
    };
};

module.exports = {
    protect,
    authorize,
    adminOnly,
    checkCompanyAccess,
    rateLimit,
    ROLES
};