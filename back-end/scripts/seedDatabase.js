require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

const categories = require('../data/categories.json');

const DEFAULT_USER_ID = '673e8d9a5e9e123456789abc';

const MERCHANTS = [
  'Whole Foods', 'Target', 'Amazon', 'Starbucks', 'Shell Gas',
  'McDonald\'s', 'Netflix', 'Spotify', 'Uber', 'Lyft',
  'CVS Pharmacy', 'Walgreens', 'Home Depot', 'Best Buy',
  'AT&T', 'Verizon', 'ComEd', 'Gym Membership', 'Rent Payment',
  'Student Loan Payment', 'Credit Card Payment', 'Insurance',
];

const generateFakeTransactions = (accountId, userId, count = 50) => {
  const transactions = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    const merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
    const amount = parseFloat((Math.random() * 200 + 5).toFixed(2));
    const isDebit = Math.random() > 0.2;

    transactions.push({
      transaction_id: `txn_fake_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
      account_id: accountId,
      user_id: userId,
      date,
      name: merchant,
      merchant_name: merchant,
      amount: isDebit ? amount : -amount,
      category: [],
      pending: Math.random() > 0.9,
      payment_channel: Math.random() > 0.5 ? 'online' : 'in store',
      currency_code: 'USD',
    });
  }

  return transactions;
};

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    console.log('\nClearing existing data...');
    await Category.deleteMany({});
    await Transaction.deleteMany({});
    await Account.deleteMany({});
    await User.deleteMany({});

    console.log('\n1. Creating default user...');
    const user = await User.create({
      _id: DEFAULT_USER_ID,
      email: 'demo@cashme.com',
      first_name: 'Demo',
      last_name: 'User',
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

    console.log('\n3. Creating fake accounts...');
    const accounts = [
      {
        account_id: 'acc_fake_checking_001',
        user_id: user._id,
        item_id: 'item_fake_001',
        name: 'Chase Checking',
        official_name: 'Chase Total Checking',
        type: 'depository',
        subtype: 'checking',
        balances: {
          current: 5420.50,
          available: 5420.50,
          currency: 'USD',
        },
        mask: '1234',
        verification_status: 'verified',
      },
      {
        account_id: 'acc_fake_savings_001',
        user_id: user._id,
        item_id: 'item_fake_001',
        name: 'Chase Savings',
        official_name: 'Chase Savings Account',
        type: 'depository',
        subtype: 'savings',
        balances: {
          current: 12350.00,
          available: 12350.00,
          currency: 'USD',
        },
        mask: '5678',
        verification_status: 'verified',
      },
      {
        account_id: 'acc_fake_credit_001',
        user_id: user._id,
        item_id: 'item_fake_002',
        name: 'Discover Credit Card',
        official_name: 'Discover it Cash Back',
        type: 'credit',
        subtype: 'credit card',
        balances: {
          current: 1250.75,
          available: 3749.25,
          limit: 5000.00,
          currency: 'USD',
        },
        mask: '9012',
        verification_status: 'verified',
      },
    ];

    await Account.insertMany(accounts);
    console.log(`Created ${accounts.length} fake accounts`);

    console.log('\n4. Generating fake transactions...');
    const allTransactions = [];
    for (const account of accounts) {
      const txnCount = account.type === 'credit' ? 30 : 40;
      const transactions = generateFakeTransactions(
        account.account_id,
        user._id,
        txnCount
      );
      allTransactions.push(...transactions);
    }

    await Transaction.insertMany(allTransactions);
    console.log(`Created ${allTransactions.length} fake transactions`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSummary:');
    console.log(`- Users: 1`);
    console.log(`- Categories: ${categoryDocs.length}`);
    console.log(`- Accounts: ${accounts.length}`);
    console.log(`- Transactions: ${allTransactions.length}`);

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
