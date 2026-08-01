import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { getInquiries, updateInquiry } from '../../controllers/adminInquiriesController';

const router = Router();

// All inquiry routes require authentication
router.use(authMiddleware);

// GET / — list all inquiries with optional ?status= filter and ?search= for fullName/email
router.get('/', getInquiries);

// PUT /:id — update inquiry status and admin notes
router.put('/:id', updateInquiry);

export default router;
