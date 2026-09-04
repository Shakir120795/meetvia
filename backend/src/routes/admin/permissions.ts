import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import { 
  getAllPermissions,
  createPermission,
  updatePermission,
  deletePermission
} from '../../controllers/adminPermissionsController';

const router = Router();

// All permission routes require admin auth
router.use(authMiddleware);

// Routes requiring specific permissions
router.get('/', requirePermission('view_permissions'), getAllPermissions);
router.post('/', requirePermission('manage_permissions'), createPermission);
router.put('/:id', requirePermission('manage_permissions'), updatePermission);
router.delete('/:id', requirePermission('manage_permissions'), deletePermission);

export default router;