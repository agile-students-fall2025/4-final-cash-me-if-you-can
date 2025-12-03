const User = require("../models/User");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const bcrypt = require("bcrypt");

exports.getMe = async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
  });
};

exports.updateMe = async (req, res) => {
  try {
    const updates = {};
    const { firstName, lastName, email, password } = req.body;

    if (firstName) updates.first_name = firstName;
    if (lastName) updates.last_name = lastName;
    if (email) updates.email = email;
    if (password) updates.password_hash = await bcrypt.hash(password, 10);

    const updated = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
    });

    res.json({
      user: {
        firstName: updated.first_name,
        lastName: updated.last_name,
        email: updated.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMe = async (req, res) => {
  try {
    const userId = req.userId;

    // Delete all user's transactions
    await Transaction.deleteMany({ user_id: userId });

    // Delete all user's accounts
    await Account.deleteMany({ user_id: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
