import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';

const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const platformRegex = /^[a-z0-9-]+$/;
const iconRegex = /^[a-zA-Z0-9_-]{1,50}$/;

const isValidHttpsUrl = (urlString) => {
  if (typeof urlString !== 'string') return false;
  try {
    const parsed = new URL(urlString.trim());
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validates MongoDB ObjectId in route parameters
 */
export const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid resource ID format',
      data: null,
    });
  }
  next();
};

/**
 * Rate limiter for public contact form submissions
 */
export const contactSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many contact messages submitted. Please try again after 15 minutes.',
    data: null,
  },
});

/**
 * Validates public contact message submission
 */
export const validateContactSubmission = (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a valid JSON object',
      data: null,
    });
  }

  // Strict allowlist: only name, email, subject, message permitted
  const allowedFields = ['name', 'email', 'subject', 'message'];
  const keys = Object.keys(body);
  for (const key of keys) {
    if (!allowedFields.includes(key)) {
      return res.status(400).json({
        success: false,
        message: `Field '${key}' is not allowed in contact submission`,
        data: null,
      });
    }
  }

  // Name validation
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Name is required and must be between 2 and 100 characters',
      data: null,
    });
  }

  // Email validation
  if (!body.email || typeof body.email !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
      data: null,
    });
  }
  const normalizedEmail = body.email.trim().toLowerCase();
  if (normalizedEmail.length > 254 || !emailRegex.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address',
      data: null,
    });
  }

  // Subject validation
  if (!body.subject || typeof body.subject !== 'string' || body.subject.trim().length < 2 || body.subject.trim().length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Subject is required and must be between 2 and 200 characters',
      data: null,
    });
  }

  // Message validation
  if (!body.message || typeof body.message !== 'string' || body.message.trim().length < 10 || body.message.trim().length > 5000) {
    return res.status(400).json({
      success: false,
      message: 'Message is required and must be between 10 and 5000 characters',
      data: null,
    });
  }

  req.validatedContactData = {
    name: body.name.trim(),
    email: normalizedEmail,
    subject: body.subject.trim(),
    message: body.message.trim(),
  };

  next();
};

/**
 * Validates admin inbox listing query parameters
 */
export const validateInboxQuery = (req, res, next) => {
  const { page, limit, status } = req.query;

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
    if (isNaN(parsed) || parsed < 1 || parsed > 50) {
      return res.status(400).json({
        success: false,
        message: 'limit must be an integer between 1 and 50',
        data: null,
      });
    }
  }

  if (status !== undefined) {
    if (!['new', 'read', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'status must be one of: new, read, archived',
        data: null,
      });
    }
  }

  next();
};

/**
 * Validates message status update
 */
export const validateUpdateMessageStatus = (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a valid JSON object',
      data: null,
    });
  }

  const keys = Object.keys(body);
  for (const key of keys) {
    if (key !== 'status') {
      return res.status(400).json({
        success: false,
        message: `Field '${key}' is not allowed in status update`,
        data: null,
      });
    }
  }

  if (!body.status || !['new', 'read', 'archived'].includes(body.status)) {
    return res.status(400).json({
      success: false,
      message: 'Valid status is required and must be one of: new, read, archived',
      data: null,
    });
  }

  next();
};

/**
 * Validates SocialLink creation
 */
export const validateCreateSocialLink = (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a valid JSON object',
      data: null,
    });
  }

  const allowedFields = ['platform', 'label', 'url', 'iconName', 'displayOrder', 'isVisible'];
  for (const key of Object.keys(body)) {
    if (!allowedFields.includes(key)) {
      return res.status(400).json({
        success: false,
        message: `Field '${key}' is not allowed`,
        data: null,
      });
    }
  }

  if (!body.platform || typeof body.platform !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Platform identifier is required',
      data: null,
    });
  }
  const normalizedPlatform = body.platform.trim().toLowerCase();
  if (normalizedPlatform.length > 50 || !platformRegex.test(normalizedPlatform)) {
    return res.status(400).json({
      success: false,
      message: 'Platform identifier must only contain lowercase alphanumeric characters and hyphens (up to 50 chars)',
      data: null,
    });
  }

  if (!body.label || typeof body.label !== 'string' || body.label.trim().length < 1 || body.label.trim().length > 60) {
    return res.status(400).json({
      success: false,
      message: 'Display label is required and must be between 1 and 60 characters',
      data: null,
    });
  }

  if (!body.url || typeof body.url !== 'string' || !isValidHttpsUrl(body.url)) {
    return res.status(400).json({
      success: false,
      message: 'URL is required and must be a valid HTTPS URL',
      data: null,
    });
  }

  if (body.iconName !== undefined && body.iconName !== null && body.iconName !== '') {
    if (typeof body.iconName !== 'string' || !iconRegex.test(body.iconName.trim())) {
      return res.status(400).json({
        success: false,
        message: 'iconName must be a safe alphanumeric identifier containing only letters, numbers, underscores, or hyphens (up to 50 chars)',
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

  req.validatedSocialLinkData = {
    platform: normalizedPlatform,
    label: body.label.trim(),
    url: body.url.trim(),
    iconName: body.iconName ? body.iconName.trim() : null,
    displayOrder: body.displayOrder !== undefined ? body.displayOrder : 0,
    isVisible: body.isVisible !== undefined ? body.isVisible : true,
  };

  next();
};

/**
 * Validates SocialLink partial update
 */
export const validateUpdateSocialLink = (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a valid JSON object',
      data: null,
    });
  }

  const allowedFields = ['platform', 'label', 'url', 'iconName', 'displayOrder', 'isVisible'];
  const keys = Object.keys(body);
  if (keys.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one field must be provided for update',
      data: null,
    });
  }

  for (const key of keys) {
    if (!allowedFields.includes(key)) {
      return res.status(400).json({
        success: false,
        message: `Field '${key}' is not allowed`,
        data: null,
      });
    }
  }

  const validated = {};

  if (body.platform !== undefined) {
    if (typeof body.platform !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Platform identifier must be a string',
        data: null,
      });
    }
    const normalizedPlatform = body.platform.trim().toLowerCase();
    if (normalizedPlatform.length > 50 || !platformRegex.test(normalizedPlatform)) {
      return res.status(400).json({
        success: false,
        message: 'Platform identifier must only contain lowercase alphanumeric characters and hyphens (up to 50 chars)',
        data: null,
      });
    }
    validated.platform = normalizedPlatform;
  }

  if (body.label !== undefined) {
    if (typeof body.label !== 'string' || body.label.trim().length < 1 || body.label.trim().length > 60) {
      return res.status(400).json({
        success: false,
        message: 'Display label must be between 1 and 60 characters',
        data: null,
      });
    }
    validated.label = body.label.trim();
  }

  if (body.url !== undefined) {
    if (typeof body.url !== 'string' || !isValidHttpsUrl(body.url)) {
      return res.status(400).json({
        success: false,
        message: 'URL must be a valid HTTPS URL',
        data: null,
      });
    }
    validated.url = body.url.trim();
  }

  if (body.iconName !== undefined) {
    if (body.iconName === null || body.iconName === '') {
      validated.iconName = null;
    } else {
      if (typeof body.iconName !== 'string' || !iconRegex.test(body.iconName.trim())) {
        return res.status(400).json({
          success: false,
          message: 'iconName must be a safe alphanumeric identifier containing only letters, numbers, underscores, or hyphens (up to 50 chars)',
          data: null,
        });
      }
      validated.iconName = body.iconName.trim();
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
    validated.displayOrder = body.displayOrder;
  }

  if (body.isVisible !== undefined) {
    if (typeof body.isVisible !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isVisible must be a boolean',
        data: null,
      });
    }
    validated.isVisible = body.isVisible;
  }

  req.validatedSocialLinkData = validated;
  next();
};

/**
 * Validates SocialLink reordering payload
 */
export const validateReorderSocialLinks = (req, res, next) => {
  const body = req.body;

  let records = null;
  if (Array.isArray(body)) {
    records = body;
  } else if (body && Array.isArray(body.links)) {
    records = body.links;
  }

  if (!records || records.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Reorder payload must be a non-empty array of items with id and displayOrder',
      data: null,
    });
  }

  const seenIds = new Set();
  const seenOrders = new Set();

  for (const item of records) {
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
        message: `Invalid ID format in reorder list: ${id}`,
        data: null,
      });
    }

    if (displayOrder === undefined || !Number.isInteger(displayOrder) || displayOrder < 0) {
      return res.status(400).json({
        success: false,
        message: `displayOrder for ID ${id} must be a non-negative integer`,
        data: null,
      });
    }

    if (seenIds.has(id)) {
      return res.status(400).json({
        success: false,
        message: `Duplicate ID in reorder list: ${id}`,
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

  req.validatedReorderRecords = records;
  next();
};
