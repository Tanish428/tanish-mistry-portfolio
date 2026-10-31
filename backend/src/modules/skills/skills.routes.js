import { Router } from 'express';
import {
  createCategory,
  listCategoriesAdmin,
  getCategoryById,
  updateCategory,
  removeCategory,
  publishCategory,
  unpublishCategory,
  reorderCategories,
  create,
  listSkillsAdmin,
  getSkillById,
  update,
  remove,
  publish,
  unpublish,
  setFeatured,
  reorder,
  listPublicCategories,
  listPublicSkills,
} from './skills.controller.js';
import {
  validateCreateSkillCategory,
  validateUpdateSkillCategory,
  validateReorderSkillCategories,
  validateCreateSkill,
  validateUpdateSkill,
  validateReorderSkills,
  validateFeaturedStatus,
  validateObjectIdParam,
  validateAdminCategoriesQuery,
  validateAdminSkillsQuery,
  validatePublicSkillsQuery,
} from './skills.validation.js';
import { authenticate } from '../auth/auth.middleware.js';
import { authorizeAdmin } from '../auth/authorization.middleware.js';
import { doubleCsrfProtection } from '../../middleware/csrf.js';

// ==========================================
// ADMINISTRATOR — SKILL CATEGORIES ROUTER
// Mounted at /api/v1/admin/skill-categories
// ==========================================
const adminSkillCategoryRouter = Router();

adminSkillCategoryRouter.post(
  '/',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateCreateSkillCategory,
  createCategory
);

adminSkillCategoryRouter.get(
  '/',
  authenticate,
  authorizeAdmin,
  validateAdminCategoriesQuery,
  listCategoriesAdmin
);

// Must be registered BEFORE /:id
adminSkillCategoryRouter.patch(
  '/reorder',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateReorderSkillCategories,
  reorderCategories
);

adminSkillCategoryRouter.get(
  '/:id',
  authenticate,
  authorizeAdmin,
  validateObjectIdParam,
  getCategoryById
);

adminSkillCategoryRouter.patch(
  '/:id',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateObjectIdParam,
  validateUpdateSkillCategory,
  updateCategory
);

adminSkillCategoryRouter.delete(
  '/:id',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateObjectIdParam,
  removeCategory
);

adminSkillCategoryRouter.patch(
  '/:id/publish',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateObjectIdParam,
  publishCategory
);

adminSkillCategoryRouter.patch(
  '/:id/unpublish',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateObjectIdParam,
  unpublishCategory
);

// ==========================================
// ADMINISTRATOR — SKILLS ROUTER
// Mounted at /api/v1/admin/skills
// ==========================================
const adminSkillRouter = Router();

adminSkillRouter.post(
  '/',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateCreateSkill,
  create
);

adminSkillRouter.get(
  '/',
  authenticate,
  authorizeAdmin,
  validateAdminSkillsQuery,
  listSkillsAdmin
);

// Must be registered BEFORE /:id
adminSkillRouter.patch(
  '/reorder',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateReorderSkills,
  reorder
);

adminSkillRouter.get(
  '/:id',
  authenticate,
  authorizeAdmin,
  validateObjectIdParam,
  getSkillById
);

adminSkillRouter.patch(
  '/:id',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateObjectIdParam,
  validateUpdateSkill,
  update
);

adminSkillRouter.delete(
  '/:id',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateObjectIdParam,
  remove
);

adminSkillRouter.patch(
  '/:id/publish',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateObjectIdParam,
  publish
);

adminSkillRouter.patch(
  '/:id/unpublish',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateObjectIdParam,
  unpublish
);

adminSkillRouter.patch(
  '/:id/featured',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateObjectIdParam,
  validateFeaturedStatus,
  setFeatured
);

// ==========================================
// PUBLIC — SKILL CATEGORIES ROUTER
// Mounted at /api/v1/portfolio/skill-categories
// ==========================================
const publicSkillCategoryRouter = Router();

publicSkillCategoryRouter.get('/', listPublicCategories);

// ==========================================
// PUBLIC — SKILLS ROUTER
// Mounted at /api/v1/portfolio/skills
// ==========================================
const publicSkillRouter = Router();

publicSkillRouter.get('/', validatePublicSkillsQuery, listPublicSkills);

export {
  adminSkillCategoryRouter,
  adminSkillRouter,
  publicSkillCategoryRouter,
  publicSkillRouter,
};
