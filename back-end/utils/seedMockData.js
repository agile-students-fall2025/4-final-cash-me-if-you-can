const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const mockAccounts = require('../data/mockAccounts.json');
const mockTransactions = require('../data/mockTransactions.json');
const { syncVectorStore } = require('./vectorStore');

/**
 * Check if demo mode is enabled
 */
const isDemoMode = () => {
  if (process.env.DEMO_MODE === 'true') {
    return true;
  }
  return !process.env.PLAID_CLIENT_ID ||
         process.env.PLAID_CLIENT_ID === 'your_plaid_client_id' ||
         process.env.PLAID_CLIENT_ID === '';
};

/**
 * Seed mock accounts and transactions for a user in MongoDB
 * Always seeds mock data for new users to provide a demo experience
 *
 * Note: This mock data is intentionally created for educational purposes
 * and to give users a complete onboarding experience. Users are guided
 * through an interactive tutorial that showcases the app's full capabilities
 * with realistic data. At the end of the tutorial, users can choose to
 * clear this sample data and start with their own transactions.
 */
const seedMockDataForUser = async (userId) => {
  // Always seed mock data for new users (removed demo mode check)
  // This gives all users sample data to explore the app

  try {
    // Check if user already has accounts (don't re-seed)
    const existingAccounts = await Account.findOne({ user_id: userId });
    if (existingAccounts) {
      console.log(`User ${userId} already has data - skipping mock data seeding`);
      return;
    }

    console.log(`Seeding mock data for new user: ${userId}`);

    // Create accounts for this user
    const accountsToInsert = mockAccounts.map(acc => ({
      account_id: `${acc.account_id}_${userId}`,
      user_id: userId,
      item_id: `item_mock_${userId}`,
      bank_name: acc.institution?.name || 'Unknown Bank',
      name: acc.name,
      official_name: acc.official_name,
      type: acc.type,
      subtype: acc.subtype,
      balances: acc.balances,
      mask: acc.mask,
      verification_status: 'verified',
    }));

    await Account.insertMany(accountsToInsert);
    console.log(`Created ${accountsToInsert.length} mock accounts`);

    // Create transactions for this user with recent dates
    const now = new Date();
    const transactionsToInsert = mockTransactions.map((txn, index) => {
      // Make dates relative to today (spread over last 90 days)
      const daysAgo = Math.floor(Math.random() * 90);
      const txnDate = new Date(now);
      txnDate.setDate(txnDate.getDate() - daysAgo);

      return {
        transaction_id: `${txn.transaction_id}_${userId}_${index}`,
        account_id: `${txn.account_id}_${userId}`,
        user_id: userId,
        date: txnDate,
        name: txn.name,
        merchant_name: txn.merchant_name,
        amount: txn.amount,
        category: txn.category || [],
        pending: txn.pending || false,
        payment_channel: txn.payment_channel || 'online',
        currency_code: 'USD',
      };
    });

    await Transaction.insertMany(transactionsToInsert);
    console.log(`Created ${transactionsToInsert.length} mock transactions`);

    // Sync vector store with newly seeded data
    syncVectorStore().catch(err => console.error('Vector sync failed:', err.message));
  } catch (error) {
    console.error('Error seeding mock data:', error.message);
  }
};

module.exports = { seedMockDataForUser, isDemoMode };
