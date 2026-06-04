import { Router } from 'express';
import * as usersController from '../controllers/usersController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRole('TEACHER'));

router.post('/teacher', usersController.createTeacher);

export default router;
