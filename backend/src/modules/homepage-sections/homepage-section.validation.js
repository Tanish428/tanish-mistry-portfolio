import mongoose from 'mongoose';
import { SECTION_TYPES } from './homepage-section.model.js';

const ALLOWED_PROJECT_CATEGORIES = [
  'web',
  'mobile',
  'fullstack',
  'backend',
  'ai-ml',
  'devops',
  'other',
];

/**
 * Validates URLs (either full HTTPS/HTTP or internal anchors/paths)
 */
const isValidUrlOrPath = (val) => {
  if (typeof val !== 'string' || !val.trim()) return false;
  const trimmed = val.trim();
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Strictly validates config object according to section type
 */
export const validateSectionConfig = (type, config) => {
  if (config === undefined || config === null) {
    return {};
  }

  if (typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('Section config must be a valid JSON object');
  }

  const keys = Object.keys(config);
  const validated = {};

  switch (type) {
    case 'hero': {
      const allowed = [
        'showProfileImage',
        'showAvailability',
        'primaryCtaLabel',
        'primaryCtaUrl',
        'secondaryCtaLabel',
        'secondaryCtaUrl',
      ];
      for (const k of keys) {
        if (!allowed.includes(k)) {
          throw new Error(`Unknown configuration property '${k}' for section type 'hero'`);
        }
      }

      if (config.showProfileImage !== undefined) {
        if (typeof config.showProfileImage !== 'boolean') {
          throw new Error('showProfileImage must be a boolean');
        }
        validated.showProfileImage = config.showProfileImage;
      }

      if (config.showAvailability !== undefined) {
        if (typeof config.showAvailability !== 'boolean') {
          throw new Error('showAvailability must be a boolean');
        }
        validated.showAvailability = config.showAvailability;
      }

      if (config.primaryCtaLabel !== undefined && config.primaryCtaLabel !== null) {
        if (typeof config.primaryCtaLabel !== 'string' || config.primaryCtaLabel.trim().length > 50) {
          throw new Error('primaryCtaLabel must be a string up to 50 characters');
        }
        validated.primaryCtaLabel = config.primaryCtaLabel.trim();
      }

      if (config.primaryCtaUrl !== undefined && config.primaryCtaUrl !== null) {
        if (!isValidUrlOrPath(config.primaryCtaUrl)) {
          throw new Error('primaryCtaUrl must be a valid URL, relative path, or anchor');
        }
        validated.primaryCtaUrl = config.primaryCtaUrl.trim();
      }

      if (config.secondaryCtaLabel !== undefined && config.secondaryCtaLabel !== null) {
        if (typeof config.secondaryCtaLabel !== 'string' || config.secondaryCtaLabel.trim().length > 50) {
          throw new Error('secondaryCtaLabel must be a string up to 50 characters');
        }
        validated.secondaryCtaLabel = config.secondaryCtaLabel.trim();
      }

      if (config.secondaryCtaUrl !== undefined && config.secondaryCtaUrl !== null) {
        if (!isValidUrlOrPath(config.secondaryCtaUrl)) {
          throw new Error('secondaryCtaUrl must be a valid URL, relative path, or anchor');
        }
        validated.secondaryCtaUrl = config.secondaryCtaUrl.trim();
      }
      break;
    }

    case 'about': {
      const allowed = ['showProfileImage', 'maxTextLength'];
      for (const k of keys) {
        if (!allowed.includes(k)) {
          throw new Error(`Unknown configuration property '${k}' for section type 'about'`);
        }
      }

      if (config.showProfileImage !== undefined) {
        if (typeof config.showProfileImage !== 'boolean') {
          throw new Error('showProfileImage must be a boolean');
        }
        validated.showProfileImage = config.showProfileImage;
      }

      if (config.maxTextLength !== undefined && config.maxTextLength !== null) {
        const len = Number(config.maxTextLength);
        if (!Number.isInteger(len) || len < 50 || len > 5000) {
          throw new Error('maxTextLength must be an integer between 50 and 5000');
        }
        validated.maxTextLength = len;
      }
      break;
    }

    case 'projects': {
      const allowed = ['featuredOnly', 'limit', 'category'];
      for (const k of keys) {
        if (!allowed.includes(k)) {
          throw new Error(`Unknown configuration property '${k}' for section type 'projects'`);
        }
      }

      if (config.featuredOnly !== undefined) {
        if (typeof config.featuredOnly !== 'boolean') {
          throw new Error('featuredOnly must be a boolean');
        }
        validated.featuredOnly = config.featuredOnly;
      }

      if (config.limit !== undefined && config.limit !== null) {
        const lim = Number(config.limit);
        if (!Number.isInteger(lim) || lim < 1 || lim > 50) {
          throw new Error('limit must be an integer between 1 and 50');
        }
        validated.limit = lim;
      }

      if (config.category !== undefined && config.category !== null && config.category !== '') {
        const cat = String(config.category).trim().toLowerCase();
        if (!ALLOWED_PROJECT_CATEGORIES.includes(cat)) {
          throw new Error(`Invalid category filter. Must be one of: ${ALLOWED_PROJECT_CATEGORIES.join(', ')}`);
        }
        validated.category = cat;
      }
      break;
    }

    case 'skills': {
      const allowed = ['featuredOnly', 'limit'];
      for (const k of keys) {
        if (!allowed.includes(k)) {
          throw new Error(`Unknown configuration property '${k}' for section type 'skills'`);
        }
      }

      if (config.featuredOnly !== undefined) {
        if (typeof config.featuredOnly !== 'boolean') {
          throw new Error('featuredOnly must be a boolean');
        }
        validated.featuredOnly = config.featuredOnly;
      }

      if (config.limit !== undefined && config.limit !== null) {
        const lim = Number(config.limit);
        if (!Number.isInteger(lim) || lim < 1 || lim > 100) {
          throw new Error('limit must be an integer between 1 and 100');
        }
        validated.limit = lim;
      }
      break;
    }

    case 'experience': {
      const allowed = ['limit'];
      for (const k of keys) {
        if (!allowed.includes(k)) {
          throw new Error(`Unknown configuration property '${k}' for section type 'experience'`);
        }
      }

      if (config.limit !== undefined && config.limit !== null) {
        const lim = Number(config.limit);
        if (!Number.isInteger(lim) || lim < 1 || lim > 50) {
          throw new Error('limit must be an integer between 1 and 50');
        }
        validated.limit = lim;
      }
      break;
    }

    case 'education': {
      const allowed = ['limit'];
      for (const k of keys) {
        if (!allowed.includes(k)) {
          throw new Error(`Unknown configuration property '${k}' for section type 'education'`);
        }
      }

      if (config.limit !== undefined && config.limit !== null) {
        const lim = Number(config.limit);
        if (!Number.isInteger(lim) || lim < 1 || lim > 50) {
          throw new Error('limit must be an integer between 1 and 50');
        }
        validated.limit = lim;
      }
      break;
    }

    case 'social_links': {
      const allowed = ['limit'];
      for (const k of keys) {
        if (!allowed.includes(k)) {
          throw new Error(`Unknown configuration property '${k}' for section type 'social_links'`);
        }
      }

      if (config.limit !== undefined && config.limit !== null) {
        const lim = Number(config.limit);
        if (!Number.isInteger(lim) || lim < 1 || lim > 50) {
          throw new Error('limit must be an integer between 1 and 50');
        }
        validated.limit = lim;
      }
      break;
    }

    case 'contact': {
      const allowed = ['showContactForm', 'heading', 'supportingText'];
      for (const k of keys) {
        if (!allowed.includes(k)) {
          throw new Error(`Unknown configuration property '${k}' for section type 'contact'`);
        }
      }

      if (config.showContactForm !== undefined) {
        if (typeof config.showContactForm !== 'boolean') {
          throw new Error('showContactForm must be a boolean');
        }
        validated.showContactForm = config.showContactForm;
      }

      if (config.heading !== undefined && config.heading !== null) {
        if (typeof config.heading !== 'string' || config.heading.trim().length > 100) {
          throw new Error('heading must be a string up to 100 characters');
        }
        validated.heading = config.heading.trim();
      }

      if (config.supportingText !== undefined && config.supportingText !== null) {
        if (typeof config.supportingText !== 'string' || config.supportingText.trim().length > 300) {
          throw new Error('supportingText must be a string up to 300 characters');
        }
        validated.supportingText = config.supportingText.trim();
      }
      break;
    }

    default:
      throw new Error(`Unsupported section type '${type}'`);
  }

  return validated;
};

/**
 * Middleware: validates request body for creating a homepage section
 */
export const validateCreateHomepageSection = (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a valid JSON object',
      data: null,
    });
  }

  const forbidden = ['_id', 'isPublished', 'createdAt', 'updatedAt', '__v'];
  for (const f of forbidden) {
    if (f in body) {
      return res.status(400).json({
        success: false,
        message: `Field '${f}' cannot be set directly during section creation`,
        data: null,
      });
    }
  }

  if (!body.type || typeof body.type !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Section type is required and must be a string',
      data: null,
    });
  }

  const normalizedType = body.type.trim();
  if (!SECTION_TYPES.includes(normalizedType)) {
    return res.status(400).json({
      success: false,
      message: `Invalid section type '${normalizedType}'. Must be one of: ${SECTION_TYPES.join(', ')}`,
      data: null,
    });
  }
  req.body.type = normalizedType;

  if (body.title !== undefined && body.title !== null && body.title !== '') {
    if (typeof body.title !== 'string' || body.title.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Title must be a string up to 100 characters',
        data: null,
      });
    }
    req.body.title = body.title.trim();
  } else {
    req.body.title = null;
  }

  if (body.subtitle !== undefined && body.subtitle !== null && body.subtitle !== '') {
    if (typeof body.subtitle !== 'string' || body.subtitle.trim().length > 300) {
      return res.status(400).json({
        success: false,
        message: 'Subtitle must be a string up to 300 characters',
        data: null,
      });
    }
    req.body.subtitle = body.subtitle.trim();
  } else {
    req.body.subtitle = null;
  }

  if (body.displayOrder !== undefined) {
    const order = Number(body.displayOrder);
    if (!Number.isInteger(order) || order < 0) {
      return res.status(400).json({
        success: false,
        message: 'displayOrder must be a non-negative integer',
        data: null,
      });
    }
    req.body.displayOrder = order;
  } else {
    req.body.displayOrder = 0;
  }

  if (body.isVisible !== undefined) {
    if (typeof body.isVisible !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isVisible must be a boolean',
        data: null,
      });
    }
  } else {
    req.body.isVisible = true;
  }

  // Config validation
  try {
    req.body.config = validateSectionConfig(normalizedType, body.config);
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }

  next();
};

/**
 * Middleware: validates request body for updating a homepage section
 */
export const validateUpdateHomepageSection = (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a valid JSON object',
      data: null,
    });
  }

  if ('type' in body) {
    return res.status(400).json({
      success: false,
      message: 'Section type is immutable and cannot be modified after creation',
      data: null,
    });
  }

  const forbidden = ['_id', 'isPublished', 'createdAt', 'updatedAt', '__v'];
  for (const f of forbidden) {
    if (f in body) {
      return res.status(400).json({
        success: false,
        message: `Field '${f}' cannot be modified directly`,
        data: null,
      });
    }
  }

  const allowedFields = ['title', 'subtitle', 'displayOrder', 'isVisible', 'config'];
  const updateKeys = Object.keys(body);

  if (updateKeys.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one field must be provided for update',
      data: null,
    });
  }

  for (const key of updateKeys) {
    if (!allowedFields.includes(key)) {
      return res.status(400).json({
        success: false,
        message: `Unknown or disallowed update field '${key}'`,
        data: null,
      });
    }
  }

  if (body.title !== undefined) {
    if (body.title !== null && body.title !== '') {
      if (typeof body.title !== 'string' || body.title.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Title must be a string up to 100 characters',
          data: null,
        });
      }
      req.body.title = body.title.trim();
    } else {
      req.body.title = null;
    }
  }

  if (body.subtitle !== undefined) {
    if (body.subtitle !== null && body.subtitle !== '') {
      if (typeof body.subtitle !== 'string' || body.subtitle.trim().length > 300) {
        return res.status(400).json({
          success: false,
          message: 'Subtitle must be a string up to 300 characters',
          data: null,
        });
      }
      req.body.subtitle = body.subtitle.trim();
    } else {
      req.body.subtitle = null;
    }
  }

  if (body.displayOrder !== undefined) {
    const order = Number(body.displayOrder);
    if (!Number.isInteger(order) || order < 0) {
      return res.status(400).json({
        success: false,
        message: 'displayOrder must be a non-negative integer',
        data: null,
      });
    }
    req.body.displayOrder = order;
  }

  if (body.isVisible !== undefined) {
    if (typeof body.isVisible !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isVisible must be a boolean',
        data: null,
      });
    }
  }

  next();
};

/**
 * Middleware: validates section ID in route params
 */
export const validateSectionId = (req, res, next) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid section ID format',
      data: null,
    });
  }
  next();
};

/**
 * Middleware: validates bulk reordering payload
 */
export const validateReorderHomepageSections = (req, res, next) => {
  const body = req.body;

  if (!Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      message: 'Reordering payload must be an array of section order items',
      data: null,
    });
  }

  if (body.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Reordering payload cannot be empty',
      data: null,
    });
  }

  const seenIds = new Set();

  for (const item of body) {
    if (!item || typeof item !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Each reorder item must be an object containing id and displayOrder',
        data: null,
      });
    }

    if (!item.id || !mongoose.Types.ObjectId.isValid(item.id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid section ID '${item.id}' in reorder payload`,
        data: null,
      });
    }

    if (seenIds.has(item.id)) {
      return res.status(400).json({
        success: false,
        message: `Duplicate section ID '${item.id}' in reorder payload`,
        data: null,
      });
    }
    seenIds.add(item.id);

    const order = Number(item.displayOrder);
    if (!Number.isInteger(order) || order < 0) {
      return res.status(400).json({
        success: false,
        message: `displayOrder for section '${item.id}' must be a non-negative integer`,
        data: null,
      });
    }
  }

  next();
};
