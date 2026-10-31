import mongoose from 'mongoose';
import { PROFICIENCY_LEVELS } from './skill.model.js';

const ALLOWED_CATEGORY_CREATE_FIELDS = [
  'name',
  'slug',
  'description',
  'displayOrder',
  'isVisible',
];

const ALLOWED_CATEGORY_UPDATE_FIELDS = [...ALLOWED_CATEGORY_CREATE_FIELDS];

const ALLOWED_SKILL_CREATE_FIELDS = [
  'name',
  'slug',
  'category',
  'description',
  'proficiencyLevel',
  'iconName',
  'isFeatured',
  'isVisible',
  'displayOrder',
];

const ALLOWED_SKILL_UPDATE_FIELDS = [...ALLOWED_SKILL_CREATE_FIELDS];

const PROTECTED_FIELDS = [
  '_id',
  'isPublished',
  'createdAt',
  'updatedAt',
  '__v',
];

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ICON_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;

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
 * Validates request body for skill category creation
 */
export const validateCreateSkillCategory = (req, res, next) => {
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
  for (const key of bodyKeys) {
    if (PROTECTED_FIELDS.includes(key)) {
      return res.status(400).json({
        success: false,
        message: `Field '${key}' is protected and cannot be set directly`,
        data: null,
      });
    }
    if (!ALLOWED_CATEGORY_CREATE_FIELDS.includes(key)) {
      return res.status(400).json({
        success: false,
        message: `Field '${key}' is not allowed`,
        data: null,
      });
    }
  }

  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.trim().length > 60) {
    return res.status(400).json({
      success: false,
      message: 'Category name is required and must be between 2 and 60 characters',
      data: null,
    });
  }

  if (body.slug !== undefined && body.slug !== null && body.slug !== '') {
    if (typeof body.slug !== 'string' || !SLUG_REGEX.test(body.slug.trim()) || body.slug.trim().length > 80) {
      return res.status(400).json({
        success: false,
        message: 'Category slug must be a URL-friendly string (lowercase letters, numbers, and hyphens) up to 80 characters',
        data: null,
      });
    }
  }

  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string' || body.description.trim().length > 300) {
      return res.status(400).json({
        success: false,
        message: 'Category description cannot exceed 300 characters',
        data: null,
      });
    }
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

  if (body.isVisible !== undefined && typeof body.isVisible !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isVisible must be a boolean',
      data: null,
    });
  }

  next();
};

/**
 * Validates request body for skill category updates
 */
export const validateUpdateSkillCategory = (req, res, next) => {
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
    if (!ALLOWED_CATEGORY_UPDATE_FIELDS.includes(key)) {
      return res.status(400).json({
        success: false,
        message: `Field '${key}' is not allowed`,
        data: null,
      });
    }
  }

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.trim().length > 60) {
      return res.status(400).json({
        success: false,
        message: 'Category name must be between 2 and 60 characters',
        data: null,
      });
    }
  }

  if (body.slug !== undefined) {
    if (typeof body.slug !== 'string' || !SLUG_REGEX.test(body.slug.trim()) || body.slug.trim().length > 80) {
      return res.status(400).json({
        success: false,
        message: 'Category slug must be a URL-friendly string (lowercase letters, numbers, and hyphens) up to 80 characters',
        data: null,
      });
    }
  }

  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string' || body.description.trim().length > 300) {
      return res.status(400).json({
        success: false,
        message: 'Category description cannot exceed 300 characters',
        data: null,
      });
    }
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

  if (body.isVisible !== undefined && typeof body.isVisible !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isVisible must be a boolean',
      data: null,
    });
  }

  next();
};

/**
 * Validates request body for skill creation
 */
export const validateCreateSkill = (req, res, next) => {
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
  for (const key of bodyKeys) {
    if (PROTECTED_FIELDS.includes(key)) {
      return res.status(400).json({
        success: false,
        message: `Field '${key}' is protected and cannot be set directly`,
        data: null,
      });
    }
    if (!ALLOWED_SKILL_CREATE_FIELDS.includes(key)) {
      return res.status(400).json({
        success: false,
        message: `Field '${key}' is not allowed`,
        data: null,
      });
    }
  }

  // Required fields check
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 1 || body.name.trim().length > 60) {
    return res.status(400).json({
      success: false,
      message: 'Skill name is required and must be between 1 and 60 characters',
      data: null,
    });
  }

  if (!body.category || !mongoose.Types.ObjectId.isValid(body.category)) {
    return res.status(400).json({
      success: false,
      message: 'Valid category ObjectId is required',
      data: null,
    });
  }

  if (!body.proficiencyLevel || !PROFICIENCY_LEVELS.includes(body.proficiencyLevel)) {
    return res.status(400).json({
      success: false,
      message: `proficiencyLevel is required and must be one of: ${PROFICIENCY_LEVELS.join(', ')}`,
      data: null,
    });
  }

  if (body.slug !== undefined && body.slug !== null && body.slug !== '') {
    if (typeof body.slug !== 'string' || !SLUG_REGEX.test(body.slug.trim()) || body.slug.trim().length > 80) {
      return res.status(400).json({
        success: false,
        message: 'Skill slug must be a URL-friendly string (lowercase letters, numbers, and hyphens) up to 80 characters',
        data: null,
      });
    }
  }

  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string' || body.description.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Description cannot exceed 500 characters',
        data: null,
      });
    }
  }

  if (body.iconName !== undefined && body.iconName !== null) {
    if (typeof body.iconName !== 'string' || !ICON_NAME_REGEX.test(body.iconName.trim()) || body.iconName.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'iconName must be an alphanumeric identifier (letters, numbers, hyphens, underscores) up to 100 characters',
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
 * Validates request body for skill updates
 */
export const validateUpdateSkill = (req, res, next) => {
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
    if (!ALLOWED_SKILL_UPDATE_FIELDS.includes(key)) {
      return res.status(400).json({
        success: false,
        message: `Field '${key}' is not allowed`,
        data: null,
      });
    }
  }

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length < 1 || body.name.trim().length > 60) {
      return res.status(400).json({
        success: false,
        message: 'Skill name must be between 1 and 60 characters',
        data: null,
      });
    }
  }

  if (body.category !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(body.category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ObjectId format',
        data: null,
      });
    }
  }

  if (body.proficiencyLevel !== undefined && !PROFICIENCY_LEVELS.includes(body.proficiencyLevel)) {
    return res.status(400).json({
      success: false,
      message: `proficiencyLevel must be one of: ${PROFICIENCY_LEVELS.join(', ')}`,
      data: null,
    });
  }

  if (body.slug !== undefined) {
    if (typeof body.slug !== 'string' || !SLUG_REGEX.test(body.slug.trim()) || body.slug.trim().length > 80) {
      return res.status(400).json({
        success: false,
        message: 'Skill slug must be a URL-friendly string (lowercase letters, numbers, and hyphens) up to 80 characters',
        data: null,
      });
    }
  }

  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string' || body.description.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Description cannot exceed 500 characters',
        data: null,
      });
    }
  }

  if (body.iconName !== undefined && body.iconName !== null) {
    if (typeof body.iconName !== 'string' || !ICON_NAME_REGEX.test(body.iconName.trim()) || body.iconName.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'iconName must be an alphanumeric identifier (letters, numbers, hyphens, underscores) up to 100 characters',
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
export const validateObjectIdParam = (req, res, next) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      data: null,
    });
  }
  next();
};

/**
 * Validates skill categories reorder payload
 */
export const validateReorderSkillCategories = (req, res, next) => {
  const { categories } = req.body;

  if (!Array.isArray(categories) || categories.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'categories must be a non-empty array of category ordering items',
      data: null,
    });
  }

  const seenIds = new Set();
  const seenOrders = new Set();

  for (const item of categories) {
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
        message: `Invalid category ID: ${id}`,
        data: null,
      });
    }

    if (displayOrder === undefined || !Number.isInteger(displayOrder) || displayOrder < 0) {
      return res.status(400).json({
        success: false,
        message: `displayOrder must be a non-negative integer for category ${id}`,
        data: null,
      });
    }

    if (seenIds.has(id)) {
      return res.status(400).json({
        success: false,
        message: `Duplicate category ID in reorder list: ${id}`,
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
 * Validates category-scoped skills reorder payload
 */
export const validateReorderSkills = (req, res, next) => {
  const { categoryId, skills } = req.body;

  if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({
      success: false,
      message: 'Valid categoryId ObjectId is required for scoped skill reordering',
      data: null,
    });
  }

  if (!Array.isArray(skills) || skills.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'skills must be a non-empty array of skill ordering items',
      data: null,
    });
  }

  const seenIds = new Set();
  const seenOrders = new Set();

  for (const item of skills) {
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
        message: `Invalid skill ID: ${id}`,
        data: null,
      });
    }

    if (displayOrder === undefined || !Number.isInteger(displayOrder) || displayOrder < 0) {
      return res.status(400).json({
        success: false,
        message: `displayOrder must be a non-negative integer for skill ${id}`,
        data: null,
      });
    }

    if (seenIds.has(id)) {
      return res.status(400).json({
        success: false,
        message: `Duplicate skill ID in reorder list: ${id}`,
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
 * Validates admin category queries
 */
export const validateAdminCategoriesQuery = (req, res, next) => {
  const { page, limit, isPublished, search } = req.query;

  if (page !== undefined) {
    const parsed = parseInt(page, 10);
    if (isNaN(parsed) || parsed < 1) {
      return res.status(400).json({
        success: false,
        message: 'page must be a positive integer',
        data: null,
      });
    }
  }

  if (limit !== undefined) {
    const parsed = parseInt(limit, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 100) {
      return res.status(400).json({
        success: false,
        message: 'limit must be an integer between 1 and 100',
        data: null,
      });
    }
  }

  if (isPublished !== undefined && isPublished !== 'true' && isPublished !== 'false') {
    return res.status(400).json({
      success: false,
      message: 'isPublished query parameter must be either true or false',
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
 * Validates admin skills queries
 */
export const validateAdminSkillsQuery = (req, res, next) => {
  const { page, limit, category, proficiencyLevel, isPublished, isFeatured, search } = req.query;

  if (page !== undefined) {
    const parsed = parseInt(page, 10);
    if (isNaN(parsed) || parsed < 1) {
      return res.status(400).json({
        success: false,
        message: 'page must be a positive integer',
        data: null,
      });
    }
  }

  if (limit !== undefined) {
    const parsed = parseInt(limit, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 100) {
      return res.status(400).json({
        success: false,
        message: 'limit must be an integer between 1 and 100',
        data: null,
      });
    }
  }

  if (proficiencyLevel !== undefined && !PROFICIENCY_LEVELS.includes(proficiencyLevel)) {
    return res.status(400).json({
      success: false,
      message: `proficiencyLevel must be one of: ${PROFICIENCY_LEVELS.join(', ')}`,
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
 * Validates public skills queries
 */
export const validatePublicSkillsQuery = (req, res, next) => {
  const { page, limit, category, featured, search } = req.query;

  if (page !== undefined) {
    const parsed = parseInt(page, 10);
    if (isNaN(parsed) || parsed < 1) {
      return res.status(400).json({
        success: false,
        message: 'page must be a positive integer',
        data: null,
      });
    }
  }

  if (limit !== undefined) {
    const parsed = parseInt(limit, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 100) {
      return res.status(400).json({
        success: false,
        message: 'limit must be an integer between 1 and 100',
        data: null,
      });
    }
  }

  if (featured !== undefined && featured !== 'true' && featured !== 'false') {
    return res.status(400).json({
      success: false,
      message: 'featured query parameter must be either true or false',
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
