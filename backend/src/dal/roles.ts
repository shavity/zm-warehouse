import db from '@dal/database';

export const getAllRoles = async () => {
    const result = await db.query('SELECT * FROM roles ORDER BY id');
    return result.rows;
};

export const getRoleById = async (id: number) => {
    const result = await db.query(
        'SELECT * FROM roles WHERE id = $1',
        [id]  
    );
};
