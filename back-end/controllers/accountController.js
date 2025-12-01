const Account = require('../models/Account');

const DEFAULT_USER_ID = '673e8d9a5e9e123456789abc';

const getAccounts = async (req, res) => {
  try {
    const userId = req.user?.id || DEFAULT_USER_ID;
    const accounts = await Account.find({ user_id: userId }).sort({ createdAt: -1 });

    res.json({
      accounts,
      total: accounts.length,
    });
  } catch (error) {
    console.error('Error getting accounts:', error);
    res.status(500).json({ error: 'Failed to get accounts' });
  }
};

const getAccountById = async (req, res) => {
  try {
    const userId = req.user?.id || DEFAULT_USER_ID;
    const { id } = req.params;

    const account = await Account.findById(id);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (account.user_id.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(account);
  } catch (error) {
    console.error('Error getting account:', error);
    res.status(500).json({ error: 'Failed to get account' });
  }
};

const createAccount = async (req, res) => {
  try {
    const userId = req.user?.id || DEFAULT_USER_ID;

    const existingAccount = await Account.findOne({
      account_id: req.body.account_id
    });

    if (existingAccount) {
      return res.status(409).json({ error: 'Account already exists' });
    }

    const account = await Account.create({
      ...req.body,
      user_id: userId,
    });

    res.status(201).json({
      account,
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error('Error creating account:', error);
    if (error.code === 11000) {
      res.status(409).json({ error: 'Account with this ID already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create account' });
    }
  }
};

const updateAccount = async (req, res) => {
  try {
    const userId = req.user?.id || DEFAULT_USER_ID;
    const { id } = req.params;

    const account = await Account.findById(id);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (account.user_id.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await Account.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      account: updated,
      message: 'Account updated successfully',
    });
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ error: 'Failed to update account' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user?.id || DEFAULT_USER_ID;
    const { id } = req.params;

    const account = await Account.findById(id);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (account.user_id.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await Account.findByIdAndDelete(id);

    res.json({
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

module.exports = {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
};
