import { Router } from 'express';
import { getThemeSettings } from '../../controllers/publicThemeController';

const router = Router();

// GET /api/v1/public/theme
router.get('/', getThemeSettings);

export default router;
