/**
 * Admin Routes
 * All admin-related API endpoints
 */

const express = require('express');
const router = express.Router();

// Import middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// Import controllers
const adminController = require('../controllers/adminController');
const attendanceController = require('../controllers/attendanceController');
const workReportController = require('../controllers/workReportController');
const exportController = require('../controllers/exportController');
const settingsController = require('../controllers/settingsController');

// All routes require authentication
router.use(protect);

// ==================== DASHBOARD ====================
router.get('/dashboard', authorize('ADMIN', 'HR'), adminController.getDashboardStats);

// ==================== USER MANAGEMENT ====================
router.get('/users', authorize('ADMIN', 'HR'), adminController.getUsers);
router.post('/users', authorize('ADMIN', 'HR'), adminController.createUser);
// router.get('/users/:id', authorize('ADMIN', 'HR'), adminController.getUserById);
router.put('/users/:id', authorize('ADMIN', 'HR'), adminController.updateUser);
router.patch('/users/:id/toggle-status', authorize('ADMIN', 'HR'), adminController.toggleUserStatus);
router.delete('/users/:id', authorize('ADMIN'), adminController.deleteUser);

// ==================== INTERN MANAGEMENT ====================
router.get('/interns/:userId', authorize('ADMIN', 'HR', 'MANAGER'), adminController.getInternDetails);
router.put('/interns/:userId', authorize('ADMIN', 'HR'), adminController.updateInternByAdmin);
router.post('/interns/:userId/assign-task', authorize('ADMIN', 'HR', 'MANAGER'), adminController.assignTaskToIntern);

// ==================== ATTENDANCE ====================
router.get('/attendance', authorize('ADMIN', 'HR'), attendanceController.getAttendance);
router.get('/attendance/summary', authorize('ADMIN', 'HR'), attendanceController.getAttendanceSummary);
router.get('/attendance/geo-logs', authorize('ADMIN', 'HR'), attendanceController.getGeoLogs);
router.post('/attendance/manual', authorize('ADMIN', 'HR'), attendanceController.createManualAttendance);
router.put('/attendance/:id', authorize('ADMIN', 'HR'), attendanceController.updateAttendance);
router.delete('/attendance/:id', authorize('ADMIN'), attendanceController.deleteAttendance);

// ==================== WORK REPORTS ====================
router.get('/reports', authorize('ADMIN', 'HR', 'MANAGER'), workReportController.getWorkReports);
router.get('/reports/pending-count', authorize('ADMIN', 'HR', 'MANAGER'), workReportController.getPendingCount);
router.get('/reports/:id', authorize('ADMIN', 'HR', 'MANAGER'), workReportController.getWorkReportById);
router.put('/reports/:id/review', authorize('ADMIN', 'HR', 'MANAGER'), workReportController.reviewWorkReport);
router.delete('/reports/:id', authorize('ADMIN'), workReportController.deleteWorkReport);

// ==================== EXPORT ====================
router.post('/export', authorize('ADMIN', 'HR'), exportController.exportData);

// ==================== SETTINGS ====================
router.get('/settings', authorize('ADMIN'), settingsController.getSettings);
router.put('/settings', authorize('ADMIN'), settingsController.updateSettings);
router.get('/settings/holidays', authorize('ADMIN', 'HR'), settingsController.getHolidays);
router.post('/settings/holidays', authorize('ADMIN'), settingsController.addHoliday);
router.delete('/settings/holidays/:date', authorize('ADMIN'), settingsController.deleteHoliday);

module.exports = router;