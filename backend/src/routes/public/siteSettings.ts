import { Router } from 'express';
import { getSiteSettings } from '../../controllers/publicSiteSettingsController';

const router = Router();

// GET /api/v1/public/site-settings
router.get('/', getSiteSettings);

export default router;
