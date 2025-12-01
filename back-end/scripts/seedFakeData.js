require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const { connectDB } = require('../config/database');

const DEFAULT_USER_ID = '673e8d9a5e9e123456789abc';

const MERCHANTS = [
  { name: 'Whole Foods', category: 'Groceries' },
  { name: 'Target', category: 'Shopping' },
  { name: 'Amazon', category: 'Shopping' },
  { name: 'Starbucks', category: 'Dining' },
  { name: 'Shell Gas Station', category: 'Transportation' },
  { name: 'McDonald\'s', category: 'Dining' },
  { name: 'Netflix', category: 'Entertainment' },
  { name: 'Spotify', category: 'Subscriptions' },
  { name: 'Uber', category: 'Transportation' },
  { name: 'Lyft', category: 'Transportation' },
  { name: 'CVS Pharmacy', category: 'Healthcare' },
  { name: 'Walgreens', category: 'Healthcare' },
  { name: 'Home Depot', category: 'Shopping' },
  { name: 'Best Buy', category: 'Shopping' },
  { name: 'AT&T', category: 'Utilities' },
  { name: 'Verizon', category: 'Utilities' },
  { name: 'ComEd', category: 'Utilities' },
  { name: 'LA Fitness', category: 'Healthcare' },
  { name: 'Chipotle', category: 'Dining' },
  { name: 'Dunkin Donuts', category: 'Dining' },
];

const generateFakeTransactions = (accounts, userId, count = 100) => {
  const transactions = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    const account = accounts[Math.floor(Math.random() * accounts.length)];
    const merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
    const amount = parseFloat((Math.random() * 200 + 5).toFixed(2));
    const isDebit = Math.random() > 0.15;

    transactions.push({
      transaction_id: `txn_fake_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
      account_id: account.account_id,
      user_id: userId,
      date,
      name: merchant.name,
      merchant_name: merchant.name,
      amount: isDebit ? amount : -amount,
      category: [merchant.category],
      pending: Math.random() > 0.95,
      payment_channel: Math.random() > 0.5 ? 'online' : 'in store',
      currency_code: 'USD',
    });
  }

  return transactions.sort((a, b) => b.date - a.date);
};

const seedFakeData = async () => {
  try {
    await connectDB();

    console.log('\n🌱 Starting fake data seeding...\n');

    console.log('1️⃣  Creating demo user...');
    await User.deleteMany({ _id: DEFAULT_USER_ID });

    const user = await User.create({
      _id: DEFAULT_USER_ID,
      email: 'demo@cashme.com',
      first_name: 'Demo',
      last_name: 'User',
      password_hash: '$2b$10$dummyhashfordemopurposes',
      is_active: true,
      email_verified: true,
      preferences: {
        currency: 'USD',
        theme: 'light',
        notifications_enabled: true,
      },
    });
    console.log(`   ✅ Created user: ${user.email}`);

    console.log('\n2️⃣  Creating fake accounts...');
    await Account.deleteMany({ user_id: user._id });

    const accounts = [
      {
        account_id: 'acc_fake_checking_001',
        user_id: user._id,
        item_id: 'item_fake_chase_001',
        name: 'Chase Checking',
        official_name: 'Chase Total Checking',
        type: 'depository',
        subtype: 'checking',
        balances: {
          current: 5420.50,
          available: 5420.50,
          iso_currency_code: 'USD',
        },
        mask: '1234',
        verification_status: 'verified',
      },
      {
        account_id: 'acc_fake_savings_001',
        user_id: user._id,
        item_id: 'item_fake_chase_001',
        name: 'Chase Savings',
        official_name: 'Chase Savings Account',
        type: 'depository',
        subtype: 'savings',
        balances: {
          current: 12350.00,
          available: 12350.00,
          iso_currency_code: 'USD',
        },
        mask: '5678',
        verification_status: 'verified',
      },
      {
        account_id: 'acc_fake_credit_001',
        user_id: user._id,
        item_id: 'item_fake_discover_001',
        name: 'Discover Card',
        official_name: 'Discover it Cash Back',
        type: 'credit',
        subtype: 'credit card',
        balances: {
          current: 1250.75,
          available: 3749.25,
          limit: 5000.00,
          iso_currency_code: 'USD',
        },
        mask: '9012',
        verification_status: 'verified',
      },
    ];

    const createdAccounts = await Account.insertMany(accounts);
    console.log(`   ✅ Created ${createdAccounts.length} accounts`);

    console.log('\n3️⃣  Generating fake transactions...');
    await Transaction.deleteMany({ user_id: user._id });

    const transactions = generateFakeTransactions(createdAccounts, user._id, 110);
    await Transaction.insertMany(transactions);
    console.log(`   ✅ Generated ${transactions.length} transactions`);

    console.log('\n✅ Fake data seeding completed!');
    console.log('\nSummary:');
    console.log(`   - User: ${user.email}`);
    console.log(`   - Accounts: ${createdAccounts.length}`);
    console.log(`   - Transactions: ${transactions.length}`);
    console.log(`   - Date range: ${transactions[transactions.length - 1].date.toLocaleDateString()} to ${transactions[0].date.toLocaleDateString()}`);

    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding fake data:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

seedFakeData();
