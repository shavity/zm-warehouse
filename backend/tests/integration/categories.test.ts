import request from 'supertest';
import app from '../../src/index';
import db from '../../src/dal/database';

describe('Categories API - Integration Tests', () => {

  beforeEach(async () => {
    await db.query('DELETE FROM categories');
  });

  afterAll(async () => {
    await db.query('DELETE FROM categories');
  });

  describe('GET /categories', () => {
    it('should return empty array when no categories', async () => {
      const res = await request(app).get('/categories');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return all categories', async () => {
      await db.query("INSERT INTO categories (name) VALUES ('Kitchen')");
      const res = await request(app).get('/categories');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('Kitchen');
    });
  });

  describe('POST /categories', () => {
    it('should create a category successfully', async () => {
      const res = await request(app)
        .post('/categories')
        .send({ name: 'Kitchen' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Kitchen');
    });

    it('should return 400 if name is missing', async () => {
      const res = await request(app)
        .post('/categories')
        .send({});
      expect(res.status).toBe(400);
    });

    it('should return 400 if name is empty string', async () => {
      const res = await request(app)
        .post('/categories')
        .send({ name: '   ' });
      expect(res.status).toBe(400);
    });

    it('should return 409 if category already exists', async () => {
      await db.query("INSERT INTO categories (name) VALUES ('Kitchen')");
      const res = await request(app)
        .post('/categories')
        .send({ name: 'Kitchen' });
      expect(res.status).toBe(409);
    });
  });
});