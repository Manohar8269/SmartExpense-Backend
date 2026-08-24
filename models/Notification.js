const mongoose = require("mongoose");

const notificationSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      alertKey: {
        type: String,
        required: true,
        trim: true,
      },

      type: {
        type: String,
        enum: [
          "danger",
          "warning",
          "success",
          "info",
        ],
        default: "info",
      },

      icon: {
        type: String,
        default: "🔔",
      },

      title: {
        type: String,
        required: true,
        trim: true,
      },

      message: {
        type: String,
        required: true,
        trim: true,
      },

      read: {
        type: Boolean,
        default: false,
      },

      dismissed: {
        type: Boolean,
        default: false,
      },

      expiresAt: {
        type: Date,
        default: () =>
          new Date(
            Date.now() +
              30 *
                24 *
                60 *
                60 *
                1000
          ),
      },
    },
    {
      timestamps: true,
    }
  );

// Active notification uniqueness
notificationSchema.index(
  {
    userId: 1,
    alertKey: 1,
    dismissed: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      dismissed: false,
    },
  }
);

// MongoDB automatically removes
// documents after expiresAt
notificationSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  }
);

module.exports =
  mongoose.model(
    "Notification",
    notificationSchema
  );