import db from '@dal/database';
import { Role } from '@models/role';

export const getAllRoles = async (): Promise<Role[]> => {
    const result = await db.query('SELECT * FROM roles ORDER BY id');
    return result.rows;
};

export const getRoleById = async (id: number): Promise<Role | undefined> => {
    const result = await db.query(
        'SELECT * FROM roles WHERE id = $1',
        [id]  
    );
    return result.rows[0];
};
