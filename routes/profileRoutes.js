const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/profileController");

// Get profile
router.get("/", protect, getProfile);

// Update profile
router.put("/", protect, updateProfile);

// Change password
router.put("/password", protect, changePassword);

// Delete account
router.delete("/", protect, deleteAccount);

module.exports = router;