import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import '@dal/database';
import roomsRouter from '@routes/rooms';
import categoriesRouter from '@routes/categories';
import rolesRouter from '@routes/roles';
import orderStatusesRouter from '@routes/order_statuses';
import usersRouter from '@routes/users';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.use('/rooms', roomsRouter);
app.use('/categories', categoriesRouter);
app.use('/roles', rolesRouter);
app.use('/order-statuses', orderStatusesRouter);
app.use('/users', usersRouter);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'ZM Logistics API is running' });
});

export default app;
