import { Router } from 'express';
import prisma from '../../config/db';

const router = Router();

/**
 * Get public configuration (feature toggles that should be visible to frontend)
 */
router.get('/config', async (_req, res) => {
  try {
    // Get login methods configuration
    const loginMethodsToggle = await prisma.siteFeatureToggle.findUnique({
      where: { key: 'login_methods_enabled' }
    });

    // Get site taglines
    const taglinesToggle = await prisma.siteFeatureToggle.findUnique({
      where: { key: 'site_taglines' }
    });

    const config = {
      loginMethods: loginMethodsToggle?.isEnabled ? loginMethodsToggle.value : {},
      taglines: taglinesToggle?.isEnabled ? taglinesToggle.value : {}
    };

    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to load configuration' }
    });
  }
});

export default router;