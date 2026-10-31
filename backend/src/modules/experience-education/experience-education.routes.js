import { Router } from 'express';
import {
  createExp,
  listExpAdmin,
  getExpById,
  updateExp,
  removeExp,
  publishExp,
  unpublishExp,
  reorderExp,
  createEdu,
  listEduAdmin,
  getEduById,
  updateEdu,
  removeEdu,
  publishEdu,
  unpublishEdu,
  reorderEdu,
  listExpPublic,
  listEduPublic,
} from './experience-education.controller.js';
import {
  validateCreateExperience,
  validateUpdateExperience,
  validateCreateEducation,
  validateUpdateEducation,
  validateObjectIdParam,
  validateReorderRecords,
  validateAdminQuery,
  validatePublicQuery,
} from './experience-education.validation.js';
import { authenticate } from '../auth/auth.middleware.js';
import { authorizeAdmin } from '../auth/authorization.middleware.js';
import { doubleCsrfProtection } from '../../middleware/csrf.js';

// ==========================================
// ADMINISTRATOR — EXPERIENCE ROUTER
// Mounted at /api/v1/admin/experience
// ==========================================
const adminExperienceRouter = Router();

adminExperienceRouter.post(
  '/',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateCreateExperience,
  createExp
);

adminExperienceRouter.get(
  '/',
  authenticate,
  authorizeAdmin,
  validateAdminQuery,
  listExpAdmin
);

// Reorder must be mounted BEFORE /:id
adminExperienceRouter.patch(
  '/reorder',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateReorderRecords,
  reorderExp
);

adminExperienceRouter.get(
  '/:id',
  authenticate,
  authorizeAdmin,
  validateObjectIdParam,
  getExpById
);

adminExperienceRouter.patch(
  '/:id',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateObjectIdParam,
  validateUpdateExperience,
  updateExp
);

adminExperienceRouter.delete(
  '/:id',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateObjectIdParam,
  removeExp
);

adminExperienceRouter.patch(
  '/:id/publish',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateObjectIdParam,
  publishExp
);

adminExperienceRouter.patch(
  '/:id/unpublish',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateObjectIdParam,
  unpublishExp
);

// ==========================================
// ADMINISTRATOR — EDUCATION ROUTER
// Mounted at /api/v1/admin/education
// ==========================================
const adminEducationRouter = Router();

adminEducationRouter.post(
  '/',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateCreateEducation,
  createEdu
);

adminEducationRouter.get(
  '/',
  authenticate,
  authorizeAdmin,
  validateAdminQuery,
  listEduAdmin
);

// Reorder must be mounted BEFORE /:id
adminEducationRouter.patch(
  '/reorder',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateReorderRecords,
  reorderEdu
);

adminEducationRouter.get(
  '/:id',
  authenticate,
  authorizeAdmin,
  validateObjectIdParam,
  getEduById
);

adminEducationRouter.patch(
  '/:id',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateObjectIdParam,
  validateUpdateEducation,
  updateEdu
);

adminEducationRouter.delete(
  '/:id',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateObjectIdParam,
  removeEdu
);

adminEducationRouter.patch(
  '/:id/publish',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateObjectIdParam,
  publishEdu
);

adminEducationRouter.patch(
  '/:id/unpublish',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateObjectIdParam,
  unpublishEdu
);

// ==========================================
// PUBLIC — EXPERIENCE ROUTER
// Mounted at /api/v1/portfolio/experience
// ==========================================
const publicExperienceRouter = Router();

publicExperienceRouter.get('/', validatePublicQuery, listExpPublic);

// ==========================================
// PUBLIC — EDUCATION ROUTER
// Mounted at /api/v1/portfolio/education
// ==========================================
const publicEducationRouter = Router();

publicEducationRouter.get('/', validatePublicQuery, listEduPublic);

export {
  adminExperienceRouter,
  adminEducationRouter,
  publicExperienceRouter,
  publicEducationRouter,
};
