import { Request, Response } from 'express';
import { getOrderItems, addOrderItem, editOrderItem, removeOrderItem } from '../../../src/controllers/order_items';
import * as orderItemsDal from '../../../src/dal/order_items';
import * as ordersDal from '../../../src/dal/orders';
import * as productsDal from '../../../src/dal/products';
import * as usersDal from '../../../src/dal/users';

jest.mock('../../../src/dal/order_items');
jest.mock('../../../src/dal/orders');
jest.mock('../../../src/dal/products');
jest.mock('../../../src/dal/users');

const mockRequest = (body = {}, params = {}) => ({ body, params } as Request);
const mockResponse = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

const fakeOrder = { id: 1, name: 'Summer Camp 2026', status_id: 1 };
const fakeProduct = { id: 1, name: 'Knife', room_id: 1, category_id: 1 };
const fakeUser = { id: 1, name: 'Yair', phone_number: '0501234567', role_id: 1 };
const fakeOrderItem = {
    order_id: 1,
    product_id: 1,
    product_name: 'Knife',
    room_id: 1,
    room_name: 'Kitchen Room',
    amount: 10,
    actual_amount: null,
    returned_amount: null,
    comment: null,
    user_id: null,
    returned_by: null,
    taken_by_name: null,
    returned_by_name: null,
};

describe('Order Items Controller - Unit Tests', () => {

    beforeEach(() => jest.clearAllMocks());

    describe('getOrderItems', () => {
        it('should return all order items', async () => {
            (ordersDal.getOrderById as jest.Mock).mockResolvedValue(fakeOrder);
            (orderItemsDal.getOrderItemsByOrderId as jest.Mock).mockResolvedValue([fakeOrderItem]);
            const req = mockRequest({}, { order_id: '1' });
            const res = mockResponse();
            await getOrderItems(req, res);
            expect(res.json).toHaveBeenCalledWith([fakeOrderItem]);
        });

        it('should return 400 if order_id is not an integer', async () => {
            const req = mockRequest({}, { order_id: 'abc' });
            const res = mockResponse();
            await getOrderItems(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 404 if order not found', async () => {
            (ordersDal.getOrderById as jest.Mock).mockResolvedValue(undefined);
            const req = mockRequest({}, { order_id: '999' });
            const res = mockResponse();
            await getOrderItems(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 500 if database fails', async () => {
            (ordersDal.getOrderById as jest.Mock).mockResolvedValue(fakeOrder);
            (orderItemsDal.getOrderItemsByOrderId as jest.Mock).mockRejectedValue(new Error('DB error'));
            const req = mockRequest({}, { order_id: '1' });
            const res = mockResponse();
            await getOrderItems(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('addOrderItem', () => {
        it('should return 201 if order item created successfully', async () => {
            (ordersDal.getOrderById as jest.Mock).mockResolvedValue(fakeOrder);
            (productsDal.getProductById as jest.Mock).mockResolvedValue(fakeProduct);
            (orderItemsDal.getOrderItemByIds as jest.Mock).mockResolvedValue(undefined);
            (orderItemsDal.createOrderItem as jest.Mock).mockResolvedValue(fakeOrderItem);
            const req = mockRequest({ product_id: 1, amount: 10 }, { order_id: '1' });
            const res = mockResponse();
            await addOrderItem(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(fakeOrderItem);
        });

        it('should return 400 if product_id is missing', async () => {
            const req = mockRequest({ amount: 10 }, { order_id: '1' });
            const res = mockResponse();
            await addOrderItem(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if amount is missing', async () => {
            const req = mockRequest({ product_id: 1 }, { order_id: '1' });
            const res = mockResponse();
            await addOrderItem(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if amount is not a positive integer', async () => {
            const req = mockRequest({ product_id: 1, amount: -1 }, { order_id: '1' });
            const res = mockResponse();
            await addOrderItem(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if order_id is not an integer', async () => {
            const req = mockRequest({ product_id: 1, amount: 10 }, { order_id: 'abc' });
            const res = mockResponse();
            await addOrderItem(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 404 if order not found', async () => {
            (ordersDal.getOrderById as jest.Mock).mockResolvedValue(undefined);
            const req = mockRequest({ product_id: 1, amount: 10 }, { order_id: '999' });
            const res = mockResponse();
            await addOrderItem(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 404 if product not found', async () => {
            (ordersDal.getOrderById as jest.Mock).mockResolvedValue(fakeOrder);
            (productsDal.getProductById as jest.Mock).mockResolvedValue(undefined);
            const req = mockRequest({ product_id: 999, amount: 10 }, { order_id: '1' });
            const res = mockResponse();
            await addOrderItem(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 404 if user not found', async () => {
            (ordersDal.getOrderById as jest.Mock).mockResolvedValue(fakeOrder);
            (productsDal.getProductById as jest.Mock).mockResolvedValue(fakeProduct);
            (usersDal.getUserById as jest.Mock).mockResolvedValue(undefined);
            (orderItemsDal.getOrderItemByIds as jest.Mock).mockResolvedValue(undefined);
            const req = mockRequest({ product_id: 1, amount: 10, user_id: 999 }, { order_id: '1' });
            const res = mockResponse();
            await addOrderItem(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 409 if order item already exists', async () => {
            (ordersDal.getOrderById as jest.Mock).mockResolvedValue(fakeOrder);
            (productsDal.getProductById as jest.Mock).mockResolvedValue(fakeProduct);
            (orderItemsDal.getOrderItemByIds as jest.Mock).mockResolvedValue(fakeOrderItem);
            const req = mockRequest({ product_id: 1, amount: 10 }, { order_id: '1' });
            const res = mockResponse();
            await addOrderItem(req, res);
            expect(res.status).toHaveBeenCalledWith(409);
        });

        it('should return 500 if database fails', async () => {
            (ordersDal.getOrderById as jest.Mock).mockResolvedValue(fakeOrder);
            (productsDal.getProductById as jest.Mock).mockResolvedValue(fakeProduct);
            (orderItemsDal.getOrderItemByIds as jest.Mock).mockResolvedValue(undefined);
            (orderItemsDal.createOrderItem as jest.Mock).mockRejectedValue(new Error('DB error'));
            const req = mockRequest({ product_id: 1, amount: 10 }, { order_id: '1' });
            const res = mockResponse();
            await addOrderItem(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('editOrderItem', () => {
        it('should return updated order item', async () => {
            (usersDal.getUserById as jest.Mock).mockResolvedValue(fakeUser);
            (orderItemsDal.getOrderItemByIds as jest.Mock).mockResolvedValue(fakeOrderItem);
            (orderItemsDal.updateOrderItem as jest.Mock).mockResolvedValue({ ...fakeOrderItem, actual_amount: 8 });
            const req = mockRequest({ actual_amount: 8 }, { order_id: '1', product_id: '1' });
            const res = mockResponse();
            await editOrderItem(req, res);
            expect(res.json).toHaveBeenCalledWith({ ...fakeOrderItem, actual_amount: 8 });
        });

        it('should return 400 if order_id is not an integer', async () => {
            const req = mockRequest({ actual_amount: 8 }, { order_id: 'abc', product_id: '1' });
            const res = mockResponse();
            await editOrderItem(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if product_id is not an integer', async () => {
            const req = mockRequest({ actual_amount: 8 }, { order_id: '1', product_id: 'abc' });
            const res = mockResponse();
            await editOrderItem(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if no fields provided', async () => {
            const req = mockRequest({}, { order_id: '1', product_id: '1' });
            const res = mockResponse();
            await editOrderItem(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if amount is not a positive integer', async () => {
            const req = mockRequest({ amount: -1 }, { order_id: '1', product_id: '1' });
            const res = mockResponse();
            await editOrderItem(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if actual_amount is negative', async () => {
            const req = mockRequest({ actual_amount: -1 }, { order_id: '1', product_id: '1' });
            const res = mockResponse();
            await editOrderItem(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if comment is empty string', async () => {
            const req = mockRequest({ comment: '   ' }, { order_id: '1', product_id: '1' });
            const res = mockResponse();
            await editOrderItem(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 404 if user not found', async () => {
            (usersDal.getUserById as jest.Mock).mockResolvedValue(undefined);
            const req = mockRequest({ user_id: 999 }, { order_id: '1', product_id: '1' });
            const res = mockResponse();
            await editOrderItem(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 404 if returned_by user not found', async () => {
            (usersDal.getUserById as jest.Mock).mockResolvedValue(undefined);
            const req = mockRequest({ returned_by: 999 }, { order_id: '1', product_id: '1' });
            const res = mockResponse();
            await editOrderItem(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 404 if order item not found', async () => {
            (orderItemsDal.getOrderItemByIds as jest.Mock).mockResolvedValue(undefined);
            const req = mockRequest({ actual_amount: 8 }, { order_id: '999', product_id: '999' });
            const res = mockResponse();
            await editOrderItem(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 500 if database fails', async () => {
            (orderItemsDal.getOrderItemByIds as jest.Mock).mockResolvedValue(fakeOrderItem);
            (orderItemsDal.updateOrderItem as jest.Mock).mockRejectedValue(new Error('DB error'));
            const req = mockRequest({ actual_amount: 8 }, { order_id: '1', product_id: '1' });
            const res = mockResponse();
            await editOrderItem(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('removeOrderItem', () => {
        it('should return 204 if order item deleted successfully', async () => {
            (orderItemsDal.getOrderItemByIds as jest.Mock).mockResolvedValue(fakeOrderItem);
            (orderItemsDal.deleteOrderItem as jest.Mock).mockResolvedValue(fakeOrderItem);
            const req = mockRequest({}, { order_id: '1', product_id: '1' });
            const res = mockResponse();
            await removeOrderItem(req, res);
            expect(res.status).toHaveBeenCalledWith(204);
        });

        it('should return 400 if order_id is not an integer', async () => {
            const req = mockRequest({}, { order_id: 'abc', product_id: '1' });
            const res = mockResponse();
            await removeOrderItem(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 404 if order item not found', async () => {
            (orderItemsDal.getOrderItemByIds as jest.Mock).mockResolvedValue(undefined);
            const req = mockRequest({}, { order_id: '999', product_id: '999' });
            const res = mockResponse();
            await removeOrderItem(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 500 if database fails', async () => {
            (orderItemsDal.getOrderItemByIds as jest.Mock).mockResolvedValue(fakeOrderItem);
            (orderItemsDal.deleteOrderItem as jest.Mock).mockRejectedValue(new Error('DB error'));
            const req = mockRequest({}, { order_id: '1', product_id: '1' });
            const res = mockResponse();
            await removeOrderItem(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});