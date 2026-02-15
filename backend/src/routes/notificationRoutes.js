const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
    getMyNotifications,
    markAsRead,
    markAllAsRead
} = require('../controllers/notificationController');

router.use(protect); // All routes require authentication

router.get('/', getMyNotifications);
router.put('/:id/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);

module.exports = router;
