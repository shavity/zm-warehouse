import db from '@dal/database';

export const getAllOrderStatuses = async () => {
    const result = await db.query('SELECT * FROM order_statuses ORDER BY id');
    return result.rows;
};

export const getOrderStatusById = async (id: number) => {
    const result = await db.query(
        `SELECT * FROM order_statuses WHERE id = $1`,
        [id]
    );
    return result.rows[0];
};
