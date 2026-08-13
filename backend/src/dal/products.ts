import db from '@dal/database';
import { CreateProductInput, Product, UpdateProductInput } from '@models/product';
import { buildSetClause } from '@utils/query_helpers';

export const getAllProducts = async (): Promise<Product[]> => {
    const result = await db.query(
        `SELECT 
            products.*,
            rooms.name as room_name,
            categories.name as category_name
        FROM products
        JOIN rooms ON products.room_id = rooms.id
        JOIN categories ON products.category_id = categories.id
        ORDER BY products.id`
    );
    return result.rows;
};

export const getProductById = async (id: number): Promise<Product | undefined> => {
    const result = await db.query(
        `SELECT 
            products.*,
            rooms.name as room_name,
            categories.name as category_name
        FROM products
        JOIN rooms ON products.room_id = rooms.id
        JOIN categories ON products.category_id = categories.id
        WHERE products.id = $1`,
        [id]
    );
    return result.rows[0];
};

export const createProduct = async (input: CreateProductInput): Promise<Product> => {
    const result = await db.query(
        `INSERT INTO products (name, room_id, category_id, in_stock, minimum_in_stock, is_expendable, picture_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [input.name, input.room_id, input.category_id, input.in_stock, input.minimum_in_stock, input.is_expendable, input.picture_url ?? null]
    );
    return result.rows[0];
};

export const updateProduct = async (id: number, fields: UpdateProductInput): Promise<Product | undefined> => {
    const setClause = buildSetClause(fields);
    const result = await db.query(
        `UPDATE products
        SET ${setClause.setClause}
        WHERE products.id = $${setClause.values.length + 1}
        RETURNING *`,
        [...setClause.values, id]
    );
    return result.rows[0];
};

export const deleteProduct = async (id: number): Promise<Product | undefined> => {
    const result = await db.query(
        `DELETE FROM products
        WHERE id = $1
        RETURNING *`,
        [id]
    );
    return result.rows[0];
};
