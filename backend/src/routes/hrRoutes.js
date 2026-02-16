const express = require('express');
const router = express.Router();
const hr = require('../controllers/hrController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('HR', 'ADMIN'));

// Dashboard
router.get('/dashboard', hr.getDashboard);
router.get('/dashboard/activity', hr.getRecentActivity);

// Attendance
router.get('/attendance/employees', hr.getEmployeesForAttendance);
router.post('/attendance/save', hr.saveAttendance);
router.get('/attendance', hr.getAttendanceRecords);
router.put('/attendance/:id', hr.updateAttendanceRecord);

// Employees
router.get('/employees', hr.getEmployees);
router.get('/employees/:id', hr.getEmployeeDetails);

// Leaves
router.get('/leaves', hr.getLeaveRequests);
router.put('/leaves/:id/review', hr.reviewLeave);

// Interns
router.get('/interns', hr.getInterns);
router.get('/interns/:userId', hr.getInternDetails);
router.post('/interns/:userId/assign-task', hr.assignTask);

// Reports
router.get('/reports/:type', hr.getReport);
router.post('/reports/:type/export', hr.exportReport);

// Profile
router.get('/profile', hr.getMyProfile);
router.put('/profile', hr.updateMyProfile);
router.put('/profile/password', hr.changePassword);

module.exports = router;