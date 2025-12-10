const Account = require('../models/Account');
const { v4: uuidv4 } = require('uuid');
const { syncVectorStore } = require('../utils/vectorStore');

// Get all accounts for a user
exports.getAccounts = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware

    // Fetch only accounts for this user
    const accounts = await Account.find({ user_id: userId });

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
    const userId = req.userId;
    const accountId = req.params.id;

    let account;

    // Check if accountId is a valid MongoDB ObjectId (24 hex characters)
    if (accountId.match(/^[0-9a-fA-F]{24}$/)) {
      account = await Account.findOne({
        $or: [
          { account_id: accountId },
          { _id: accountId }
        ]
      });
    } else {
      // Search only by account_id for UUID strings
      account = await Account.findOne({ account_id: accountId });
    }

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
    const userId = req.userId;
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

    // Sync vector store with new account data
    syncVectorStore().catch(err => console.error('[accountController] Vector sync failed:', err.message));

    res.status(201).json(account);
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
};

// Update account
exports.updateAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const accountId = req.params.id;
    const { bank_name, name, type, subtype, current_balance, mask } = req.body;

    let account;

    // Check if accountId is a valid MongoDB ObjectId (24 hex characters)
    if (accountId.match(/^[0-9a-fA-F]{24}$/)) {
      account = await Account.findOne({
        $or: [
          { account_id: accountId },
          { _id: accountId }
        ]
      });
    } else {
      // Search only by account_id for UUID strings
      account = await Account.findOne({ account_id: accountId });
    }

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

    // Sync vector store with updated account data
    syncVectorStore().catch(err => console.error('[accountController] Vector sync failed:', err.message));

    res.json(account);
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ error: 'Failed to update account' });
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const accountId = req.params.id;

    // Build query - only include _id if it's a valid ObjectId
    const query = { account_id: accountId };

    // Check if accountId is a valid MongoDB ObjectId (24 hex characters)
    if (accountId.match(/^[0-9a-fA-F]{24}$/)) {
      // If valid ObjectId, search by both account_id and _id
      const account = await Account.findOneAndDelete({
        $or: [
          { account_id: accountId },
          { _id: accountId }
        ]
      });

      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      // Sync vector store after account deletion
      syncVectorStore().catch(err => console.error('[accountController] Vector sync failed:', err.message));

      return res.json({ message: 'Account deleted successfully', account });
    }

    // Otherwise, only search by account_id (e.g., for manual_ UUIDs)
    const account = await Account.findOneAndDelete(query);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Sync vector store after account deletion
    syncVectorStore().catch(err => console.error('[accountController] Vector sync failed:', err.message));

    res.json({ message: 'Account deleted successfully', account });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};
