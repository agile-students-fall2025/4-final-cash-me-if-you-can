const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Check if user exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create new user
    const user = await User.create({
      email,
      password_hash,
      first_name,
      last_name,
    });

    res.json({ message: "User registered successfully", user_id: user._id });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    // Compare password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;