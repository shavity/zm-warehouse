import { Request, Response } from 'express';
import { addOrder, editOrder, getOrder, getOrders, removeOrder } from '../../../src/controllers/orders';
import * as orderStatusesDal from '../../../src/dal/order_statuses';
import * as ordersDal from '../../../src/dal/orders';
import * as usersDal from '../../../src/dal/users';

jest.mock('../../../src/dal/orders');
jest.mock('../../../src/dal/users');
jest.mock('../../../src/dal/order_statuses');

const mockRequest = (body = {}, params = {}) => ({ body, params } as Request);
const mockResponse = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

const fakeOrder = {
    id: 1,
    name: 'Summer Camp 2026',
    created_by: 1,
    created_by_name: 'Yair',
    status_id: 1,
    status_name: 'draft',
    start_date: '2026-06-01',
    expire_date: null,
};

const fakeUser = { id: 1, name: 'Yair', phone_number: '0501234567', role_id: 1 };
const fakeStatus = { id: 1, name: 'draft' };

describe('Orders Controller - Unit Tests', () => {

    beforeEach(() => jest.clearAllMocks());

    describe('getOrders', () => {
        it('should return all orders', async () => {
            (ordersDal.getAllOrders as jest.Mock).mockResolvedValue([fakeOrder]);
            const req = mockRequest();
            const res = mockResponse();
            await getOrders(req, res);
            expect(res.json).toHaveBeenCalledWith([fakeOrder]);
        });

        it('should return 500 if database fails', async () => {
            (ordersDal.getAllOrders as jest.Mock).mockRejectedValue(new Error('DB error'));
            const req = mockRequest();
            const res = mockResponse();
            await getOrders(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getOrder', () => {
        it('should return an order by id', async () => {
            (ordersDal.getOrderById as jest.Mock).mockResolvedValue(fakeOrder);
            const req = mockRequest({}, { id: '1' });
            const res = mockResponse();
            await getOrder(req, res);
            expect(res.json).toHaveBeenCalledWith(fakeOrder);
        });

        it('should return 400 if id is not an integer', async () => {
            const req = mockRequest({}, { id: 'abc' });
            const res = mockResponse();
            await getOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 404 if order not found', async () => {
            (ordersDal.getOrderById as jest.Mock).mockResolvedValue(undefined);
            const req = mockRequest({}, { id: '999' });
            const res = mockResponse();
            await getOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 500 if database fails', async () => {
            (ordersDal.getOrderById as jest.Mock).mockRejectedValue(new Error('DB error'));
            const req = mockRequest({}, { id: '1' });
            const res = mockResponse();
            await getOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('addOrder', () => {
        it('should return 201 if order created successfully', async () => {
            (usersDal.getUserById as jest.Mock).mockResolvedValue(fakeUser);
            (ordersDal.createOrder as jest.Mock).mockResolvedValue(fakeOrder);
            (orderStatusesDal.getOrderStatusById as jest.Mock).mockResolvedValue(fakeStatus);
            const req = mockRequest({
                name: 'Summer Camp 2026',
                created_by: 1,
                status_id: 1,
                start_date: '2026-06-01',
            });
            const res = mockResponse();
            await addOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(fakeOrder);
        });

        it('should return 201 with expire_date', async () => {
            (usersDal.getUserById as jest.Mock).mockResolvedValue(fakeUser);
            (ordersDal.createOrder as jest.Mock).mockResolvedValue({ ...fakeOrder, expire_date: '2026-06-10' });
            const req = mockRequest({
                name: 'Summer Camp 2026',
                created_by: 1,
                status_id: 1,
                start_date: '2026-06-01',
                expire_date: '2026-06-10',
            });
            const res = mockResponse();
            await addOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should return 400 if name is missing', async () => {
            const req = mockRequest({ created_by: 1, start_date: '2026-06-01' });
            const res = mockResponse();
            await addOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if created_by is missing', async () => {
            const req = mockRequest({ name: 'Summer Camp 2026', start_date: '2026-06-01' });
            const res = mockResponse();
            await addOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if start_date is missing', async () => {
            const req = mockRequest({ name: 'Summer Camp 2026', created_by: 1 });
            const res = mockResponse();
            await addOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if start_date is invalid', async () => {
            const req = mockRequest({
                name: 'Summer Camp 2026',
                created_by: 1,
                start_date: 'not-a-date',
            });
            const res = mockResponse();
            await addOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if expire_date is invalid', async () => {
            const req = mockRequest({
                name: 'Summer Camp 2026',
                created_by: 1,
                start_date: '2026-06-01',
                expire_date: 'not-a-date',
            });
            const res = mockResponse();
            await addOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if created_by is not a positive integer', async () => {
            const req = mockRequest({
                name: 'Summer Camp 2026',
                created_by: -1,
                start_date: '2026-06-01',
            });
            const res = mockResponse();
            await addOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 404 if user not found', async () => {
            (usersDal.getUserById as jest.Mock).mockResolvedValue(undefined);
            const req = mockRequest({
                name: 'Summer Camp 2026',
                created_by: 999,
                status_id: 1,
                start_date: '2026-06-01',
            });
            const res = mockResponse();
            await addOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 404 if order status not found', async () => {
            (usersDal.getUserById as jest.Mock).mockResolvedValue(undefined);
            const req = mockRequest({
                name: 'Summer Camp 2026',
                created_by: 999,
                status_id: 1,
                start_date: '2026-06-01',
            });
            const res = mockResponse();
            await addOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 500 if database fails', async () => {
            (usersDal.getUserById as jest.Mock).mockResolvedValue(fakeUser);
            (ordersDal.createOrder as jest.Mock).mockRejectedValue(new Error('DB error'));
            const req = mockRequest({
                name: 'Summer Camp 2026',
                created_by: 1,
                status_id: 1,
                start_date: '2026-06-01',
            });
            const res = mockResponse();
            await addOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('editOrder', () => {
        it('should return updated order', async () => {
            (ordersDal.updateOrder as jest.Mock).mockResolvedValue({ ...fakeOrder, name: 'Updated Camp' });
            const req = mockRequest({ name: 'Updated Camp' }, { id: '1' });
            const res = mockResponse();
            await editOrder(req, res);
            expect(res.json).toHaveBeenCalledWith({ ...fakeOrder, name: 'Updated Camp' });
        });

        it('should return 400 if id is not an integer', async () => {
            const req = mockRequest({ name: 'Updated Camp' }, { id: 'abc' });
            const res = mockResponse();
            await editOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if no fields provided', async () => {
            const req = mockRequest({}, { id: '1' });
            const res = mockResponse();
            await editOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if name is empty string', async () => {
            const req = mockRequest({ name: '   ' }, { id: '1' });
            const res = mockResponse();
            await editOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if start_date is invalid', async () => {
            const req = mockRequest({ start_date: 'not-a-date' }, { id: '1' });
            const res = mockResponse();
            await editOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 404 if status not found', async () => {
            (orderStatusesDal.getOrderStatusById as jest.Mock).mockResolvedValue(undefined);
            const req = mockRequest({ status_id: 999 }, { id: '1' });
            const res = mockResponse();
            await editOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 404 if order not found', async () => {
            (ordersDal.updateOrder as jest.Mock).mockResolvedValue(undefined);
            const req = mockRequest({ name: 'Updated Camp' }, { id: '999' });
            const res = mockResponse();
            await editOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 500 if database fails', async () => {
            (ordersDal.updateOrder as jest.Mock).mockRejectedValue(new Error('DB error'));
            const req = mockRequest({ name: 'Updated Camp' }, { id: '1' });
            const res = mockResponse();
            await editOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('removeOrder', () => {
        it('should return 204 if order deleted successfully', async () => {
            (ordersDal.getOrderById as jest.Mock).mockResolvedValue(fakeOrder);
            (ordersDal.deleteOrder as jest.Mock).mockResolvedValue(fakeOrder);
            const req = mockRequest({}, { id: '1' });
            const res = mockResponse();
            await removeOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(204);
        });

        it('should return 400 if id is not an integer', async () => {
            const req = mockRequest({}, { id: 'abc' });
            const res = mockResponse();
            await removeOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 404 if order not found', async () => {
            (ordersDal.getOrderById as jest.Mock).mockResolvedValue(undefined);
            const req = mockRequest({}, { id: '999' });
            const res = mockResponse();
            await removeOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 500 if database fails', async () => {
            (ordersDal.getOrderById as jest.Mock).mockResolvedValue(fakeOrder);
            (ordersDal.deleteOrder as jest.Mock).mockRejectedValue(new Error('DB error'));
            const req = mockRequest({}, { id: '1' });
            const res = mockResponse();
            await removeOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
