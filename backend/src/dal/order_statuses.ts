import db from '@dal/database';

export const getAllOrderStatuses = async () => {
    const result = await db.query('SELECT * FROM order_statuses ORDER BY id');
    return result.rows;
};
