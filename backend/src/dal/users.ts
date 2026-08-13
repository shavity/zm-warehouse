import db from '@dal/database';
import { CreateUserInput, UpdateUserInput, User } from '@models/user';
import { buildSetClause } from '@utils/query_helpers';

export const getAllUsers = async (): Promise<User[]> => {
    const result = await db.query(
        `SELECT
            users.*,
            roles.name as role_name
        FROM users
        JOIN roles ON users.role_id = roles.id
        WHERE users.deleted_at IS NULL
        ORDER BY users.id`
    );
    return result.rows;
};

export const getUserById = async (id: number): Promise<User | undefined> => {
    const result = await db.query(
        `SELECT
            users.*,
            roles.name as role_name
        FROM users
        JOIN roles ON users.role_id = roles.id
        WHERE users.id = $1
        AND users.deleted_at IS NULL`,
        [id]
    );
    return result.rows[0];
};

export const createUser = async (input: CreateUserInput): Promise<User> => {
    const result = await db.query(
        `INSERT INTO users (name, phone_number, role_id)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [input.name, input.phone_number, input.role_id]
    );
    return result.rows[0];
};

export const updateUser = async (id: number, fields: UpdateUserInput): Promise<User | undefined> => {
    const setClause = buildSetClause(fields);
    const result = await db.query(
        `UPDATE users
        SET ${setClause.setClause}
        WHERE users.id = $${setClause.values.length + 1}
        AND deleted_at IS NULL
        RETURNING *`,
        [...setClause.values, id]
    );
    return result.rows[0];
};

export const deleteUser = async (id: number): Promise<User | undefined> => {
    const result = await db.query(
        `DELETE FROM users 
        WHERE id = $1 
        RETURNING *`,
        [id]
    );
    return result.rows[0];
};
