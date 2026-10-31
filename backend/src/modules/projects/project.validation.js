import mongoose from 'mongoose';
import { PROJECT_CATEGORIES } from './project.model.js';

const ALLOWED_CREATE_FIELDS = [
  'title',
  'slug',
  'shortDescription',
  'description',
  'technologies',
  'category',
  'thumbnailUrl',
  'thumbnailAlt',
  'liveDemoUrl',
  'repositoryUrl',
  'role',
  'keyFeatures',
  'startDate',
  'endDate',
  'isFeatured',
  'isVisible',
  'displayOrder',
];

const ALLOWED_UPDATE_FIELDS = [...ALLOWED_CREATE_FIELDS];

const PROTECTED_FIELDS = [
  '_id',
  'isPublished',
  'createdAt',
  'updatedAt',
  '__v',
];

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Validates HTTPS URL format
 */
const isValidHttpsUrl = (url) => {
  if (typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Checks for MongoDB operator keys ($...)
 */
const hasMongoOperators = (obj) => {
  if (!obj || typeof obj !== 'object') return false;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) return true;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (hasMongoOperators(obj[key])) return true;
    }
  }
  return false;
};

/**
 * Normalizes and validates technology list
 */
const normalizeTechnologies = (techArray) => {
  if (!Array.isArray(techArray)) {
    throw new Error('Technologies must be an array of strings');
  }
  if (techArray.length < 1 || techArray.length > 30) {
    throw new Error('Project must contain between 1 and 30 technologies');
  }

  const seen = new Set();
  const normalized = [];

  for (const item of techArray) {
    if (typeof item !== 'string' || item.trim().length === 0) {
      throw new Error('Technology items must be non-empty strings');
    }
    const trimmed = item.trim();
    if (trimmed.length > 50) {
      throw new Error('Each technology cannot exceed 50 characters');
    }
    const lower = trimmed.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      normalized.push(trimmed);
    }
  }

  return normalized;
};

/**
 * Normalizes and validates key features
 */
const normalizeKeyFeatures = (featuresArray) => {
  if (!Array.isArray(featuresArray)) {
    throw new Error('Key features must be an array of strings');
  }
  if (featuresArray.length > 20) {
    throw new Error('Key features cannot exceed 20 items');
  }

  return featuresArray.map((item) => {
    if (typeof item !== 'string' || item.trim().length === 0) {
      throw new Error('Key feature items must be non-empty strings');
    }
    const trimmed = item.trim();
    if (trimmed.length > 200) {
      throw new Error('Each key feature cannot exceed 200 characters');
    }
    return trimmed;
  });
};

/**
 * Validates request body for project creation
 */
export const validateCreateProject = (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a valid JSON object',
      data: null,
    });
  }

  if (hasMongoOperators(body)) {
    return res.status(400).json({
      success: false,
      message: 'Request body contains invalid operator characters',
      data: null,
    });
  }

  // Check for protected or unsupported fields
  const bodyKeys = Object.keys(body);
  for (const key of bodyKeys) {
    if (PROTECTED_FIELDS.includes(key)) {
      return res.status(400).json({
        success: false,
        message: `Field '${key}' is protected and cannot be set directly`,
        data: null,
      });
    }
    if (!ALLOWED_CREATE_FIELDS.includes(key)) {
      return res.status(400).json({
        success: false,
        message: `Field '${key}' is not allowed`,
        data: null,
      });
    }
  }

  // Required fields check
  const requiredFields = ['title', 'shortDescription', 'description', 'technologies', 'category'];
  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return res.status(400).json({
        success: false,
        message: `Field '${field}' is required`,
        data: null,
      });
    }
  }

  // Title validation
  if (typeof body.title !== 'string' || body.title.trim().length < 2 || body.title.trim().length > 120) {
    return res.status(400).json({
      success: false,
      message: 'Title must be a string between 2 and 120 characters',
      data: null,
    });
  }

  // Slug validation (if provided)
  if (body.slug !== undefined && body.slug !== null && body.slug !== '') {
    if (typeof body.slug !== 'string' || !SLUG_REGEX.test(body.slug.trim()) || body.slug.trim().length > 120) {
      return res.status(400).json({
        success: false,
        message: 'Slug must be a URL-friendly string (lowercase letters, numbers, and hyphens) up to 120 characters',
        data: null,
      });
    }
  }

  // Short description validation
  if (
    typeof body.shortDescription !== 'string' ||
    body.shortDescription.trim().length < 10 ||
    body.shortDescription.trim().length > 300
  ) {
    return res.status(400).json({
      success: false,
      message: 'Short description must be between 10 and 300 characters',
      data: null,
    });
  }

  // Description validation
  if (
    typeof body.description !== 'string' ||
    body.description.trim().length < 20 ||
    body.description.trim().length > 5000
  ) {
    return res.status(400).json({
      success: false,
      message: 'Description must be between 20 and 5000 characters',
      data: null,
    });
  }

  // Category validation
  if (!PROJECT_CATEGORIES.includes(body.category)) {
    return res.status(400).json({
      success: false,
      message: `Category must be one of: ${PROJECT_CATEGORIES.join(', ')}`,
      data: null,
    });
  }

  // Technologies validation
  try {
    req.body.technologies = normalizeTechnologies(body.technologies);
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }

  // Key features validation
  if (body.keyFeatures !== undefined && body.keyFeatures !== null) {
    try {
      req.body.keyFeatures = normalizeKeyFeatures(body.keyFeatures);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
        data: null,
      });
    }
  }

  // URLs validation
  const urlFields = ['thumbnailUrl', 'liveDemoUrl', 'repositoryUrl'];
  for (const field of urlFields) {
    if (body[field]) {
      if (!isValidHttpsUrl(body[field])) {
        return res.status(400).json({
          success: false,
          message: `${field} must be a valid HTTPS URL`,
          data: null,
        });
      }
    }
  }

  // Dates validation
  if (body.startDate && isNaN(new Date(body.startDate).getTime())) {
    return res.status(400).json({
      success: false,
      message: 'startDate must be a valid date',
      data: null,
    });
  }
  if (body.endDate && isNaN(new Date(body.endDate).getTime())) {
    return res.status(400).json({
      success: false,
      message: 'endDate must be a valid date',
      data: null,
    });
  }
  if (body.startDate && body.endDate) {
    if (new Date(body.endDate) < new Date(body.startDate)) {
      return res.status(400).json({
        success: false,
        message: 'endDate cannot precede startDate',
        data: null,
      });
    }
  }

  // Booleans and numbers
  if (body.isFeatured !== undefined && typeof body.isFeatured !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isFeatured must be a boolean',
      data: null,
    });
  }
  if (body.isVisible !== undefined && typeof body.isVisible !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isVisible must be a boolean',
      data: null,
    });
  }
  if (body.displayOrder !== undefined) {
    if (!Number.isInteger(body.displayOrder) || body.displayOrder < 0) {
      return res.status(400).json({
        success: false,
        message: 'displayOrder must be a non-negative integer',
        data: null,
      });
    }
  }

  next();
};

/**
 * Validates request body for partial project updates
 */
export const validateUpdateProject = (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a valid JSON object',
      data: null,
    });
  }

  if (hasMongoOperators(body)) {
    return res.status(400).json({
      success: false,
      message: 'Request body contains invalid operator characters',
      data: null,
    });
  }

  const bodyKeys = Object.keys(body);
  if (bodyKeys.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Request body cannot be empty for an update',
      data: null,
    });
  }

  for (const key of bodyKeys) {
    if (PROTECTED_FIELDS.includes(key)) {
      return res.status(400).json({
        success: false,
        message: `Field '${key}' is protected and cannot be updated directly`,
        data: null,
      });
    }
    if (!ALLOWED_UPDATE_FIELDS.includes(key)) {
      return res.status(400).json({
        success: false,
        message: `Field '${key}' is not allowed`,
        data: null,
      });
    }
  }

  // Validate fields if provided
  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim().length < 2 || body.title.trim().length > 120) {
      return res.status(400).json({
        success: false,
        message: 'Title must be a string between 2 and 120 characters',
        data: null,
      });
    }
  }

  if (body.slug !== undefined) {
    if (typeof body.slug !== 'string' || !SLUG_REGEX.test(body.slug.trim()) || body.slug.trim().length > 120) {
      return res.status(400).json({
        success: false,
        message: 'Slug must be a URL-friendly string (lowercase letters, numbers, and hyphens) up to 120 characters',
        data: null,
      });
    }
  }

  if (body.shortDescription !== undefined) {
    if (
      typeof body.shortDescription !== 'string' ||
      body.shortDescription.trim().length < 10 ||
      body.shortDescription.trim().length > 300
    ) {
      return res.status(400).json({
        success: false,
        message: 'Short description must be between 10 and 300 characters',
        data: null,
      });
    }
  }

  if (body.description !== undefined) {
    if (
      typeof body.description !== 'string' ||
      body.description.trim().length < 20 ||
      body.description.trim().length > 5000
    ) {
      return res.status(400).json({
        success: false,
        message: 'Description must be between 20 and 5000 characters',
        data: null,
      });
    }
  }

  if (body.category !== undefined && !PROJECT_CATEGORIES.includes(body.category)) {
    return res.status(400).json({
      success: false,
      message: `Category must be one of: ${PROJECT_CATEGORIES.join(', ')}`,
      data: null,
    });
  }

  if (body.technologies !== undefined) {
    try {
      req.body.technologies = normalizeTechnologies(body.technologies);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
        data: null,
      });
    }
  }

  if (body.keyFeatures !== undefined && body.keyFeatures !== null) {
    try {
      req.body.keyFeatures = normalizeKeyFeatures(body.keyFeatures);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
        data: null,
      });
    }
  }

  const urlFields = ['thumbnailUrl', 'liveDemoUrl', 'repositoryUrl'];
  for (const field of urlFields) {
    if (body[field]) {
      if (!isValidHttpsUrl(body[field])) {
        return res.status(400).json({
          success: false,
          message: `${field} must be a valid HTTPS URL`,
          data: null,
        });
      }
    }
  }

  if (body.startDate && isNaN(new Date(body.startDate).getTime())) {
    return res.status(400).json({
      success: false,
      message: 'startDate must be a valid date',
      data: null,
    });
  }
  if (body.endDate && isNaN(new Date(body.endDate).getTime())) {
    return res.status(400).json({
      success: false,
      message: 'endDate must be a valid date',
      data: null,
    });
  }
  if (body.startDate && body.endDate) {
    if (new Date(body.endDate) < new Date(body.startDate)) {
      return res.status(400).json({
        success: false,
        message: 'endDate cannot precede startDate',
        data: null,
      });
    }
  }

  if (body.isFeatured !== undefined && typeof body.isFeatured !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isFeatured must be a boolean',
      data: null,
    });
  }
  if (body.isVisible !== undefined && typeof body.isVisible !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isVisible must be a boolean',
      data: null,
    });
  }
  if (body.displayOrder !== undefined) {
    if (!Number.isInteger(body.displayOrder) || body.displayOrder < 0) {
      return res.status(400).json({
        success: false,
        message: 'displayOrder must be a non-negative integer',
        data: null,
      });
    }
  }

  next();
};

/**
 * Validates MongoDB ObjectId param
 */
export const validateProjectId = (req, res, next) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid project ID format',
      data: null,
    });
  }
  next();
};

/**
 * Validates slug param for public endpoint
 */
export const validateSlugParam = (req, res, next) => {
  const { slug } = req.params;
  if (!slug || typeof slug !== 'string' || !SLUG_REGEX.test(slug.trim()) || slug.trim().length > 120) {
    return res.status(400).json({
      success: false,
      message: 'Invalid slug format',
      data: null,
    });
  }
  next();
};

/**
 * Validates project reordering payload
 */
export const validateReorderProjects = (req, res, next) => {
  const { projects } = req.body;

  if (!Array.isArray(projects) || projects.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'projects must be a non-empty array of project ordering items',
      data: null,
    });
  }

  const seenIds = new Set();
  const seenOrders = new Set();

  for (const item of projects) {
    if (!item || typeof item !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Each reorder item must be an object with id and displayOrder',
        data: null,
      });
    }

    const { id, displayOrder } = item;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid project ID: ${id}`,
        data: null,
      });
    }

    if (displayOrder === undefined || !Number.isInteger(displayOrder) || displayOrder < 0) {
      return res.status(400).json({
        success: false,
        message: `displayOrder must be a non-negative integer for project ${id}`,
        data: null,
      });
    }

    if (seenIds.has(id)) {
      return res.status(400).json({
        success: false,
        message: `Duplicate project ID in reorder list: ${id}`,
        data: null,
      });
    }
    seenIds.add(id);

    if (seenOrders.has(displayOrder)) {
      return res.status(400).json({
        success: false,
        message: `Duplicate displayOrder in reorder list: ${displayOrder}`,
        data: null,
      });
    }
    seenOrders.add(displayOrder);
  }

  next();
};

/**
 * Validates featured status body
 */
export const validateFeaturedStatus = (req, res, next) => {
  const { isFeatured } = req.body;

  if (typeof isFeatured !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isFeatured must be a boolean',
      data: null,
    });
  }

  next();
};

/**
 * Validates query parameters for admin listing
 */
export const validateAdminQuery = (req, res, next) => {
  const { page, limit, category, isPublished, isFeatured, search } = req.query;

  if (page !== undefined) {
    const parsedPage = parseInt(page, 10);
    if (isNaN(parsedPage) || parsedPage < 1) {
      return res.status(400).json({
        success: false,
        message: 'page query parameter must be a positive integer',
        data: null,
      });
    }
  }

  if (limit !== undefined) {
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      return res.status(400).json({
        success: false,
        message: 'limit query parameter must be an integer between 1 and 100',
        data: null,
      });
    }
  }

  if (category !== undefined && !PROJECT_CATEGORIES.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `category must be one of: ${PROJECT_CATEGORIES.join(', ')}`,
      data: null,
    });
  }

  if (isPublished !== undefined && isPublished !== 'true' && isPublished !== 'false') {
    return res.status(400).json({
      success: false,
      message: 'isPublished query parameter must be either true or false',
      data: null,
    });
  }

  if (isFeatured !== undefined && isFeatured !== 'true' && isFeatured !== 'false') {
    return res.status(400).json({
      success: false,
      message: 'isFeatured query parameter must be either true or false',
      data: null,
    });
  }

  if (search !== undefined && (typeof search !== 'string' || search.length > 100)) {
    return res.status(400).json({
      success: false,
      message: 'search query parameter must be a string up to 100 characters',
      data: null,
    });
  }

  next();
};

/**
 * Validates query parameters for public listing
 */
export const validatePublicQuery = (req, res, next) => {
  const { page, limit, category, search } = req.query;

  if (page !== undefined) {
    const parsedPage = parseInt(page, 10);
    if (isNaN(parsedPage) || parsedPage < 1) {
      return res.status(400).json({
        success: false,
        message: 'page query parameter must be a positive integer',
        data: null,
      });
    }
  }

  if (limit !== undefined) {
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
      return res.status(400).json({
        success: false,
        message: 'limit query parameter must be an integer between 1 and 50',
        data: null,
      });
    }
  }

  if (category !== undefined && !PROJECT_CATEGORIES.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `category must be one of: ${PROJECT_CATEGORIES.join(', ')}`,
      data: null,
    });
  }

  if (search !== undefined && (typeof search !== 'string' || search.length > 100)) {
    return res.status(400).json({
      success: false,
      message: 'search query parameter must be a string up to 100 characters',
      data: null,
    });
  }

  next();
};
