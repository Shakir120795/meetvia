import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import { 
  getFeatureToggles,
  getFeatureToggle,
  upsertFeatureToggle,
  deleteFeatureToggle
} from '../../controllers/adminFeatureToggleController';

const router = Router();

// All feature toggle routes require admin auth
router.use(authMiddleware);

// Routes requiring specific permissions
router.get('/', requirePermission('view_site_settings'), getFeatureToggles);
router.get('/:key', requirePermission('view_site_settings'), getFeatureToggle);
router.post('/', requirePermission('manage_site_settings'), upsertFeatureToggle);
router.put('/:key', requirePermission('manage_site_settings'), upsertFeatureToggle);
router.delete('/:key', requirePermission('manage_site_settings'), deleteFeatureToggle);

export default router;