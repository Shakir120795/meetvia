import { Router } from 'express';
import { getHowItWorksSteps } from '../../controllers/publicHowItWorksController';

const router = Router();

// GET /api/v1/public/how-it-works
router.get('/', getHowItWorksSteps);

export default router;
