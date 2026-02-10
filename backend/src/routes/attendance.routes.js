/**
 * Attendance Routes
 * Routes for employee/intern attendance marking
 */

const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');

// Import middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Check In - Employee & Intern
router.post(
  '/check-in',
  authorize('EMPLOYEE', 'INTERN'),
  attendanceController.checkIn
);

// Check Out - Employee & Intern
router.post(
  '/check-out',
  authorize('EMPLOYEE', 'INTERN'),
  attendanceController.checkOut
);

// Get My Attendance History
router.get(
  '/my-history',
  authorize('EMPLOYEE', 'INTERN'),
  attendanceController.getMyAttendanceHistory
);

// Request Correction
router.post(
  '/correction',
  authorize('EMPLOYEE', 'INTERN'),
  attendanceController.requestCorrection
);

module.exports = router;