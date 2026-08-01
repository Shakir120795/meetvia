import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { updateHowItWorksSchema } from '../../validators/howItWorks';
import { getHowItWorksSteps, updateHowItWorksSteps } from '../../controllers/adminHowItWorksController';

const router = Router();

// All how-it-works routes require authentication
router.use(authMiddleware);

// GET / — get all steps sorted by displayOrder
router.get('/', getHowItWorksSteps);

// PUT / — replace all steps (accepts { steps: [...] }, max 10 steps)
router.put('/', validate(updateHowItWorksSchema), updateHowItWorksSteps);

export default router;
