import jwt from 'jsonwebtoken';
import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';

let testUser, testAccount, testTransaction, testCategory;
let testUserId, testTransactionId, token;

// Setup test data before running tests
before(async () => {
  // Clear previous test data for safety
  await User.deleteMany({ email: "testuser@example.com" });
  await Account.deleteMany({ account_id: "test-account" });
  await Transaction.deleteMany({ transaction_id: /test-/ });
  await Category.deleteMany({ name: "TEST_CATEGORY", user_id: { $exists: true } });
  testUserId = new mongoose.Types.ObjectId();
  testTransactionId = new mongoose.Types.ObjectId();
  app.use((req, res, next) => {
    req.user_id = testUserId;
    next();
  })

  // Create test user
  testUser = await User.create({
    _id: testUserId,
    email: "testuser@example.com",
    first_name: "Test",
    last_name: "User",
    password_hash: "hashedpassword",
  });

  // JWT for authorization
  token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || "TEST_SECRET", { expiresIn: "1h" });

  // Create test account
  testAccount = await Account.create({
    account_id: "test-account",
    user_id: testUser._id,
    bank_name: "Test Bank",
    name: "Test Checking",
    type: "depository",
    subtype: "checking",
    balances: { current: 1000 },
  });

  // Create test transaction
  testTransaction = await Transaction.create({
    _id: testTransactionId,
    transaction_id: `test-${new mongoose.Types.ObjectId()}`,
    account_id: testAccount.account_id,
    user_id: testUser._id,
    date: new Date(),
    name: 'Test Transaction',
    amount: 42.5,
  });

  // Create test category
  testCategory = await Category.create({
    name: "TEST_CATEGORY",
    user_id: testUserId,
  });
});

// Clean up test data after all tests
after(async () => {
  await Transaction.deleteMany({ transaction_id: /test-/ });
  await Account.deleteMany({ account_id: "test-account" });
  await Category.deleteMany({ name: "TEST_CATEGORU", user_id: testUserId });
  await User.deleteMany({ _id: testUserId });
  await mongoose.connection.close();
});

describe('Server routes', () => {
  it('GET / should return welcome message', async () => {
    const res = await request(app).get('/').set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('message', 'Welcome to Cash Me API');
  });

  it('GET /api/health returns API health', async () => {
    const res = await request(app).get('/api/health').set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.include({ status: 'ok', message: 'Cash Me Backend API is running' });
    expect(res.body).to.have.property('timestamp');
  });
});

describe('Expense categorization endpoints', () => {
  it('GET /api/transactions returns transactions for user', async () => {
    const res = await request(app).get('/api/transactions').set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body.transactions).to.be.an('array').that.is.not.empty;
    expect(res.body.transactions[0]).to.include.keys('transaction_id', 'amount', 'category');
  });

  it('PUT /api/transactions/:id/category updates transaction category', async () => {
    const newCategory = 'TEST_CATEGORY';
    const res = await request(app)
      .put(`/api/transactions/${testTransactionId}/category`)
      .set("Authorization", `Bearer ${token}`)
      .send({ category: newCategory });

    expect(res.status).to.equal(200);
    expect(res.body.transaction).to.include({ transaction_id: testTransaction.transaction_id });
    expect(res.body.transaction.category).to.include(newCategory);
  });

  it('GET /api/transactions/categories returns user categories', async () => {
    const res = await request(app).get('/api/transactions/categories').set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body.categories).to.include("TEST_CATEGORY");
  });

  it('POST /api/transactions creates a new transaction', async () => {
    const testTransactionId2 = new mongoose.Types.ObjectId();
    const newTransaction = {
      _id: testTransactionId2,
      transaction_id: `test-${new mongoose.Types.ObjectId()}`,
      account_id: testAccount.account_id,
      user_id: testUser._id.toString(),
      date: new Date(),
      name: 'Another Test Txn',
      amount: 10.0,
    };

    const res = await request(app).post('/api/transactions').set("Authorization", `Bearer ${token}`).send(newTransaction);
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('transaction_id').that.is.a('string');
    expect(res.body).to.have.property('user_id');
    expect(res.body.user_id).to.equal(testUser.id.toString());
    expect(res.body.category).to.be.an('array').that.is.not.empty;
    // Clean up this specific transaction
    await Transaction.deleteOne({ transaction_id: newTransaction.transaction_id });
  });
});
