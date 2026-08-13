import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const db = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

db.connect()
    .then(() => console.log('✅ Connected to ZM database'))
    .catch((err) =>
        console.error('❌ Database connection failed:', err.message)
    );

export default db;
