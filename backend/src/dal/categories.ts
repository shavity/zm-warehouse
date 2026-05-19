import db from '@dal/database';

export const getAllCategories = async () => {
    const result = await db.query('SELECT * FROM categories ORDER BY id');
    return result.rows;
};

export const getCategoryById = async (id: number) => {
    const result = await db.query(
        'SELECT * FROM categories WHERE id = $1',
        [id]
    );
    return result.rows[0];
}

export const getCategoryByName = async (name: string) => {
    const result = await db.query(
        'SELECT * FROM categories WHERE name = $1',
        [name]
    );
    return result.rows[0];
};

export const createCategory = async (name: string) => {
    const result = await db.query(
        'INSERT INTO categories (name) VALUES ($1) RETURNING *',
        [name]
    );
    return result.rows[0];
};

export const upsertCategory = async (name: string) => {
    const result = await db.query(
        `INSERT INTO categories (name) VALUES ($1)
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
     RETURNING *, (xmax = 0) AS inserted`,
        [name]
    );
    return result.rows[0];
};
