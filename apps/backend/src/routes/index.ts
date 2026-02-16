import { Router, type IRouter } from 'express';
import { requireAuth } from '../middleware/auth.js';
import authRoutes from './auth.js';
import sponsorsRoutes from './sponsors.js';
import publishersRoutes from './publishers.js';
import campaignsRoutes from './campaigns.js';
import adSlotsRoutes from './adSlots.js';
import placementsRoutes from './placements.js';
import dashboardRoutes from './dashboard.js';
import healthRoutes from './health.js';

const router: IRouter = Router();

// Public routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/ad-slots', adSlotsRoutes);

// Protected routes
router.use('/campaigns', requireAuth, campaignsRoutes);
router.use('/sponsors', requireAuth, sponsorsRoutes);
router.use('/publishers', requireAuth, publishersRoutes);
router.use('/placements', requireAuth, placementsRoutes);
router.use('/dashboard', requireAuth, dashboardRoutes);

export default router;
