// routes/adminRoutes.js
// NEW ROUTES FILE - All admin routes consolidated
// Integrates with existing auth middleware

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Import existing middleware (already implemented)
const { protect, authorize } = require('../middleware/authMiddleware');

// Apply admin protection to all routes
router.use(protect);
router.use(authorize('ADMIN'));

// ==================== DASHBOARD ====================
router.get('/dashboard', adminController.getDashboardStats);

// ==================== USER MANAGEMENT ====================
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);

// ==================== ATTENDANCE ====================
router.get('/attendance', adminController.getAttendance);
router.get('/attendance/summary', adminController.getAttendanceSummary);
router.get('/attendance/geo-logs', adminController.getGeoLogs);
router.post('/attendance/manual', adminController.createManualAttendance);

// ==================== WORK REPORTS ====================
router.get('/reports', adminController.getWorkReports);
router.put('/reports/:id/review', adminController.reviewWorkReport);

// ==================== EXPORT ====================
router.post('/export', adminController.exportData);

// ==================== SETTINGS ====================
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

module.exports = router;

// ==================== INTEGRATION INSTRUCTIONS ====================
// Add to your existing server.js or app.js:
//
// const adminRoutes = require('./routes/adminRoutes');
// app.use('/api/admin', adminRoutes);