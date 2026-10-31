import { Router } from 'express';
import {
  create,
  listAdmin,
  getById,
  update,
  remove,
  publish,
  unpublish,
  setFeatured,
  reorder,
  listPublic,
  getBySlugPublic,
} from './project.controller.js';
import {
  validateCreateProject,
  validateUpdateProject,
  validateProjectId,
  validateSlugParam,
  validateReorderProjects,
  validateFeaturedStatus,
  validateAdminQuery,
  validatePublicQuery,
} from './project.validation.js';
import { authenticate } from '../auth/auth.middleware.js';
import { authorizeAdmin } from '../auth/authorization.middleware.js';
import { doubleCsrfProtection } from '../../middleware/csrf.js';

// Administrator router mounted at /api/v1/admin/projects
const adminProjectRouter = Router();

// Create new project
adminProjectRouter.post(
  '/',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateCreateProject,
  create
);

// List all projects with pagination and filters
adminProjectRouter.get(
  '/',
  authenticate,
  authorizeAdmin,
  validateAdminQuery,
  listAdmin
);

// Bulk reorder projects (must be registered BEFORE /:id to prevent route collision)
adminProjectRouter.patch(
  '/reorder',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateReorderProjects,
  reorder
);

// Get single project by ID
adminProjectRouter.get(
  '/:id',
  authenticate,
  authorizeAdmin,
  validateProjectId,
  getById
);

// Partial update project
adminProjectRouter.patch(
  '/:id',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateProjectId,
  validateUpdateProject,
  update
);

// Delete project
adminProjectRouter.delete(
  '/:id',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateProjectId,
  remove
);

// Publish project
adminProjectRouter.patch(
  '/:id/publish',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateProjectId,
  publish
);

// Unpublish project
adminProjectRouter.patch(
  '/:id/unpublish',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateProjectId,
  unpublish
);

// Update featured status
adminProjectRouter.patch(
  '/:id/featured',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateProjectId,
  validateFeaturedStatus,
  setFeatured
);

// Public router mounted at /api/v1/portfolio/projects
const publicProjectRouter = Router();

// List published and visible projects
publicProjectRouter.get(
  '/',
  validatePublicQuery,
  listPublic
);

// Get published and visible project by slug
publicProjectRouter.get(
  '/:slug',
  validateSlugParam,
  getBySlugPublic
);

export { adminProjectRouter, publicProjectRouter };
