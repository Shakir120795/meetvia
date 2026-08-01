import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { updateThemeSchema } from '../../validators/theme';
import { getTheme, updateTheme } from '../../controllers/adminThemeController';

const router = Router();

// All theme routes require authentication
router.use(authMiddleware);

// GET / — returns current theme settings
router.get('/', getTheme);

// PUT / — update theme settings with hex color and range validation
router.put('/', validate(updateThemeSchema), updateTheme);

export default router;
