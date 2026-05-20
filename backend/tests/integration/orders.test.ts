import request from 'supertest';
import db from '../../src/dal/database';
import app from '../../src/index';

describe('Orders API - Integration Tests', () => {

    let userId: number;
    let statusId: number;
    let roleId: number;
    let tempStatusId: number;

    beforeAll(async () => {
        const status = await db.query(
            `INSERT INTO order_statuses (name) 
            VALUES ('active')
            RETURNING *`
        );
        statusId = status.rows[0].id;

        const tempStatus = await db.query(
            `INSERT INTO order_statuses (name) 
            VALUES ('temp') 
            RETURNING *`
        );
        tempStatusId = tempStatus.rows[0].id;

        const role = await db.query(
            `INSERT INTO roles (name) 
            VALUES ('admin')
            RETURNING *`
        );
        roleId = role.rows[0].id;

        const user = await db.query(
            `INSERT INTO users (name, phone_number, role_id)
            VALUES ('Yair', '0501234567', ${roleId})
            RETURNING *`
        );
        userId = user.rows[0].id;
    });

    beforeEach(async () => {
        await db.query('DELETE FROM orders');
    });

    afterAll(async () => {
        await db.query('DELETE FROM orders');
        await db.query('DELETE FROM users WHERE id = $1', [userId]);
        await db.query('DELETE FROM roles WHERE id = $1', [roleId]);
        await db.query('DELETE FROM order_statuses WHERE id IN ($1, $2)', [statusId, tempStatusId]);
    });

    describe('GET /orders', () => {
        it('should return empty array when no orders', async () => {
            const res = await request(app).get('/orders');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });

        it('should return all orders', async () => {
            await db.query(
                `INSERT INTO orders (name, created_by, status_id, start_date)
                VALUES ('Summer Camp 2026', $1, $2, '2026-06-01')`,
                [userId, statusId]
            );
            const res = await request(app).get('/orders');
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].name).toBe('Summer Camp 2026');
        });
    });

    describe('GET /orders/:id', () => {
        it('should return an order by id', async () => {
            const insert = await db.query(
                `INSERT INTO orders (name, created_by, status_id, start_date)
                VALUES ('Summer Camp 2026', $1, $2, '2026-06-01')
                RETURNING *`,
                [userId, statusId]
            );
            const id = insert.rows[0].id;
            const res = await request(app).get(`/orders/${id}`);
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Summer Camp 2026');
        });

        it('should return 400 if id is not an integer', async () => {
            const res = await request(app).get('/orders/abc');
            expect(res.status).toBe(400);
        });

        it('should return 404 if order not found', async () => {
            const res = await request(app).get('/orders/999');
            expect(res.status).toBe(404);
        });
    });

    describe('POST /orders', () => {
        it('should create an order successfully', async () => {
            const res = await request(app)
                .post('/orders')
                .send({
                    name: 'Summer Camp 2026',
                    created_by: userId,
                    start_date: '2026-06-01',
                    status_id: statusId
                });
            expect(res.status).toBe(201);
            expect(res.body.name).toBe('Summer Camp 2026');
            expect(res.body.status_id).toBeDefined();
        });

        it('should create an order with expire_date', async () => {
            const res = await request(app)
                .post('/orders')
                .send({
                    name: 'Summer Camp 2026',
                    created_by: userId,
                    start_date: '2026-06-01',
                    expire_date: '2026-06-10',
                    status_id: statusId
                });
            expect(res.status).toBe(201);
            expect(res.body.expire_date).toBeDefined();
        });

        it('should return 400 if name is missing', async () => {
            const res = await request(app)
                .post('/orders')
                .send({ 
                    created_by: userId,
                    start_date: '2026-06-01',
                    status_id: statusId
                });
            expect(res.status).toBe(400);
        });

        it('should return 400 if start_date is invalid', async () => {
            const res = await request(app)
                .post('/orders')
                .send({
                    name: 'Summer Camp 2026',
                    created_by: userId,
                    status_id: statusId,
                    start_date: 'not-a-date',
                });
            expect(res.status).toBe(400);
        });

        it('should return 404 if user not found', async () => {
            const res = await request(app)
                .post('/orders')
                .send({
                    name: 'Summer Camp 2026',
                    created_by: 999,
                    status_id: statusId,
                    start_date: '2026-06-01',
                });
            expect(res.status).toBe(404);
        });

        it('should return 404 if order status not found', async () => {
            const res = await request(app)
                .post('/orders')
                .send({
                    name: 'Summer Camp 2026',
                    created_by: userId,
                    status_id: 999,
                    start_date: '2026-06-01',
                });
            expect(res.status).toBe(404);
        });
    });

    describe('PATCH /orders/:id', () => {
        it('should update an order name', async () => {
            const insert = await db.query(
                `INSERT INTO orders (name, created_by, status_id, start_date)
                VALUES ('Summer Camp 2026', $1, $2, '2026-06-01')
                RETURNING *`,
                [userId, statusId]
            );
            const id = insert.rows[0].id;
            const res = await request(app)
                .patch(`/orders/${id}`)
                .send({ name: 'Updated Camp' });
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Updated Camp');
        });

        it('should update order status', async () => {
            const insert = await db.query(
                `INSERT INTO orders (name, created_by, status_id, start_date)
                VALUES ('Summer Camp 2026', $1, $2, '2026-06-01')
                RETURNING *`,
                [userId, statusId]
            );
            const id = insert.rows[0].id;
            const res = await request(app)
                .patch(`/orders/${id}`)
                .send({ status_id: tempStatusId });
            expect(res.status).toBe(200);
            expect(res.body.status_id).toBe(tempStatusId);
        });

        it('should return 400 if no fields provided', async () => {
            const res = await request(app)
                .patch('/orders/1')
                .send({});
            expect(res.status).toBe(400);
        });

        it('should return 404 if order not found', async () => {
            const res = await request(app)
                .patch('/orders/999')
                .send({ name: 'Updated Camp' });
            expect(res.status).toBe(404);
        });

        it('should return 404 if status not found', async () => {
            const res = await request(app)
                .patch('/orders/1')
                .send({ status_id: 999 });
            expect(res.status).toBe(404);
        });
    });

    describe('DELETE /orders/:id', () => {
        it('should delete an order successfully', async () => {
            const insert = await db.query(
                `INSERT INTO orders (name, created_by, status_id, start_date)
                VALUES ('Summer Camp 2026', $1, $2, '2026-06-01')
                RETURNING *`,
                [userId, statusId]
            );
            const id = insert.rows[0].id;
            const res = await request(app).delete(`/orders/${id}`);
            expect(res.status).toBe(204);
        });

        it('should return 400 if id is not an integer', async () => {
            const res = await request(app).delete('/orders/abc');
            expect(res.status).toBe(400);
        });

        it('should return 404 if order not found', async () => {
            const res = await request(app).delete('/orders/999');
            expect(res.status).toBe(404);
        });
    });
});
