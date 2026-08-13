import { addCategory, getCategories } from '@controllers/categories';
import { Router } from 'express';

const router = Router();

router.get('/', getCategories);
router.post('/', addCategory);

export default router;
