/// <reference types="vitest" />
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/main';

/**
 * Tests de validación (400) para los endpoints de Posts
 */
describe('Posts validation (400)', () => {
  it('GET /api/v1/posts debe fallar si page < 1', async () => {
    const res = await request(app).get('/api/v1/posts?page=0&pageSize=10');
    expect(res.status).toBe(400);
  });

  it('GET /api/v1/posts debe fallar si pageSize < 1', async () => {
    const res = await request(app).get('/api/v1/posts?page=1&pageSize=0');
    expect(res.status).toBe(400);
  });

  it('GET /api/v1/posts debe fallar si pageSize > 100', async () => {
    const res = await request(app).get('/api/v1/posts?page=1&pageSize=101');
    expect(res.status).toBe(400);
  });

  it('GET /api/v1/posts/:id debe fallar si id no es UUID', async () => {
    const res = await request(app).get('/api/v1/posts/not-a-uuid');
    expect(res.status).toBe(400);
  });

  it('POST /api/v1/posts debe fallar si body vacío', async () => {
    const res = await request(app)
      .post('/api/v1/posts')
      .send({})
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(400);
  });

  it('POST /api/v1/posts debe fallar si name es cadena vacía', async () => {
    const res = await request(app)
      .post('/api/v1/posts')
      .send({ name: '' })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(400);
  });

  it('POST /api/v1/posts debe fallar si name supera 200 chars', async () => {
    const longName = 'a'.repeat(201);
    const res = await request(app)
      .post('/api/v1/posts')
      .send({ name: longName })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(400);
  });

  describe('PUT validations', () => {
    let id: string;

    beforeAll(async () => {
      const create = await request(app)
        .post('/api/v1/posts')
        .send({ name: 'Valid for PUT tests' })
        .set('Content-Type', 'application/json');
      expect(create.status).toBe(201);
      id = create.body.id;
    });

    it('PUT /api/v1/posts/:id debe fallar si body vacío', async () => {
      const res = await request(app)
        .put(`/api/v1/posts/${id}`)
        .send({})
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(400);
    });

    it('PUT /api/v1/posts/:id debe fallar si tipos inválidos', async () => {
      const res = await request(app)
        .put(`/api/v1/posts/${id}`)
        // name debe ser string, aquí enviamos number
        .send({ name: 123 })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(400);
    });

    it('PUT /api/v1/posts/:id debe fallar si name supera 200 chars', async () => {
      const longName = 'a'.repeat(201);
      const res = await request(app)
        .put(`/api/v1/posts/${id}`)
        .send({ name: longName })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(400);
    });
  });
});
