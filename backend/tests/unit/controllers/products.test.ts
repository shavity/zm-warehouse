import { Request, Response } from 'express';
import { getProducts, getProduct, addProduct, editProduct, removeProduct } from '../../../src/controllers/products';
import * as productsDal from '../../../src/dal/products';
import * as roomsDal from '../../../src/dal/rooms';
import * as categoriesDal from '../../../src/dal/categories';

jest.mock('../../../src/dal/products');
jest.mock('../../../src/dal/rooms');
jest.mock('../../../src/dal/categories');

const mockRequest = (body = {}, params = {}) => ({ body, params } as Request);
const mockResponse = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

const fakeProduct = {
    id: 1,
    name: 'Knife',
    room_id: 1,
    room_name: 'Kitchen Room',
    category_id: 1,
    category_name: 'Kitchen',
    in_stock: 10,
    minimum_in_stock: 2,
    is_expendable: false,
    picture_url: null,
};

const fakeRoom = { id: 1, name: 'Kitchen Room' };
const fakeCategory = { id: 1, name: 'Kitchen' };

describe('Products Controller - Unit Tests', () => {

    beforeEach(() => jest.clearAllMocks());

    describe('getProducts', () => {
        it('should return all products', async () => {
            (productsDal.getAllProducts as jest.Mock).mockResolvedValue([fakeProduct]);
            const req = mockRequest();
            const res = mockResponse();
            await getProducts(req, res);
            expect(res.json).toHaveBeenCalledWith([fakeProduct]);
        });

        it('should return 500 if database fails', async () => {
            (productsDal.getAllProducts as jest.Mock).mockRejectedValue(new Error('DB error'));
            const req = mockRequest();
            const res = mockResponse();
            await getProducts(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getProduct', () => {
        it('should return a product by id', async () => {
            (productsDal.getProductById as jest.Mock).mockResolvedValue(fakeProduct);
            const req = mockRequest({}, { id: '1' });
            const res = mockResponse();
            await getProduct(req, res);
            expect(res.json).toHaveBeenCalledWith(fakeProduct);
        });

        it('should return 400 if id is not an integer', async () => {
            const req = mockRequest({}, { id: 'abc' });
            const res = mockResponse();
            await getProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 404 if product not found', async () => {
            (productsDal.getProductById as jest.Mock).mockResolvedValue(undefined);
            const req = mockRequest({}, { id: '999' });
            const res = mockResponse();
            await getProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 500 if database fails', async () => {
            (productsDal.getProductById as jest.Mock).mockRejectedValue(new Error('DB error'));
            const req = mockRequest({}, { id: '1' });
            const res = mockResponse();
            await getProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('addProduct', () => {
        it('should return 201 if product created successfully', async () => {
            (roomsDal.getRoomById as jest.Mock).mockResolvedValue(fakeRoom);
            (categoriesDal.getCategoryById as jest.Mock).mockResolvedValue(fakeCategory);
            (productsDal.createProduct as jest.Mock).mockResolvedValue(fakeProduct);
            const req = mockRequest({
                name: 'Knife',
                room_id: 1,
                category_id: 1,
                in_stock: 10,
                minimum_in_stock: 2,
                is_expendable: false,
            });
            const res = mockResponse();
            await addProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(fakeProduct);
        });

        it('should return 201 with picture_url', async () => {
            (roomsDal.getRoomById as jest.Mock).mockResolvedValue(fakeRoom);
            (categoriesDal.getCategoryById as jest.Mock).mockResolvedValue(fakeCategory);
            (productsDal.createProduct as jest.Mock).mockResolvedValue({ ...fakeProduct, picture_url: 'http://example.com/knife.jpg' });
            const req = mockRequest({
                name: 'Knife',
                room_id: 1,
                category_id: 1,
                in_stock: 10,
                minimum_in_stock: 2,
                is_expendable: false,
                picture_url: 'http://example.com/knife.jpg',
            });
            const res = mockResponse();
            await addProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should return 400 if name is missing', async () => {
            const req = mockRequest({
                room_id: 1,
                category_id: 1,
                in_stock: 10,
                minimum_in_stock: 2,
                is_expendable: false,
            });
            const res = mockResponse();
            await addProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if name is not a string', async () => {
            const req = mockRequest({
                name: 123,
                room_id: 1,
                category_id: 1,
                in_stock: 10,
                minimum_in_stock: 2,
                is_expendable: false,
            });
            const res = mockResponse();
            await addProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if room_id is not a positive integer', async () => {
            const req = mockRequest({
                name: 'Knife',
                room_id: -1,
                category_id: 1,
                in_stock: 10,
                minimum_in_stock: 2,
                is_expendable: false,
            });
            const res = mockResponse();
            await addProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if category_id is not a positive integer', async () => {
            const req = mockRequest({
                name: 'Knife',
                room_id: 1,
                category_id: -1,
                in_stock: 10,
                minimum_in_stock: 2,
                is_expendable: false,
            });
            const res = mockResponse();
            await addProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if in_stock is negative', async () => {
            const req = mockRequest({
                name: 'Knife',
                room_id: 1,
                category_id: 1,
                in_stock: -1,
                minimum_in_stock: 2,
                is_expendable: false,
            });
            const res = mockResponse();
            await addProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if minimum_in_stock is not positive integer', async () => {
            (roomsDal.getRoomById as jest.Mock).mockResolvedValue(fakeRoom);
            (categoriesDal.getCategoryById as jest.Mock).mockResolvedValue(fakeCategory);
            (productsDal.createProduct as jest.Mock).mockResolvedValue({ ...fakeProduct, in_stock: 0 });
            const req = mockRequest({
                name: 'Knife',
                room_id: 1,
                category_id: 1,
                in_stock: 0,
                minimum_in_stock: -1,
                is_expendable: false,
            });
            const res = mockResponse();
            await addProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if is_expendable is not a boolean', async () => {
            const req = mockRequest({
                name: 'Knife',
                room_id: 1,
                category_id: 1,
                in_stock: 10,
                minimum_in_stock: 2,
                is_expendable: 'yes',
            });
            const res = mockResponse();
            await addProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 404 if room not found', async () => {
            (roomsDal.getRoomById as jest.Mock).mockResolvedValue(undefined);
            const req = mockRequest({
                name: 'Knife',
                room_id: 999,
                category_id: 1,
                in_stock: 10,
                minimum_in_stock: 2,
                is_expendable: false,
            });
            const res = mockResponse();
            await addProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 404 if category not found', async () => {
            (roomsDal.getRoomById as jest.Mock).mockResolvedValue(fakeRoom);
            (categoriesDal.getCategoryById as jest.Mock).mockResolvedValue(undefined);
            const req = mockRequest({
                name: 'Knife',
                room_id: 1,
                category_id: 999,
                in_stock: 10,
                minimum_in_stock: 2,
                is_expendable: false,
            });
            const res = mockResponse();
            await addProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 500 if database fails', async () => {
            (roomsDal.getRoomById as jest.Mock).mockResolvedValue(fakeRoom);
            (categoriesDal.getCategoryById as jest.Mock).mockResolvedValue(fakeCategory);
            (productsDal.createProduct as jest.Mock).mockRejectedValue(new Error('DB error'));
            const req = mockRequest({
                name: 'Knife',
                room_id: 1,
                category_id: 1,
                in_stock: 10,
                minimum_in_stock: 2,
                is_expendable: false,
            });
            const res = mockResponse();
            await addProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('editProduct', () => {
        it('should return updated product', async () => {
            (productsDal.updateProduct as jest.Mock).mockResolvedValue({ ...fakeProduct, name: 'Updated Knife' });
            const req = mockRequest({ name: 'Updated Knife' }, { id: '1' });
            const res = mockResponse();
            await editProduct(req, res);
            expect(res.json).toHaveBeenCalledWith({ ...fakeProduct, name: 'Updated Knife' });
        });

        it('should return 400 if id is not an integer', async () => {
            const req = mockRequest({ name: 'Knife' }, { id: 'abc' });
            const res = mockResponse();
            await editProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if no fields provided', async () => {
            const req = mockRequest({}, { id: '1' });
            const res = mockResponse();
            await editProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if name is empty string', async () => {
            const req = mockRequest({ name: '   ' }, { id: '1' });
            const res = mockResponse();
            await editProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if in_stock is negative', async () => {
            const req = mockRequest({ in_stock: -1 }, { id: '1' });
            const res = mockResponse();
            await editProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if is_expendable is not a boolean', async () => {
            const req = mockRequest({ is_expendable: 'yes' }, { id: '1' });
            const res = mockResponse();
            await editProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 404 if room not found', async () => {
            (roomsDal.getRoomById as jest.Mock).mockResolvedValue(undefined);
            const req = mockRequest({ room_id: 999 }, { id: '1' });
            const res = mockResponse();
            await editProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 404 if category not found', async () => {
            (categoriesDal.getCategoryById as jest.Mock).mockResolvedValue(undefined);
            const req = mockRequest({ category_id: 999 }, { id: '1' });
            const res = mockResponse();
            await editProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 404 if product not found', async () => {
            (productsDal.updateProduct as jest.Mock).mockResolvedValue(undefined);
            const req = mockRequest({ name: 'Knife' }, { id: '999' });
            const res = mockResponse();
            await editProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 500 if database fails', async () => {
            (productsDal.updateProduct as jest.Mock).mockRejectedValue(new Error('DB error'));
            const req = mockRequest({ name: 'Knife' }, { id: '1' });
            const res = mockResponse();
            await editProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('removeProduct', () => {
        it('should return 204 if product deleted successfully', async () => {
            (productsDal.getProductById as jest.Mock).mockResolvedValue(fakeProduct);
            (productsDal.deleteProduct as jest.Mock).mockResolvedValue(fakeProduct);
            const req = mockRequest({}, { id: '1' });
            const res = mockResponse();
            await removeProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(204);
        });

        it('should return 400 if id is not an integer', async () => {
            const req = mockRequest({}, { id: 'abc' });
            const res = mockResponse();
            await removeProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 404 if product not found', async () => {
            (productsDal.getProductById as jest.Mock).mockResolvedValue(undefined);
            const req = mockRequest({}, { id: '999' });
            const res = mockResponse();
            await removeProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 500 if database fails', async () => {
            (productsDal.getProductById as jest.Mock).mockResolvedValue(fakeProduct);
            (productsDal.deleteProduct as jest.Mock).mockRejectedValue(new Error('DB error'));
            const req = mockRequest({}, { id: '1' });
            const res = mockResponse();
            await removeProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
