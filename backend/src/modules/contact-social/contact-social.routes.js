import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import { authorizeAdmin } from '../auth/authorization.middleware.js';
import { doubleCsrfProtection } from '../../middleware/csrf.js';
import {
  validateObjectId,
  contactSubmissionLimiter,
  validateContactSubmission,
  validateInboxQuery,
  validateUpdateMessageStatus,
  validateCreateSocialLink,
  validateUpdateSocialLink,
  validateReorderSocialLinks,
} from './contact-social.validation.js';
import {
  createSocialLink,
  getAdminSocialLinks,
  getAdminSocialLinkById,
  updateSocialLink,
  deleteSocialLink,
  publishSocialLink,
  unpublishSocialLink,
  reorderSocialLinks,
  getPublicSocialLinks,
  submitContactMessage,
  getAdminContactMessages,
  getAdminContactMessageById,
  updateContactMessageStatus,
  deleteContactMessage,
} from './contact-social.controller.js';

// ==========================================
// 1. ADMIN SOCIAL LINKS ROUTER
// ==========================================
export const adminSocialLinkRouter = Router();

adminSocialLinkRouter.post(
  '/',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateCreateSocialLink,
  createSocialLink
);

adminSocialLinkRouter.get(
  '/',
  authenticate,
  authorizeAdmin,
  getAdminSocialLinks
);

// Reorder MUST be mounted before /:id to prevent route shadowing
adminSocialLinkRouter.patch(
  '/reorder',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateReorderSocialLinks,
  reorderSocialLinks
);

adminSocialLinkRouter.get(
  '/:id',
  authenticate,
  authorizeAdmin,
  validateObjectId,
  getAdminSocialLinkById
);

adminSocialLinkRouter.patch(
  '/:id',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateObjectId,
  validateUpdateSocialLink,
  updateSocialLink
);

adminSocialLinkRouter.delete(
  '/:id',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateObjectId,
  deleteSocialLink
);

adminSocialLinkRouter.patch(
  '/:id/publish',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateObjectId,
  publishSocialLink
);

adminSocialLinkRouter.patch(
  '/:id/unpublish',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateObjectId,
  unpublishSocialLink
);

// ==========================================
// 2. PUBLIC SOCIAL LINKS ROUTER
// ==========================================
export const publicSocialLinkRouter = Router();

publicSocialLinkRouter.get('/', getPublicSocialLinks);

// ==========================================
// 3. ADMIN CONTACT MESSAGES ROUTER
// ==========================================
export const adminContactMessageRouter = Router();

adminContactMessageRouter.get(
  '/',
  authenticate,
  authorizeAdmin,
  validateInboxQuery,
  getAdminContactMessages
);

adminContactMessageRouter.get(
  '/:id',
  authenticate,
  authorizeAdmin,
  validateObjectId,
  getAdminContactMessageById
);

adminContactMessageRouter.patch(
  '/:id/status',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateObjectId,
  validateUpdateMessageStatus,
  updateContactMessageStatus
);

adminContactMessageRouter.delete(
  '/:id',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateObjectId,
  deleteContactMessage
);

// ==========================================
// 4. PUBLIC CONTACT ROUTER
// ==========================================
export const publicContactRouter = Router();

publicContactRouter.post(
  '/',
  contactSubmissionLimiter,
  doubleCsrfProtection,
  validateContactSubmission,
  submitContactMessage
);
