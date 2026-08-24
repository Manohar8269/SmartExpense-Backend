const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getNotifications,
  getNotificationHistory,
  createNotification,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  clearAllNotifications,
} = require("../controllers/notificationController");

// Get notifications
router.get(
  "/",
  protect,
  getNotifications
);

// Notification history
 router.get(
  "/history",
  protect,
  getNotificationHistory
);


// Create notification
router.post(
  "/",
  protect,
  createNotification
);

// Mark all as read
router.put(
  "/read-all",
  protect,
  markAllAsRead
);

// Clear all
router.delete(
  "/clear-all",
  protect,
  clearAllNotifications
);

// Mark one as read
router.put(
  "/:id/read",
  protect,
  markAsRead
);

// Dismiss one
router.delete(
  "/:id",
  protect,
  dismissNotification
);

module.exports = router;