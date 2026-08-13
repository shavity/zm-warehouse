import { getRoles } from '@controllers/roles';
import { Router } from 'express';

const router = Router();

router.get('/', getRoles);

export default router;
