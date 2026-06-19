const request = require('supertest');

// Mock the db module before importing the app
jest.mock('../lib/db', () => ({
  getMongoState: jest.fn(),
  connectDatabase: jest.fn()
}));

const db = require('../lib/db');
const app = require('../index');

describe('GET /health', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('returns 200 when mongoose is connected', async () => {
    db.getMongoState.mockReturnValue(1);

    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body.details).toHaveProperty('mongoState', 1);
  });

  test('returns 503 when mongoose is disconnected', async () => {
    db.getMongoState.mockReturnValue(0);

    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(503);
    expect(res.body).toHaveProperty('status', 'unhealthy');
    expect(res.body.details).toHaveProperty('mongoState', 0);
  });
});
