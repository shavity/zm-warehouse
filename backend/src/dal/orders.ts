import db from '@dal/database';
import { buildSetClause } from '@utils/query_helpers';

export const getAllOrders = async () => {
    const result = await db.query(
        `SELECT
            orders.*,
            order_statuses.name as status_name,
            users.name as created_by_name
        FROM orders
        JOIN order_statuses ON orders.status_id = order_statuses.id
        JOIN users ON orders.created_by = users.id
        ORDER BY orders.id`
    );
    return result.rows;
};

export const getOrderById = async (id: number) => {
    const result = await db.query(
        `SELECT
            orders.*,
            order_statuses.name as status_name,
            users.name as created_by_name
        FROM orders
        JOIN order_statuses ON orders.status_id = order_statuses.id
        JOIN users ON orders.created_by = users.id
        WHERE orders.id = $1`,
        [id]
    );
    return result.rows[0];
};

export const createOrder = async (
    name: string,
    created_by: number,
    status_id: number,
    start_date: string,
    expire_date?: string
) => {
    const result = await db.query(
        `INSERT INTO orders (name, created_by, status_id, start_date, expire_date)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [name, created_by, status_id, start_date, expire_date ?? null]
    );
    return result.rows[0];
};

export const updateOrder = async (
    id: number,
    fields: Partial<{
        name: string,
        status_id: number,
        start_date: string,
        expire_date: string
    }>
) => {
    const setClause = buildSetClause(fields);
    const result = await db.query(
        `UPDATE orders
        SET ${setClause.setClause}
        WHERE orders.id = $${setClause.values.length + 1}
        RETURNING *`,
        [...setClause.values, id]
    );
    return result.rows[0];
};

export const deleteOrder = async (id: number) => {
    const result = await db.query(
        `DELETE FROM orders
        WHERE id = $1
        RETURNING *`,
        [id]
    );
    return result.rows[0];
};
