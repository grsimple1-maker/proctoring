import { Router } from 'express';
import * as testsController from '../controllers/testsController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = Router();

router.use(authenticateToken);

router.get('/', testsController.getTests);
router.get('/:id', testsController.getTestById);
router.post('/', requireRole('TEACHER'), testsController.createTest);
router.put('/:id', requireRole('TEACHER'), testsController.updateTest);
router.delete('/:id', requireRole('TEACHER'), testsController.deleteTest);

export default router;
