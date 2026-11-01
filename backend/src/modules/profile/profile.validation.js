import mongoose from 'mongoose';
import { AVAILABILITY_STATUSES } from './profile.model.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FORBIDDEN_FIELDS = [
  '_id',
  'singletonKey',
  'isPublished',
  'createdAt',
  'updatedAt',
  '__v',
];

const ALLOWED_UPDATE_FIELDS = [
  'fullName',
  'professionalTitle',
  'shortIntroduction',
  'about',
  'location',
  'publicEmail',
  'profileImageUrl',
  'profileImageMediaId',
  'profileImageAlt',
  'availabilityStatus',
  'isVisible',
];

/**
 * Validates HTTPS URL
 */
const isValidHttpsUrl = (urlString) => {
  if (typeof urlString !== 'string' || !urlString.trim()) {
    return false;
  }
  try {
    const parsed = new URL(urlString.trim());
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validate individual profile fields
 */
const validateField = (field, value) => {
  switch (field) {
    case 'fullName':
      if (typeof value !== 'string' || value.trim().length < 2 || value.trim().length > 100) {
        return 'Full name must be a string between 2 and 100 characters';
      }
      return null;

    case 'professionalTitle':
      if (typeof value !== 'string' || value.trim().length < 2 || value.trim().length > 150) {
        return 'Professional title must be a string between 2 and 150 characters';
      }
      return null;

    case 'shortIntroduction':
      if (typeof value !== 'string' || value.trim().length < 10 || value.trim().length > 300) {
        return 'Short introduction must be a string between 10 and 300 characters';
      }
      return null;

    case 'about':
      if (typeof value !== 'string' || value.trim().length < 10 || value.trim().length > 5000) {
        return 'About description must be a string between 10 and 5000 characters';
      }
      return null;

    case 'location':
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value !== 'string' || value.trim().length > 100) {
          return 'Location must not exceed 100 characters';
        }
      }
      return null;

    case 'publicEmail':
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value !== 'string' || !EMAIL_REGEX.test(value.trim().toLowerCase())) {
          return 'Public email must be a valid email address';
        }
      }
      return null;

    case 'profileImageUrl':
      if (value !== null && value !== undefined && value !== '') {
        if (!isValidHttpsUrl(value)) {
          return 'Profile image URL must be a valid HTTPS URL';
        }
      }
      return null;

    case 'profileImageMediaId':
      if (value !== null && value !== undefined && value !== '') {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return 'profileImageMediaId must be a valid ObjectId';
        }
      }
      return null;

    case 'profileImageAlt':
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value !== 'string' || value.trim().length > 150) {
          return 'Image alt text must not exceed 150 characters';
        }
      }
      return null;

    case 'availabilityStatus':
      if (value !== null && value !== undefined && value !== '') {
        if (!AVAILABILITY_STATUSES.includes(value)) {
          return `Availability status must be one of: ${AVAILABILITY_STATUSES.join(', ')}`;
        }
      }
      return null;

    case 'isVisible':
      if (typeof value !== 'boolean') {
        return 'isVisible must be a boolean';
      }
      return null;

    default:
      return null;
  }
};

/**
 * Middleware: Validates profile creation request body
 */
export const validateCreateProfile = (req, res, next) => {
  const body = req.body || {};

  // Check for forbidden fields
  for (const forbidden of FORBIDDEN_FIELDS) {
    if (forbidden in body) {
      return res.status(400).json({
        success: false,
        message: `Field "${forbidden}" cannot be provided in request body`,
        data: null,
      });
    }
  }

  // Check required fields
  const required = ['fullName', 'professionalTitle', 'shortIntroduction', 'about'];
  for (const field of required) {
    if (!body[field]) {
      return res.status(400).json({
        success: false,
        message: `Field "${field}" is required`,
        data: null,
      });
    }
  }

  // Validate all supplied fields
  for (const [key, value] of Object.entries(body)) {
    if (!ALLOWED_UPDATE_FIELDS.includes(key)) {
      return res.status(400).json({
        success: false,
        message: `Unrecognized or unsupported field "${key}"`,
        data: null,
      });
    }

    const error = validateField(key, value);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
        data: null,
      });
    }
  }

  // Normalize email if provided
  if (body.publicEmail) {
    body.publicEmail = body.publicEmail.trim().toLowerCase();
  }

  next();
};

/**
 * Middleware: Validates partial profile update request body
 */
export const validateUpdateProfile = (req, res, next) => {
  const body = req.body || {};
  const keys = Object.keys(body);

  if (keys.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Update payload cannot be empty',
      data: null,
    });
  }

  // Reject MongoDB operators or forbidden fields
  for (const key of keys) {
    if (key.startsWith('$')) {
      return res.status(400).json({
        success: false,
        message: 'MongoDB operators are not permitted in request body',
        data: null,
      });
    }

    if (FORBIDDEN_FIELDS.includes(key)) {
      return res.status(400).json({
        success: false,
        message: `Field "${key}" is protected and cannot be modified`,
        data: null,
      });
    }

    if (!ALLOWED_UPDATE_FIELDS.includes(key)) {
      return res.status(400).json({
        success: false,
        message: `Unrecognized or unsupported field "${key}"`,
        data: null,
      });
    }

    const error = validateField(key, body[key]);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
        data: null,
      });
    }
  }

  // Normalize email if provided
  if (body.publicEmail) {
    body.publicEmail = body.publicEmail.trim().toLowerCase();
  }

  next();
};
