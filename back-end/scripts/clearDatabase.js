require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

async function clearDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n⚠️  WARNING: This will delete ALL data from the database!');
    console.log('Deleting in 3 seconds...\n');

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Delete all collections
    const deletedUsers = await User.deleteMany({});
    const deletedAccounts = await Account.deleteMany({});
    const deletedTransactions = await Transaction.deleteMany({});

    console.log('✅ Database cleared successfully!');
    console.log(`   - Deleted ${deletedUsers.deletedCount} users`);
    console.log(`   - Deleted ${deletedAccounts.deletedCount} accounts`);
    console.log(`   - Deleted ${deletedTransactions.deletedCount} transactions`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
}

clearDatabase();
