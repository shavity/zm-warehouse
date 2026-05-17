import request from 'supertest';
import app from '../../src/index';
import db from '../../src/dal/database';

describe('Order Statuses API - Integration Tests', () => {

  beforeEach(async () => {
    await db.query('DELETE FROM order_statuses');
  });

  afterAll(async () => {
    await db.query('DELETE FROM order_statuses');
  });

  describe('GET /order-statuses', () => {
    it('should return empty array when no order statuses', async () => {
      const res = await request(app).get('/order-statuses');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return all order statuses', async () => {
      await db.query("INSERT INTO order_statuses (name) VALUES ('draft')");
      const res = await request(app).get('/order-statuses');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('draft');
    });
  });
});