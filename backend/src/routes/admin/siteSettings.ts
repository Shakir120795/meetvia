import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { updateSiteSettingsSchema } from '../../validators/siteSettings';
import { getSiteSettings, updateSiteSettings } from '../../controllers/adminSiteSettingsController';

const router = Router();

// All site settings routes require authentication
router.use(authMiddleware);

// GET / — returns current site settings
router.get('/', getSiteSettings);

// PUT / — update site settings with validation
router.put('/', validate(updateSiteSettingsSchema), updateSiteSettings);

export default router;
