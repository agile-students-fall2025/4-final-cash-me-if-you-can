require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

const categories = require('../data/categories.json');
const mockAccounts = require('../data/mockAccounts.json');
const mockTransactions = require('../data/mockTransactions.json');

const DEFAULT_USER_ID = '673e8d9a5e9e123456789abc';

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('\nClearing existing data...');
    await Category.deleteMany({});
    await Transaction.deleteMany({});
    await Account.deleteMany({});
    await User.deleteMany({});

    console.log('\n1. Creating default user...');
    const user = await User.create({
      _id: DEFAULT_USER_ID,
      email: 'emily.chen@nyu.edu',
      first_name: 'Emily',
      last_name: 'Chen',
      password_hash: 'hashed_password_here',
      is_active: true,
      email_verified: true,
    });
    console.log(`Created user: ${user.email}`);

    console.log('\n2. Seeding categories...');
    const categoryDocs = categories.map(name => ({
      name,
      system: true,
      keywords: [],
    }));
    await Category.insertMany(categoryDocs);
    console.log(`Seeded ${categoryDocs.length} categories`);

    console.log('\n3. Creating accounts from mock data...');
    const accounts = mockAccounts.map(acc => ({
      account_id: acc.account_id,
      user_id: user._id,
      item_id: `item_${acc.institution?.institution_id || 'manual'}`,
      bank_name: acc.institution?.name || 'Unknown',
      name: acc.name,
      official_name: acc.official_name,
      type: acc.type,
      subtype: acc.subtype === 'credit card' ? 'credit card' : acc.subtype,
      balances: {
        current: acc.balances.current,
        available: acc.balances.available,
        limit: acc.balances.limit,
        currency: acc.balances.iso_currency_code || 'USD',
      },
      mask: acc.mask,
      verification_status: 'verified',
      is_manual: false,
    }));

    await Account.insertMany(accounts);
    console.log(`Created ${accounts.length} accounts`);

    console.log('\n4. Creating transactions from mock data...');
    const transactions = mockTransactions.map(txn => ({
      transaction_id: txn.transaction_id,
      account_id: txn.account_id,
      user_id: user._id,
      is_manual: false,
      source: 'plaid',
      date: new Date(txn.date),
      name: txn.name,
      merchant_name: txn.merchant_name,
      amount: txn.amount,
      category: txn.category || [],
      pending: txn.pending || false,
      payment_channel: txn.payment_channel || 'other',
      currency_code: 'USD',
    }));

    await Transaction.insertMany(transactions);
    console.log(`Created ${transactions.length} transactions`);

    console.log('\n✅ Database seeded successfully with mock data!');
    console.log('\nSummary:');
    console.log(`- Users: 1 (Emily Chen)`);
    console.log(`- Categories: ${categoryDocs.length}`);
    console.log(`- Accounts: ${accounts.length}`);
    accounts.forEach(acc => {
      console.log(`  • ${acc.name}: $${acc.balances.current.toFixed(2)}`);
    });
    console.log(`- Transactions: ${transactions.length}`);

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
