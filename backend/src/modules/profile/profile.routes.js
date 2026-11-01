import { Router } from 'express';
import {
  create,
  getAdmin,
  update,
  publish,
  unpublish,
  getPublic,
} from './profile.controller.js';
import {
  validateCreateProfile,
  validateUpdateProfile,
} from './profile.validation.js';
import { authenticate } from '../auth/auth.middleware.js';
import { authorizeAdmin } from '../auth/authorization.middleware.js';
import { doubleCsrfProtection } from '../../middleware/csrf.js';

// Administrator router mounted at /api/v1/admin/profile
const adminProfileRouter = Router();

adminProfileRouter.post(
  '/',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateCreateProfile,
  create
);

adminProfileRouter.get(
  '/',
  authenticate,
  authorizeAdmin,
  getAdmin
);

adminProfileRouter.patch(
  '/',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateUpdateProfile,
  update
);

adminProfileRouter.patch(
  '/publish',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  publish
);

adminProfileRouter.patch(
  '/unpublish',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  unpublish
);

// Public router mounted at /api/v1/portfolio/profile
const publicProfileRouter = Router();

publicProfileRouter.get(
  '/',
  getPublic
);

export { adminProfileRouter, publicProfileRouter };
