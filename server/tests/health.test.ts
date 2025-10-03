import request from 'supertest';
import app from '../src/main';

describe('Health endpoint', () => {
  it('GET /api/v1/health should return 200 and ok: true', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('GET /api/v1/does-not-exist should return 404', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message');
  });
});
