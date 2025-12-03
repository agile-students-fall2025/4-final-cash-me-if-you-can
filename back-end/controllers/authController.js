const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { seedMockDataForUser } = require("../utils/seedMockData");

exports.signup = async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already in use" });

    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      first_name: firstName,
      last_name: lastName,
      password_hash,
    });

    // Seed mock data for new user in demo mode
    await seedMockDataForUser(user._id.toString());

    return res.json({ message: "User created", user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      token,
      user: {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
