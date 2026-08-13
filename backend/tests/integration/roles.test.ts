import request from 'supertest';
import db from '../../src/dal/database';
import app from '../../src/index';

describe('Roles API - Integration Tests', () => {
    beforeEach(async () => {
        await db.query('DELETE FROM roles');
    });

    afterAll(async () => {
        await db.query('DELETE FROM roles');
    });

    describe('GET /roles', () => {
        it('should return empty array when no roles', async () => {
            const res = await request(app).get('/roles');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });

        it('should return all roles', async () => {
            await db.query("INSERT INTO roles (name) VALUES ('admin')");
            const res = await request(app).get('/roles');
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].name).toBe('admin');
        });
    });
});
