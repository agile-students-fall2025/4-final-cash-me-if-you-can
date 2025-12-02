const Account = require('../models/Account');
const { v4: uuidv4 } = require('uuid');

// Get all accounts for a user
exports.getAccounts = async (req, res) => {
  try {
    const userId = req.user?.id || '673e8d9a5e9e123456789abc';

    const accounts = await Account.find();

    const total_balance = accounts.reduce((sum, acc) => sum + acc.balances.current, 0);

    res.json({
      accounts,
      total_balance
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
};

// Get single account by ID
exports.getAccountById = async (req, res) => {
  try {
    const userId = req.user?.id || '673e8d9a5e9e123456789abc';
    const accountId = req.params.id;

    const account = await Account.findOne({
      $or: [
        { account_id: accountId },
        { _id: accountId }
      ]
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(account);
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({ error: 'Failed to fetch account' });
  }
};

// Create new manual account
exports.createAccount = async (req, res) => {
  try {
    const userId = req.user?.id || '673e8d9a5e9e123456789abc';
    const { bank_name, name, type, subtype, current_balance, mask } = req.body;

    // Validation
    if (!bank_name || !name || !type || !subtype || current_balance === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: bank_name, name, type, subtype, current_balance'
      });
    }

    // Create account object
    const accountData = {
      account_id: `manual_${uuidv4()}`,
      user_id: userId,
      is_manual: true,
      bank_name,
      name,
      type,
      subtype,
      balances: {
        current: parseFloat(current_balance),
        available: parseFloat(current_balance),
        currency: 'USD'
      },
      mask: mask || null,
      verification_status: 'verified',
      last_sync: new Date()
    };

    // Save to MongoDB
    const account = new Account(accountData);
    await account.save();

    res.status(201).json(account);
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
};

// Update account
exports.updateAccount = async (req, res) => {
  try {
    const userId = req.user?.id || '673e8d9a5e9e123456789abc';
    const accountId = req.params.id;
    const { bank_name, name, type, subtype, current_balance, mask } = req.body;

    // Find account by account_id or MongoDB _id
    const account = await Account.findOne({
      $or: [
        { account_id: accountId },
        { _id: accountId }
      ]
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Update fields
    if (bank_name) account.bank_name = bank_name;
    if (name) account.name = name;
    if (type) account.type = type;
    if (subtype) account.subtype = subtype;
    if (current_balance !== undefined) {
      account.balances.current = parseFloat(current_balance);
      account.balances.available = parseFloat(current_balance);
    }
    if (mask) account.mask = mask;
    account.last_sync = new Date();

    await account.save();

    res.json(account);
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ error: 'Failed to update account' });
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user?.id || '673e8d9a5e9e123456789abc';
    const accountId = req.params.id;

    // Find and delete account by account_id or MongoDB _id
    const account = await Account.findOneAndDelete({
      $or: [
        { account_id: accountId },
        { _id: accountId }
      ]
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ message: 'Account deleted successfully', account });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};
