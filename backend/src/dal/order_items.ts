import db from '@dal/database';
import { buildSetClause } from '@utils/query_helpers';

export const getOrderItemsByOrderId = async (order_id: number) => {
    const result = await db.query(
        `SELECT
            order_items.*,
            products.name as product_name,
            products.room_id,
            rooms.name as room_name,
            users.name as taken_by_name,
            returners.name as returned_by_name
        FROM order_items
        JOIN products ON order_items.product_id = products.id
        JOIN rooms ON products.room_id = rooms.id
        LEFT JOIN users ON order_items.user_id = users.id
        LEFT JOIN users returners ON order_items.returned_by = returners.id
        WHERE order_items.order_id = $1
        ORDER BY rooms.id, products.name`,
        [order_id]
    );
    return result.rows;
};

export const getOrderItemByIds = async (order_id: number, product_id: number) => {
    const result = await db.query(
        `SELECT
            order_items.*,
            products.name as product_name,
            products.room_id,
            rooms.name as room_name,
            users.name as taken_by_name,
            returners.name as returned_by_name
        FROM order_items
        JOIN products ON order_items.product_id = products.id
        JOIN rooms ON products.room_id = rooms.id
        LEFT JOIN users ON order_items.user_id = users.id
        LEFT JOIN users returners ON order_items.returned_by = returners.id
        WHERE order_items.order_id = $1
        AND order_items.product_id = $2`,
        [order_id, product_id]
    );
    return result.rows[0];
};

export const createOrderItem = async (
    order_id: number,
    product_id: number,
    amount: number,
    user_id?: number
) => {
    const result = await db.query(
        `INSERT INTO order_items (order_id, product_id, amount, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [order_id, product_id, amount, user_id ?? null]
    );
    return result.rows[0];
};

export const updateOrderItem = async (
    order_id: number,
    product_id: number,
    fields: Partial<{
        amount: number,
        actual_amount: number,
        returned_amount: number,
        comment: string,
        user_id: number,
        returned_by: number
    }>
) => {
    const setClause = buildSetClause(fields);
    const result = await db.query(
        `UPDATE order_items
        SET ${setClause.setClause}
        WHERE order_id = $${setClause.values.length + 1}
        AND product_id = $${setClause.values.length + 2}
        RETURNING *`,
        [...setClause.values, order_id, product_id]
    );
    return result.rows[0];
};

export const deleteOrderItem = async (order_id: number, product_id: number) => {
    const result = await db.query(
        `DELETE FROM order_items
        WHERE order_id = $1
        AND product_id = $2
        RETURNING *`,
        [order_id, product_id]
    );
    return result.rows[0];
};
