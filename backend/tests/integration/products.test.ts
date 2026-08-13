import request from 'supertest';
import db from '../../src/dal/database';
import app from '../../src/index';

describe('Products API - Integration Tests', () => {

    beforeAll(async () => {
        await db.query(`INSERT INTO rooms (id, name) VALUES (1, 'Kitchen Room') ON CONFLICT DO NOTHING`);
        await db.query(`INSERT INTO categories (id, name) VALUES (1, 'Kitchen') ON CONFLICT DO NOTHING`);
    });

    beforeEach(async () => {
        await db.query('DELETE FROM products');
    });

    afterAll(async () => {
        await db.query('DELETE FROM products');
        await db.query('DELETE FROM rooms');
        await db.query('DELETE FROM categories');
    });

    describe('GET /products', () => {
        it('should return empty array when no products', async () => {
            const res = await request(app).get('/products');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });

        it('should return all products', async () => {
            await db.query(
                `INSERT INTO products (name, room_id, category_id, in_stock, minimum_in_stock, is_expendable)
                VALUES ('Knife', 1, 1, 10, 2, false)`
            );
            const res = await request(app).get('/products');
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].name).toBe('Knife');
        });
    });

    describe('GET /products/:id', () => {
        it('should return a product by id', async () => {
            const insert = await db.query(
                `INSERT INTO products (name, room_id, category_id, in_stock, minimum_in_stock, is_expendable)
                VALUES ('Knife', 1, 1, 10, 2, false)
                RETURNING *`
            );
            const id = insert.rows[0].id;
            const res = await request(app).get(`/products/${id}`);
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Knife');
        });

        it('should return 400 if id is not an integer', async () => {
            const res = await request(app).get('/products/abc');
            expect(res.status).toBe(400);
        });

        it('should return 404 if product not found', async () => {
            const res = await request(app).get('/products/999');
            expect(res.status).toBe(404);
        });
    });

    describe('POST /products', () => {
        it('should create a product successfully', async () => {
            const res = await request(app)
                .post('/products')
                .send({
                    name: 'Knife',
                    room_id: 1,
                    category_id: 1,
                    in_stock: 10,
                    minimum_in_stock: 2,
                    is_expendable: false,
                });
            expect(res.status).toBe(201);
            expect(res.body.name).toBe('Knife');
        });

        it('should return 400 if minimum_in_stock below zero', async () => {
            const res = await request(app)
                .post('/products')
                .send({
                    name: 'Knife',
                    room_id: 1,
                    category_id: 1,
                    in_stock: 0,
                    minimum_in_stock: -1,
                    is_expendable: false,
                });
            expect(res.status).toBe(400);
        });

        it('should return 400 if name is missing', async () => {
            const res = await request(app)
                .post('/products')
                .send({
                    room_id: 1,
                    category_id: 1,
                    in_stock: 10,
                    minimum_in_stock: 2,
                    is_expendable: false,
                });
            expect(res.status).toBe(400);
        });

        it('should return 400 if is_expendable is not a boolean', async () => {
            const res = await request(app)
                .post('/products')
                .send({
                    name: 'Knife',
                    room_id: 1,
                    category_id: 1,
                    in_stock: 10,
                    minimum_in_stock: 2,
                    is_expendable: 'yes',
                });
            expect(res.status).toBe(400);
        });

        it('should return 404 if room not found', async () => {
            const res = await request(app)
                .post('/products')
                .send({
                    name: 'Knife',
                    room_id: 999,
                    category_id: 1,
                    in_stock: 10,
                    minimum_in_stock: 2,
                    is_expendable: false,
                });
            expect(res.status).toBe(404);
        });

        it('should return 404 if category not found', async () => {
            const res = await request(app)
                .post('/products')
                .send({
                    name: 'Knife',
                    room_id: 1,
                    category_id: 999,
                    in_stock: 10,
                    minimum_in_stock: 2,
                    is_expendable: false,
                });
            expect(res.status).toBe(404);
        });
    });

    describe('PATCH /products/:id', () => {
        it('should update a product name', async () => {
            const insert = await db.query(
                `INSERT INTO products (name, room_id, category_id, in_stock, minimum_in_stock, is_expendable)
                VALUES ('Knife', 1, 1, 10, 2, false)
                RETURNING *`
            );
            const id = insert.rows[0].id;
            const res = await request(app)
                .patch(`/products/${id}`)
                .send({ name: 'Updated Knife' });
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Updated Knife');
        });

        it('should return 400 if no fields provided', async () => {
            const res = await request(app)
                .patch('/products/1')
                .send({});
            expect(res.status).toBe(400);
        });

        it('should return 404 if product not found', async () => {
            const res = await request(app)
                .patch('/products/999')
                .send({ name: 'Knife' });
            expect(res.status).toBe(404);
        });
    });

    describe('DELETE /products/:id', () => {
        it('should delete a product successfully', async () => {
            const insert = await db.query(
                `INSERT INTO products (name, room_id, category_id, in_stock, minimum_in_stock, is_expendable)
                VALUES ('Knife', 1, 1, 10, 2, false)
                RETURNING *`
            );
            const id = insert.rows[0].id;
            const res = await request(app).delete(`/products/${id}`);
            expect(res.status).toBe(204);
        });

        it('should return 400 if id is not an integer', async () => {
            const res = await request(app).delete('/products/abc');
            expect(res.status).toBe(400);
        });

        it('should return 404 if product not found', async () => {
            const res = await request(app).delete('/products/999');
            expect(res.status).toBe(404);
        });
    });
});