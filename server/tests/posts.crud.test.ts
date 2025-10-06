/// <reference types="vitest" />
import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '../src/infrastructure/prisma/client';
import request from 'supertest';
import app from '../src/main';

// NOTA: El truncado ocurre en un beforeEach global, por lo que dividir el flujo en múltiples `it`
// hacía que se perdiera el registro creado. Unificamos el flujo CRUD completo en un solo test.
describe('Posts CRUD (happy path)', () => {
  beforeAll(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Post" RESTART IDENTITY CASCADE;');
  });
  it('should create, list, get, update, delete and finally 404 (full lifecycle)', async () => {
    // Create
    const createRes = await request(app)
      .post('/api/v1/posts')
      .send({ name: 'Test Post', description: 'Creado por test' })
      .set('Content-Type', 'application/json');
    expect(createRes.status).toBe(201);
    const createdId = createRes.body.id;
    expect(createdId).toBeDefined();

    // List (should contain 1)
    const listRes = await request(app).get('/api/v1/posts?page=1&pageSize=10');
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.pagination).toMatchObject({ page: 1, pageSize: 10 });

    // Get by id
  const getRes = await request(app).get(`/api/v1/posts/${createdId}`);
  expect(getRes.status).toBe(200);
  expect(getRes.body.id).toBe(createdId);

    // Update
    const updateRes = await request(app)
      .put(`/api/v1/posts/${createdId}`)
      .send({ description: 'Actualizado por test' })
      .set('Content-Type', 'application/json');
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.description).toBe('Actualizado por test');

    // Delete
    const deleteRes = await request(app).delete(`/api/v1/posts/${createdId}`);
    expect(deleteRes.status).toBe(204);

    // Get after delete -> 404
    const get404 = await request(app).get(`/api/v1/posts/${createdId}`);
    expect(get404.status).toBe(404);
  });
});
