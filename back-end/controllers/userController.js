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

exports.clearMyData = async (req, res) => {
  try {
    const userId = req.userId;

    // Delete all user's transactions
    const deletedTransactions = await Transaction.deleteMany({ user_id: userId });

    // Delete all user's accounts
    const deletedAccounts = await Account.deleteMany({ user_id: userId });

    res.json({
      message: "All data cleared successfully",
      deleted: {
        transactions: deletedTransactions.deletedCount,
        accounts: deletedAccounts.deletedCount,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
