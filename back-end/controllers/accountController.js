const Account = require('../models/Account');
const { v4: uuidv4 } = require('uuid');

// Get all accounts for a user
exports.getAccounts = async (req, res) => {
  try {
    const userId = req.user?.id || '673e8d9a5e9e123456789abc';

    // For demo: return mock data from JSON file
    const mockAccounts = require('../data/mockAccounts.json');

    res.json({
      accounts: mockAccounts,
      total_balance: mockAccounts.reduce((sum, acc) => sum + acc.balances.current, 0)
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

    // For demo: return from mock data
    const mockAccounts = require('../data/mockAccounts.json');
    const account = mockAccounts.find(acc => acc.account_id === accountId);

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
    const newAccount = {
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
      last_sync: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // In production, save to MongoDB:
    // const account = new Account(newAccount);
    // await account.save();

    // For demo: append to mock data file
    const fs = require('fs');
    const path = require('path');
    const mockFilePath = path.join(__dirname, '../data/mockAccounts.json');
    const mockAccounts = require('../data/mockAccounts.json');
    mockAccounts.push(newAccount);
    fs.writeFileSync(mockFilePath, JSON.stringify(mockAccounts, null, 2));

    res.status(201).json(newAccount);
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

    // For demo: update in mock data
    const fs = require('fs');
    const path = require('path');
    const mockFilePath = path.join(__dirname, '../data/mockAccounts.json');
    const mockAccounts = require('../data/mockAccounts.json');

    const accountIndex = mockAccounts.findIndex(acc => acc.account_id === accountId);

    if (accountIndex === -1) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Update fields
    if (bank_name) mockAccounts[accountIndex].bank_name = bank_name;
    if (name) mockAccounts[accountIndex].name = name;
    if (type) mockAccounts[accountIndex].type = type;
    if (subtype) mockAccounts[accountIndex].subtype = subtype;
    if (current_balance !== undefined) {
      mockAccounts[accountIndex].balances.current = parseFloat(current_balance);
      mockAccounts[accountIndex].balances.available = parseFloat(current_balance);
    }
    if (mask) mockAccounts[accountIndex].mask = mask;
    mockAccounts[accountIndex].updatedAt = new Date();

    fs.writeFileSync(mockFilePath, JSON.stringify(mockAccounts, null, 2));

    res.json(mockAccounts[accountIndex]);
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

    // For demo: remove from mock data
    const fs = require('fs');
    const path = require('path');
    const mockFilePath = path.join(__dirname, '../data/mockAccounts.json');
    const mockAccounts = require('../data/mockAccounts.json');

    const accountIndex = mockAccounts.findIndex(acc => acc.account_id === accountId);

    if (accountIndex === -1) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Remove account
    const deletedAccount = mockAccounts.splice(accountIndex, 1)[0];
    fs.writeFileSync(mockFilePath, JSON.stringify(mockAccounts, null, 2));

    res.json({ message: 'Account deleted successfully', account: deletedAccount });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};
