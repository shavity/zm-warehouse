import db from '@dal/database';
import { buildSetClause } from '@utils/query_helpers';

export const getAllUsers = async () => {
    const result = await db.query(`
    SELECT users.*, roles.name as role_name 
    FROM users 
    JOIN roles ON users.role_id = roles.id 
    ORDER BY users.id
  `);
    return result.rows;
};

export const getUserById = async (id: number) => {
    const result = await db.query(
        `
    SELECT users.*, roles.name as role_name 
    FROM users 
    JOIN roles ON users.role_id = roles.id 
    WHERE users.id = $1
  `,
        [id]
    );
    return result.rows[0];
};

export const createUser = async (
    name: string,
    phone_number: string,
    role_id: number
) => {
    const result = await db.query(
        `
    INSERT INTO users (name, phone_number, role_id) 
    VALUES ($1, $2, $3) 
    RETURNING *
  `,
        [name, phone_number, role_id]
    );
    return result.rows[0];
};

export const updateUser = async (
    id: number,
    fields: Partial<{ name: string; phone_number: string; role_id: number }>
) => {
    const setClause = buildSetClause(fields);

    const result = await db.query(
        `
    UPDATE users 
    SET ${setClause.setClause}
    WHERE users.id = $${setClause.values.length + 1}
    RETURNING *
  `,
        [...setClause.values, id]
    );

    return result.rows[0]; // undefined in case the user not
};

export const deleteUser = async (id: number) => {
    const result = await db.query(
        `
    DELETE FROM users 
    WHERE id = $1 
    RETURNING *
  `,
        [id]
    );
    return result.rows[0];
};
