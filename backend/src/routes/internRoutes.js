/**
 * Intern Routes
 * Routes for intern-specific operations
 */

const express = require('express');
const router = express.Router();
const internController = require('../controllers/internController');

// Import auth middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// Apply protection to all routes
router.use(protect);
router.use(authorize('INTERN'));

// Profile routes
router.get('/profile', internController.getInternProfile);
router.put('/profile', internController.updateInternProfile);

// Task routes
router.get('/tasks', internController.getTaskHistory);
router.post('/tasks', internController.submitDailyTask);
router.get('/assigned-tasks', internController.getAssignedTasks);
router.patch('/assigned-tasks/:taskId', internController.updateAssignedTaskStatus);

// Report routes
router.post('/reports', internController.submitWeeklyReport);

module.exports = router;
