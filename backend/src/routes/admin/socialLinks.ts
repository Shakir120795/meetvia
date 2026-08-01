import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createSocialLinkSchema, updateSocialLinkSchema } from '../../validators/socialLink';
import {
  getSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from '../../controllers/adminSocialLinksController';

const router = Router();

// All social links routes require authentication
router.use(authMiddleware);

// GET / — list all social links sorted by displayOrder
router.get('/', getSocialLinks);

// POST / — create a new social link (URL validation via schema)
router.post('/', validate(createSocialLinkSchema), createSocialLink);

// PUT /:id — update a social link
router.put('/:id', validate(updateSocialLinkSchema), updateSocialLink);

// DELETE /:id — delete a social link
router.delete('/:id', deleteSocialLink);

export default router;
