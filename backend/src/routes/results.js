import { Router } from 'express';
import * as resultsController from '../controllers/resultsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', resultsController.getAllResults);
router.post('/start', resultsController.startExam);
router.post('/:id/answer', resultsController.saveAnswer);
router.post('/:id/warning', resultsController.addWarning);
router.post('/:id/finish', resultsController.finishExam);

export default router;
