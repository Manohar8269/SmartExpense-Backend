const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// ==========================================
// Get Profile
// ==========================================
const getProfile = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    const user = await User.findById(
      req.userId
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error(
      "Get Profile Error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching profile",
    });
  }
};

// ==========================================
// Update Profile
// ==========================================
const updateProfile = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    const user = await User.findById(
      req.userId
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.name = name.trim();

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(
      "Update Profile Error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while updating profile",
    });
  }
};

// ==========================================
// Change Password
// ==========================================
const changePassword = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    // Required fields
    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message:
          "Please provide all password fields",
      });
    }

    // Confirm new password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message:
          "New password and confirm password do not match",
      });
    }

    // Minimum password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        message:
          "New password must be at least 6 characters",
      });
    }

    // Get user with password
    const user = await User.findById(
      req.userId
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Verify current password
    const isPasswordValid =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!isPasswordValid) {
      return res.status(400).json({
        message:
          "Current password is incorrect",
      });
    }

    // Prevent same password
    const isSamePassword =
      await bcrypt.compare(
        newPassword,
        user.password
      );

    if (isSamePassword) {
      return res.status(400).json({
        message:
          "New password must be different from current password",
      });
    }

    // Hash new password
    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      message:
        "Password changed successfully",
    });
  } catch (error) {
    console.error(
      "Change Password Error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while changing password",
    });
  }
};

// ==========================================
// Delete Account
// ==========================================
const deleteAccount = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    // Find user
    const user = await User.findById(
      req.userId
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ==========================================
    // Delete all user's transactions
    // ==========================================
    await Transaction.deleteMany({
      user: req.userId,
    });

    // ==========================================
    // Delete user account
    // ==========================================
    await User.findByIdAndDelete(
      req.userId
    );

    return res.status(200).json({
      message:
        "Account and all associated data deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Account Error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while deleting account",
    });
  }
};

// ==========================================
// Export Controllers
// ==========================================
module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
};