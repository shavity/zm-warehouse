import request from 'supertest';
import db from '../../src/dal/database';
import app from '../../src/index';

describe('Users API - Integration Tests', () => {
    beforeEach(async () => {
        await db.query('DELETE FROM users');
        await db.query('DELETE FROM roles');
        await db.query("INSERT INTO roles (id, name) VALUES (1, 'admin')");
    });

    afterAll(async () => {
        await db.query('DELETE FROM users');
        await db.query('DELETE FROM roles');
    });

    describe('GET /users', () => {
        it('should return empty array when no users', async () => {
            const res = await request(app).get('/users');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });

        it('should return all users', async () => {
            await db.query(
                "INSERT INTO users (name, phone_number, role_id) VALUES ('Yair', '0501234567', 1)"
            );
            const res = await request(app).get('/users');
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].name).toBe('Yair');
        });
    });

    describe('GET /users/:id', () => {
        it('should return a user by id', async () => {
            const insert = await db.query(
                "INSERT INTO users (name, phone_number, role_id) VALUES ('Yair', '0501234567', 1) RETURNING *"
            );
            const id = insert.rows[0].id;
            const res = await request(app).get(`/users/${id}`);
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Yair');
        });

        it('should return 400 if id is not an integer', async () => {
            const res = await request(app).get('/users/abc');
            expect(res.status).toBe(400);
        });

        it('should return 404 if user not found', async () => {
            const res = await request(app).get('/users/999');
            expect(res.status).toBe(404);
        });
    });

    describe('POST /users', () => {
        it('should create a user successfully', async () => {
            const res = await request(app)
                .post('/users')
                .send({ name: 'Yair', phone_number: '0501234567', role_id: 1 });
            expect(res.status).toBe(201);
            expect(res.body.name).toBe('Yair');
            expect(res.body.phone_number).toBe('0501234567');
        });

        it('should return 400 if name is missing', async () => {
            const res = await request(app)
                .post('/users')
                .send({ phone_number: '0501234567', role_id: 1 });
            expect(res.status).toBe(400);
        });

        it('should return 400 if phone_number is invalid', async () => {
            const res = await request(app)
                .post('/users')
                .send({ name: 'Yair', phone_number: '12345', role_id: 1 });
            expect(res.status).toBe(400);
        });

        it('should return 400 if role_id is not a positive integer', async () => {
            const res = await request(app)
                .post('/users')
                .send({
                    name: 'Yair',
                    phone_number: '0501234567',
                    role_id: -1,
                });
            expect(res.status).toBe(400);
        });

        it('should return 404 if role not found', async () => {
            const res = await request(app)
                .post('/users')
                .send({
                    name: 'Yair',
                    phone_number: '0501234567',
                    role_id: 999,
                });
            expect(res.status).toBe(404);
        });
    });

    describe('PATCH /users/:id', () => {
        it('should update a user name', async () => {
            const insert = await db.query(
                "INSERT INTO users (name, phone_number, role_id) VALUES ('Yair', '0501234567', 1) RETURNING *"
            );
            const id = insert.rows[0].id;
            const res = await request(app)
                .patch(`/users/${id}`)
                .send({ name: 'Yair Updated' });
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Yair Updated');
        });

        it('should update only phone_number', async () => {
            const insert = await db.query(
                "INSERT INTO users (name, phone_number, role_id) VALUES ('Yair', '0501234567', 1) RETURNING *"
            );
            const id = insert.rows[0].id;
            const res = await request(app)
                .patch(`/users/${id}`)
                .send({ phone_number: '0521234567' });
            expect(res.status).toBe(200);
            expect(res.body.phone_number).toBe('0521234567');
            expect(res.body.name).toBe('Yair');
        });

        it('should return 400 if no fields provided', async () => {
            const res = await request(app).patch('/users/1').send({});
            expect(res.status).toBe(400);
        });

        it('should return 400 if phone_number is invalid', async () => {
            const res = await request(app)
                .patch('/users/1')
                .send({ phone_number: '12345' });
            expect(res.status).toBe(400);
        });

        it('should return 404 if user not found', async () => {
            const res = await request(app)
                .patch('/users/999')
                .send({ name: 'Yair' });
            expect(res.status).toBe(404);
        });

        it('should return 404 if role not found', async () => {
            const res = await request(app)
                .patch('/users/1')
                .send({ role_id: 999 });
            expect(res.status).toBe(404);
        });
    });

    describe('DELETE /users/:id', () => {
        it('should delete a user successfully', async () => {
            const insert = await db.query(
                "INSERT INTO users (name, phone_number, role_id) VALUES ('Yair', '0501234567', 1) RETURNING *"
            );
            const id = insert.rows[0].id;
            const res = await request(app).delete(`/users/${id}`);
            expect(res.status).toBe(204);
        });

        it('should return 400 if id is not an integer', async () => {
            const res = await request(app).delete('/users/abc');
            expect(res.status).toBe(400);
        });

        it('should return 404 if user not found', async () => {
            const res = await request(app).delete('/users/999');
            expect(res.status).toBe(404);
        });
    });
});
