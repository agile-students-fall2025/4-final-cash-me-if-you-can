const request = require('supertest');
const { app, server } = require('../server');

describe('Plaid API Tests', () => {
  afterAll(() => {
    server.close();
  });

  test('POST /api/plaid/create_link_token should return link token', async () => {
    const response = await request(app)
      .post('/api/plaid/create_link_token')
      .send({ user_id: 'test_user' });

    expect(response.status).toBe(200);
    expect(response.body.link_token).toBeDefined();
  });

  test('POST /api/plaid/exchange_public_token should return access token', async () => {
    const response = await request(app)
      .post('/api/plaid/exchange_public_token')
      .send({ public_token: 'test_token' });

    expect(response.status).toBe(200);
    expect(response.body.access_token).toBeDefined();
    expect(response.body.item_id).toBeDefined();
  });

  test('POST /api/plaid/accounts should return mock accounts', async () => {
    const response = await request(app)
      .post('/api/plaid/accounts')
      .send({ access_token: 'test_token' });

    expect(response.status).toBe(200);
    expect(response.body.accounts).toBeDefined();
    expect(Array.isArray(response.body.accounts)).toBe(true);
  });

  test('POST /api/plaid/transactions should return mock transactions', async () => {
    const response = await request(app)
      .post('/api/plaid/transactions')
      .send({ access_token: 'test_token' });

    expect(response.status).toBe(200);
    expect(response.body.transactions).toBeDefined();
    expect(Array.isArray(response.body.transactions)).toBe(true);
  });
});
