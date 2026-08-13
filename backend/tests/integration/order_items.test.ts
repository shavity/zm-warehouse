import request from 'supertest';
import db from '../../src/dal/database';
import app from '../../src/index';

describe('Order Items API - Integration Tests', () => {

    const roomId = 1;
    let userId: number;
    let orderId: number;
    let productId: number;
    let categoryId: number;
    let roleId: number;
    let statusId: number;

    beforeAll(async () => {
        await db.query(
            `INSERT INTO rooms (id, name) VALUES ($1, 'Test Room')`,
            [roomId]
        );
        const category = await db.query(
            `INSERT INTO categories (name) VALUES ('Test Category')
            RETURNING *`
        );
        categoryId = category.rows[0].id;

        const role = await db.query(
            `INSERT INTO roles (name) VALUES ('Test Role')
            RETURNING *`
        );
        roleId = role.rows[0].id;

        const user = await db.query(
            `INSERT INTO users (name, phone_number, role_id)
            VALUES ('Yair', '0501234567', $1)
            RETURNING *`,
            [roleId]
        );
        userId = user.rows[0].id;

        const orderStatus = await db.query(
            `INSERT INTO order_statuses (name) VALUES ('Test Status')
            RETURNING *`
        );
        statusId = orderStatus.rows[0].id;

        const order = await db.query(
            `INSERT INTO orders (name, created_by, status_id, start_date)
            VALUES ('Test Order', $1, $2, '2026-06-01')
            RETURNING *`,
            [userId, statusId]
        );
        orderId = order.rows[0].id;

        const product = await db.query(
            `INSERT INTO products (name, room_id, category_id, in_stock, minimum_in_stock, is_expendable)
            VALUES ('Knife', $1, $2, 10, 2, false)
            RETURNING *`,
            [roomId, categoryId]
        );
        productId = product.rows[0].id;
    });

    beforeEach(async () => {
        await db.query('DELETE FROM order_items');
    });

    afterAll(async () => {
        await db.query('DELETE FROM order_items');
        await db.query('DELETE FROM orders WHERE id = $1', [orderId]);
        await db.query('DELETE FROM order_statuses WHERE id = $1', [statusId]);
        await db.query('DELETE FROM products WHERE id = $1', [productId]);
        await db.query('DELETE FROM rooms WHERE id = $1', [roomId]);
        await db.query('DELETE FROM categories WHERE id = $1', [categoryId]);
        await db.query('DELETE FROM users WHERE id = $1', [userId]);
        await db.query('DELETE FROM roles WHERE id = $1', [roleId]);
    });

    describe('GET /orders/:order_id/items', () => {
        it('should return empty array when no items', async () => {
            const res = await request(app).get(`/orders/${orderId}/items`);
            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });

        it('should return all order items', async () => {
            await db.query(
                `INSERT INTO order_items (order_id, product_id, amount)
                VALUES ($1, $2, 10)`,
                [orderId, productId]
            );
            const res = await request(app).get(`/orders/${orderId}/items`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].amount).toBe(10);
        });

        it('should return 404 if order not found', async () => {
            const res = await request(app).get('/orders/999/items');
            expect(res.status).toBe(404);
        });
    });

    describe('POST /orders/:order_id/items', () => {
        it('should create an order item successfully', async () => {
            const res = await request(app)
                .post(`/orders/${orderId}/items`)
                .send({ product_id: productId, amount: 10 });
            expect(res.status).toBe(201);
            expect(res.body.amount).toBe(10);
        });

        it('should return 400 if product_id is missing', async () => {
            const res = await request(app)
                .post(`/orders/${orderId}/items`)
                .send({ amount: 10 });
            expect(res.status).toBe(400);
        });

        it('should return 400 if amount is missing', async () => {
            const res = await request(app)
                .post(`/orders/${orderId}/items`)
                .send({ product_id: productId });
            expect(res.status).toBe(400);
        });

        it('should return 404 if order not found', async () => {
            const res = await request(app)
                .post('/orders/999/items')
                .send({ product_id: productId, amount: 10 });
            expect(res.status).toBe(404);
        });

        it('should return 404 if product not found', async () => {
            const res = await request(app)
                .post(`/orders/${orderId}/items`)
                .send({ product_id: 999, amount: 10 });
            expect(res.status).toBe(404);
        });

        it('should return 409 if order item already exists', async () => {
            await db.query(
                `INSERT INTO order_items (order_id, product_id, amount)
                VALUES ($1, $2, 10)`,
                [orderId, productId]
            );
            const res = await request(app)
                .post(`/orders/${orderId}/items`)
                .send({ product_id: productId, amount: 10 });
            expect(res.status).toBe(409);
        });
    });

    describe('PATCH /orders/:order_id/items/:product_id', () => {
        it('should update actual_amount', async () => {
            await db.query(
                `INSERT INTO order_items (order_id, product_id, amount)
                VALUES ($1, $2, 10)`,
                [orderId, productId]
            );
            const res = await request(app)
                .patch(`/orders/${orderId}/items/${productId}`)
                .send({ actual_amount: 8 });
            expect(res.status).toBe(200);
            expect(res.body.actual_amount).toBe(8);
        });

        it('should update returned_amount and comment', async () => {
            await db.query(
                `INSERT INTO order_items (order_id, product_id, amount)
                VALUES ($1, $2, 10)`,
                [orderId, productId]
            );
            const res = await request(app)
                .patch(`/orders/${orderId}/items/${productId}`)
                .send({ returned_amount: 8, comment: '2 broke at the event' });
            expect(res.status).toBe(200);
            expect(res.body.returned_amount).toBe(8);
            expect(res.body.comment).toBe('2 broke at the event');
        });

        it('should return 400 if no fields provided', async () => {
            const res = await request(app)
                .patch(`/orders/${orderId}/items/${productId}`)
                .send({});
            expect(res.status).toBe(400);
        });

        it('should return 404 if order item not found', async () => {
            const res = await request(app)
                .patch(`/orders/${orderId}/items/999`)
                .send({ actual_amount: 8 });
            expect(res.status).toBe(404);
        });
    });

    describe('DELETE /orders/:order_id/items/:product_id', () => {
        it('should delete an order item successfully', async () => {
            await db.query(
                `INSERT INTO order_items (order_id, product_id, amount)
                VALUES ($1, $2, 10)`,
                [orderId, productId]
            );
            const res = await request(app)
                .delete(`/orders/${orderId}/items/${productId}`);
            expect(res.status).toBe(204);
        });

        it('should return 404 if order item not found', async () => {
            const res = await request(app)
                .delete(`/orders/${orderId}/items/999`);
            expect(res.status).toBe(404);
        });
    });
});
