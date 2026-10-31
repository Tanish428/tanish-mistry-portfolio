import { Router } from 'express';
import { getLiveness, getReadiness } from '../controllers/health.controller.js';
import authRoutes from '../modules/auth/auth.routes.js';
import {
  adminProfileRouter,
  publicProfileRouter,
} from '../modules/profile/profile.routes.js';
import {
  adminProjectRouter,
  publicProjectRouter,
} from '../modules/projects/project.routes.js';
import {
  adminSkillCategoryRouter,
  adminSkillRouter,
  publicSkillCategoryRouter,
  publicSkillRouter,
} from '../modules/skills/skills.routes.js';

const router = Router();

// Health routes
router.get('/health/live', getLiveness);
router.get('/health/ready', getReadiness);

// Authentication routes
router.use('/auth', authRoutes);

// Profile routes
router.use('/admin/profile', adminProfileRouter);
router.use('/portfolio/profile', publicProfileRouter);

// Project routes
router.use('/admin/projects', adminProjectRouter);
router.use('/portfolio/projects', publicProjectRouter);

// Skills & categories routes
router.use('/admin/skill-categories', adminSkillCategoryRouter);
router.use('/admin/skills', adminSkillRouter);
router.use('/portfolio/skill-categories', publicSkillCategoryRouter);
router.use('/portfolio/skills', publicSkillRouter);

export default router;
