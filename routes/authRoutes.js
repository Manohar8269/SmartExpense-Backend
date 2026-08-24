const express = require("express");

const router = express.Router();

const { registerUser, loginUser } = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

// Register / Signup
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Protected Test Route
router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    message: "You are authorized",
    userId: req.userId,
  });
});

module.exports = router;