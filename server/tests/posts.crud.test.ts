import request from 'supertest';
import app from '../src/main';

// Utilidad simple: crear un post, luego verificar GET, PUT, DELETE
describe('Posts CRUD (happy path)', () => {
  let createdId: string;

  it('POST /api/v1/posts should create a post (201)', async () => {
    const res = await request(app)
      .post('/api/v1/posts')
      .send({ name: 'Test Post', description: 'Creado por test' })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Test Post');
    createdId = res.body.id;
  });

  it('GET /api/v1/posts should return paginated list (200)', async () => {
    const res = await request(app).get('/api/v1/posts?page=1&pageSize=10');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('pageSize');
    expect(res.body.pagination).toHaveProperty('total');
  });

  it('GET /api/v1/posts/:id should return the created post (200)', async () => {
    const res = await request(app).get(`/api/v1/posts/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdId);
    expect(res.body.name).toBeDefined();
  });

  it('PUT /api/v1/posts/:id should update the post (200)', async () => {
    const res = await request(app)
      .put(`/api/v1/posts/${createdId}`)
      .send({ description: 'Actualizado por test' })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Actualizado por test');
  });

  it('DELETE /api/v1/posts/:id should delete the post (204)', async () => {
    const res = await request(app).delete(`/api/v1/posts/${createdId}`);
    expect(res.status).toBe(204);
  });

  it('GET /api/v1/posts/:id should return 404 after deletion', async () => {
    const res = await request(app).get(`/api/v1/posts/${createdId}`);
    expect(res.status).toBe(404);
  });
});
