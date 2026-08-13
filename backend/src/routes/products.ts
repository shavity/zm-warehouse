import { addProduct, editProduct, getProduct, getProducts, removeProduct } from '@controllers/products';
import { Router } from 'express';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', addProduct);
router.patch('/:id', editProduct);
router.delete('/:id', removeProduct);

export default router;
