import { Router } from 'express';
import { getProducts, getProduct, addProduct, editProduct, removeProduct } from '@controllers/products';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', addProduct);
router.patch('/:id', editProduct);
router.delete('/:id', removeProduct);

export default router;
