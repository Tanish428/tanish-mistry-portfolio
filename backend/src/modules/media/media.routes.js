import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import { authorizeAdmin } from '../auth/authorization.middleware.js';
import { doubleCsrfProtection } from '../../middleware/csrf.js';
import {
  handleImageUpload,
  validateImageFile,
  validateObjectId,
  validateMediaPaginationQuery,
} from './media.validation.js';
import {
  uploadImage,
  getMediaList,
  getMediaById,
  deleteMedia,
} from './media.controller.js';

const router = Router();

// Upload image
router.post(
  '/images',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  handleImageUpload,
  validateImageFile,
  uploadImage
);

// List uploaded media
router.get(
  '/',
  authenticate,
  authorizeAdmin,
  validateMediaPaginationQuery,
  getMediaList
);

// Retrieve single media record
router.get(
  '/:id',
  authenticate,
  authorizeAdmin,
  validateObjectId,
  getMediaById
);

// Delete media asset
router.delete(
  '/:id',
  authenticate,
  authorizeAdmin,
  doubleCsrfProtection,
  validateObjectId,
  deleteMedia
);

export default router;
