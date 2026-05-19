import request from 'supertest';
import app from '../../src/index';
import db from '../../src/dal/database';

describe('Rooms API - Integration Tests', () => {
    beforeEach(async () => {
        await db.query('DELETE FROM rooms');
    });

    afterAll(async () => {
        await db.query('DELETE FROM rooms');
    });

    describe('GET /rooms', () => {
        it('should return empty array when no rooms', async () => {
            const res = await request(app).get('/rooms');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });

        it('should return all rooms', async () => {
            await db.query(
                "INSERT INTO rooms (id, name) VALUES (1, 'Kitchen')"
            );
            const res = await request(app).get('/rooms');
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].name).toBe('Kitchen');
        });
    });

    describe('POST /rooms', () => {
        it('should create a room successfully', async () => {
            const res = await request(app)
                .post('/rooms')
                .send({ id: 1, name: 'Kitchen' });
            expect(res.status).toBe(201);
            expect(res.body.name).toBe('Kitchen');
        });

        it('should return 400 if id is missing', async () => {
            const res = await request(app)
                .post('/rooms')
                .send({ name: 'Kitchen' });
            expect(res.status).toBe(400);
        });

        it('should return 400 if id is not an integer', async () => {
            const res = await request(app)
                .post('/rooms')
                .send({ id: 'abc', name: 'Kitchen' });
            expect(res.status).toBe(400);
        });

        it('should return 409 if room already exists', async () => {
            await db.query(
                "INSERT INTO rooms (id, name) VALUES (1, 'Kitchen')"
            );
            const res = await request(app)
                .post('/rooms')
                .send({ id: 1, name: 'Kitchen' });
            expect(res.status).toBe(409);
        });
    });
});
