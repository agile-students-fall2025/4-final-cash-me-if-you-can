const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');

describe('Server routes', () => {
  it('GET / should return welcome message', async () => {
    const response = await request(app).get('/');

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('message', 'Welcome to Cash Me API');
  });

  it('GET /api/health should return status payload', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).to.equal(200);
    expect(response.body).to.include({
      status: 'ok',
      message: 'Cash Me Backend API is running',
    });
    expect(response.body).to.have.property('timestamp');
  });

  it('GET /nonexistent should return 404 JSON error', async () => {
    const response = await request(app).get('/nonexistent-route');

    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('error', 'Route not found');
  });
});

describe('Expense categorization endpoints', () => {
  it('GET /api/transactions returns categorized transactions', async () => {
    const response = await request(app).get('/api/transactions');

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('transactions').that.is.an('array').that.is.not.empty;
    expect(response.body).to.have.property('total').that.is.a('number').above(0);
    const sample = response.body.transactions[0];
    expect(sample).to.include.keys('transaction_id', 'date', 'amount', 'category');
  });

  it('PUT /api/transactions/:id/category updates transaction category', async () => {
    const transactionId = 'txn_001';
    const newCategory = 'Test Category';

    const response = await request(app)
      .put(`/api/transactions/${transactionId}/category`)
      .send({ category: newCategory });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('transaction');
    expect(response.body.transaction).to.include({ transaction_id: transactionId, category: newCategory });
    expect(response.body).to.have.property('message').that.includes('successfully');
  });

  it('GET /api/transactions/categories returns available categories', async () => {
    const response = await request(app).get('/api/transactions/categories');

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('categories').that.is.an('array').that.includes('Groceries');
    expect(response.body).to.have.property('total').that.equals(response.body.categories.length);
  });
});
