const request = require('supertest');
const { app, server } = require('../server');

describe('Express Server Tests', () => {
  afterAll(() => {
    server.close();
  });

  test('GET / should return welcome message', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Welcome to Cash Me API');
  });

  test('GET /api/health should return health status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.message).toBe('Cash Me Backend API is running');
  });

  test('GET /nonexistent should return 404', async () => {
    const response = await request(app).get('/nonexistent');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Route not found');
  });

  test('Server should use CORS middleware', async () => {
    const response = await request(app).get('/api/health');
    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });
});
