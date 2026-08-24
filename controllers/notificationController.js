const Notification = require("../models/Notification");

// ==========================================
// Get Notifications
// ==========================================
const getNotifications = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    const notifications = await Notification.find({
      userId: req.userId,
      dismissed: false,
    })
      .sort({
        createdAt: -1,
      })
      .limit(50);

    return res.status(200).json({
      notifications,
    });
  } catch (error) {
    console.error(
      "Get Notifications Error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching notifications",
    });
  }
};

// ==========================================
// Get Notification History
// ==========================================
const getNotificationHistory = async (
  req,
  res
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message:
          "User authentication required",
      });
    }

    // ==========================================
    // Pagination
    // ==========================================
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 10,
        1
      ),
      50
    );

    const skip =
      (page - 1) * limit;

    // ==========================================
    // Query
    // ==========================================
    const query = {
      userId: req.userId,
      dismissed: false,
    };

    // ==========================================
    // Fetch Notifications + Total Count
    // ==========================================
    const [
      notifications,
      total,
    ] = await Promise.all([
      Notification.find(query)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit),

      Notification.countDocuments(query),
    ]);

    // ==========================================
    // Response
    // ==========================================
    return res.status(200).json({
      notifications,
      page,
      limit,
      total,
      totalPages: Math.ceil(
        total / limit
      ),
    });
  } catch (error) {
    console.error(
      "Get Notification History Error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching notification history",
    });
  }
};

// ==========================================
// Create Notification
// ==========================================
const createNotification = async (
  req,
  res
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message:
          "User authentication required",
      });
    }

    const {
      alertKey,
      type,
      icon,
      title,
      message,
    } = req.body;

    // ==========================================
    // Validation
    // ==========================================
    if (
      !alertKey ||
      !title ||
      !message
    ) {
      return res.status(400).json({
        message:
          "Alert key, title and message are required",
      });
    }

    // ==========================================
    // Check Existing Active Notification
    // ==========================================
    const existingNotification =
      await Notification.findOne({
        userId: req.userId,
        alertKey,
        dismissed: false,
      });

    if (existingNotification) {
      return res.status(200).json({
        message:
          "Notification already exists",
        notification:
          existingNotification,
        alreadyExists: true,
      });
    }

    // ==========================================
    // Create Notification
    // ==========================================
    const notification =
      await Notification.create({
        userId: req.userId,
        alertKey,
        type: type || "info",
        icon: icon || "🔔",
        title,
        message,
        read: false,
        dismissed: false,
      });

    return res.status(201).json({
      message:
        "Notification created successfully",
      notification,
      alreadyExists: false,
    });
  } catch (error) {
    console.error(
      "Create Notification Error:",
      error
    );

    // ==========================================
    // MongoDB Duplicate Key Protection
    // ==========================================
    if (error?.code === 11000) {
      const existing =
        await Notification.findOne({
          userId: req.userId,
          alertKey:
            req.body.alertKey,
          dismissed: false,
        });

      return res.status(200).json({
        message:
          "Notification already exists",
        notification: existing,
        alreadyExists: true,
      });
    }

    return res.status(500).json({
      message:
        "Server error while creating notification",
    });
  }
};

// ==========================================
// Mark Notification As Read
// ==========================================
const markAsRead = async (
  req,
  res
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message:
          "User authentication required",
      });
    }

    const { id } = req.params;

    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: id,
          userId: req.userId,
          dismissed: false,
        },
        {
          $set: {
            read: true,
          },
        },
        {
          new: true,
        }
      );

    if (!notification) {
      return res.status(404).json({
        message:
          "Notification not found",
      });
    }

    return res.status(200).json({
      message:
        "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error(
      "Mark Notification Read Error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while updating notification",
    });
  }
};

// ==========================================
// Mark All Notifications As Read
// ==========================================
const markAllAsRead = async (
  req,
  res
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message:
          "User authentication required",
      });
    }

    const result =
      await Notification.updateMany(
        {
          userId: req.userId,
          dismissed: false,
          read: false,
        },
        {
          $set: {
            read: true,
          },
        }
      );

    return res.status(200).json({
      message:
        "All notifications marked as read",
      modifiedCount:
        result.modifiedCount,
    });
  } catch (error) {
    console.error(
      "Mark All Notifications Read Error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while updating notifications",
    });
  }
};

// ==========================================
// Dismiss Notification
// ==========================================
const dismissNotification = async (
  req,
  res
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message:
          "User authentication required",
      });
    }

    const { id } = req.params;

    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: id,
          userId: req.userId,
          dismissed: false,
        },
        {
          $set: {
            dismissed: true,
          },
        },
        {
          new: true,
        }
      );

    if (!notification) {
      return res.status(404).json({
        message:
          "Notification not found",
      });
    }

    return res.status(200).json({
      message:
        "Notification dismissed",
      notification,
    });
  } catch (error) {
    console.error(
      "Dismiss Notification Error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while dismissing notification",
    });
  }
};

// ==========================================
// Clear All Notifications
// ==========================================
const clearAllNotifications = async (
  req,
  res
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message:
          "User authentication required",
      });
    }

    const result =
      await Notification.updateMany(
        {
          userId: req.userId,
          dismissed: false,
        },
        {
          $set: {
            dismissed: true,
          },
        }
      );

    return res.status(200).json({
      message:
        "All notifications dismissed",
      modifiedCount:
        result.modifiedCount,
    });
  } catch (error) {
    console.error(
      "Clear All Notifications Error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while clearing notifications",
    });
  }
};

// ==========================================
// Export Controllers
// ==========================================
module.exports = {
  getNotifications,
  getNotificationHistory,
  createNotification,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  clearAllNotifications,
};