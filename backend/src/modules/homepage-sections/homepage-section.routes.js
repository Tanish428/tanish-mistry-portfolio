import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import { authorizeAdmin } from '../auth/authorization.middleware.js';
import { doubleCsrfProtection } from '../../middleware/csrf.js';
import {
  validateCreateHomepageSection,
  validateUpdateHomepageSection,
  validateSectionId,
  validateReorderHomepageSections,
} from './homepage-section.validation.js';
import {
  createHomepageSection,
  getAdminHomepageSections,
  getAdminHomepageSectionById,
  updateHomepageSection,
  deleteHomepageSection,
  publishHomepageSection,
  unpublishHomepageSection,
  reorderHomepageSections,
  getPublicHomepageSections,
} from './homepage-section.controller.js';

// ==========================================
// ADMINISTRATOR ROUTER
// ==========================================
export const adminHomepageSectionRouter = Router();

adminHomepageSectionRouter.use(authenticate);
adminHomepageSectionRouter.use(authorizeAdmin);

adminHomepageSectionRouter.get('/', getAdminHomepageSections);
adminHomepageSectionRouter.post(
  '/',
  doubleCsrfProtection,
  validateCreateHomepageSection,
  createHomepageSection
);
adminHomepageSectionRouter.patch(
  '/reorder',
  doubleCsrfProtection,
  validateReorderHomepageSections,
  reorderHomepageSections
);
adminHomepageSectionRouter.get('/:id', validateSectionId, getAdminHomepageSectionById);
adminHomepageSectionRouter.patch(
  '/:id',
  doubleCsrfProtection,
  validateSectionId,
  validateUpdateHomepageSection,
  updateHomepageSection
);
adminHomepageSectionRouter.delete(
  '/:id',
  doubleCsrfProtection,
  validateSectionId,
  deleteHomepageSection
);
adminHomepageSectionRouter.patch(
  '/:id/publish',
  doubleCsrfProtection,
  validateSectionId,
  publishHomepageSection
);
adminHomepageSectionRouter.patch(
  '/:id/unpublish',
  doubleCsrfProtection,
  validateSectionId,
  unpublishHomepageSection
);

// ==========================================
// PUBLIC ROUTER
// ==========================================
export const publicHomepageSectionRouter = Router();

publicHomepageSectionRouter.get('/', getPublicHomepageSections);
