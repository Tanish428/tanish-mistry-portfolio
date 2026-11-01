import mongoose from 'mongoose';
import { EMPLOYMENT_TYPES, WORK_MODES } from './experience.model.js';

const ALLOWED_EXPERIENCE_CREATE_FIELDS = [
  'company',
  'position',
  'employmentType',
  'location',
  'workMode',
  'startDate',
  'endDate',
  'isCurrent',
  'description',
  'responsibilities',
  'achievements',
  'technologies',
  'displayOrder',
  'isVisible',
];

const ALLOWED_EXPERIENCE_UPDATE_FIELDS = [...ALLOWED_EXPERIENCE_CREATE_FIELDS];

const ALLOWED_EDUCATION_CREATE_FIELDS = [
  'institution',
  'degree',
  'fieldOfStudy',
  'location',
  'startDate',
  'endDate',
  'isCurrent',
  'grade',
  'description',
  'achievements',
  'displayOrder',
  'isVisible',
];

const ALLOWED_EDUCATION_UPDATE_FIELDS = [...ALLOWED_EDUCATION_CREATE_FIELDS];

const PROTECTED_FIELDS = [
  '_id',
  'isPublished',
  'createdAt',
  'updatedAt',
  '__v',
];

/**
 * Normalizes string array (e.g. responsibilities, achievements, technologies)
 */
const normalizeStringArray = (arr, fieldName, maxItems = 20, maxItemLength = 300) => {
  if (!Array.isArray(arr)) {
    throw new Error(`${fieldName} must be an array of strings`);
  }
  if (arr.length > maxItems) {
    throw new Error(`${fieldName} cannot exceed ${maxItems} items`);
  }

  return arr.map((item) => {
    if (typeof item !== 'string' || item.trim().length === 0) {
      throw new Error(`Items in ${fieldName} must be non-empty strings`);
    }
    const trimmed = item.trim();
    if (trimmed.length > maxItemLength) {
      throw new Error(`Each item in ${fieldName} cannot exceed ${maxItemLength} characters`);
    }
    return trimmed;
  });
};

/**
 * Validates Experience Creation
 */
export const validateCreateExperience = (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a valid JSON object',
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
    if (!ALLOWED_EXPERIENCE_CREATE_FIELDS.includes(key)) {
      return res.status(400).json({
        success: false,
        message: `Field '${key}' is not allowed`,
        data: null,
      });
    }
  }

  // Required fields check
  if (!body.company || typeof body.company !== 'string' || body.company.trim().length < 2 || body.company.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Company name is required and must be between 2 and 100 characters',
      data: null,
    });
  }

  if (!body.position || typeof body.position !== 'string' || body.position.trim().length < 2 || body.position.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Position is required and must be between 2 and 100 characters',
      data: null,
    });
  }

  if (!body.employmentType || !EMPLOYMENT_TYPES.includes(body.employmentType)) {
    return res.status(400).json({
      success: false,
      message: `employmentType is required and must be one of: ${EMPLOYMENT_TYPES.join(', ')}`,
      data: null,
    });
  }

  if (body.workMode !== undefined && body.workMode !== null && !WORK_MODES.includes(body.workMode)) {
    return res.status(400).json({
      success: false,
      message: `workMode must be one of: ${WORK_MODES.join(', ')}`,
      data: null,
    });
  }

  if (!body.startDate || isNaN(new Date(body.startDate).getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Valid startDate is required',
      data: null,
    });
  }

  const isCurrent = body.isCurrent === true;

  if (isCurrent) {
    if (body.endDate !== undefined && body.endDate !== null) {
      return res.status(400).json({
        success: false,
        message: 'endDate must be null when isCurrent is true',
        data: null,
      });
    }
  } else {
    if (!body.endDate || isNaN(new Date(body.endDate).getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Valid endDate is required when isCurrent is false',
        data: null,
      });
    }
    if (new Date(body.endDate) < new Date(body.startDate)) {
      return res.status(400).json({
        success: false,
        message: 'endDate cannot precede startDate',
        data: null,
      });
    }
  }

  if (body.location !== undefined && body.location !== null) {
    if (typeof body.location !== 'string' || body.location.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Location cannot exceed 100 characters',
        data: null,
      });
    }
  }

  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string' || body.description.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Description cannot exceed 2000 characters',
        data: null,
      });
    }
  }

  if (body.responsibilities !== undefined && body.responsibilities !== null) {
    try {
      req.body.responsibilities = normalizeStringArray(body.responsibilities, 'responsibilities', 20, 300);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
        data: null,
      });
    }
  }

  if (body.achievements !== undefined && body.achievements !== null) {
    try {
      req.body.achievements = normalizeStringArray(body.achievements, 'achievements', 20, 300);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
        data: null,
      });
    }
  }

  if (body.technologies !== undefined && body.technologies !== null) {
    try {
      req.body.technologies = normalizeStringArray(body.technologies, 'technologies', 30, 50);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
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
 * Validates Experience Update
 */
export const validateUpdateExperience = (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a valid JSON object',
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
    if (!ALLOWED_EXPERIENCE_UPDATE_FIELDS.includes(key)) {
      return res.status(400).json({
        success: false,
        message: `Field '${key}' is not allowed`,
        data: null,
      });
    }
  }

  if (body.company !== undefined) {
    if (typeof body.company !== 'string' || body.company.trim().length < 2 || body.company.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Company name must be between 2 and 100 characters',
        data: null,
      });
    }
  }

  if (body.position !== undefined) {
    if (typeof body.position !== 'string' || body.position.trim().length < 2 || body.position.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Position must be between 2 and 100 characters',
        data: null,
      });
    }
  }

  if (body.employmentType !== undefined && !EMPLOYMENT_TYPES.includes(body.employmentType)) {
    return res.status(400).json({
      success: false,
      message: `employmentType must be one of: ${EMPLOYMENT_TYPES.join(', ')}`,
      data: null,
    });
  }

  if (body.workMode !== undefined && body.workMode !== null && !WORK_MODES.includes(body.workMode)) {
    return res.status(400).json({
      success: false,
      message: `workMode must be one of: ${WORK_MODES.join(', ')}`,
      data: null,
    });
  }

  if (body.startDate !== undefined && isNaN(new Date(body.startDate).getTime())) {
    return res.status(400).json({
      success: false,
      message: 'startDate must be a valid date',
      data: null,
    });
  }

  if (body.endDate !== undefined && body.endDate !== null && isNaN(new Date(body.endDate).getTime())) {
    return res.status(400).json({
      success: false,
      message: 'endDate must be a valid date',
      data: null,
    });
  }

  // Check intra-payload dates consistency if both are sent
  if (body.isCurrent === true && body.endDate !== undefined && body.endDate !== null) {
    return res.status(400).json({
      success: false,
      message: 'endDate must be null when isCurrent is true',
      data: null,
    });
  }

  if (body.startDate && body.endDate && new Date(body.endDate) < new Date(body.startDate)) {
    return res.status(400).json({
      success: false,
      message: 'endDate cannot precede startDate',
      data: null,
    });
  }

  if (body.responsibilities !== undefined && body.responsibilities !== null) {
    try {
      req.body.responsibilities = normalizeStringArray(body.responsibilities, 'responsibilities', 20, 300);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
        data: null,
      });
    }
  }

  if (body.achievements !== undefined && body.achievements !== null) {
    try {
      req.body.achievements = normalizeStringArray(body.achievements, 'achievements', 20, 300);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
        data: null,
      });
    }
  }

  if (body.technologies !== undefined && body.technologies !== null) {
    try {
      req.body.technologies = normalizeStringArray(body.technologies, 'technologies', 30, 50);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
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
 * Validates Education Creation
 */
export const validateCreateEducation = (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a valid JSON object',
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
    if (!ALLOWED_EDUCATION_CREATE_FIELDS.includes(key)) {
      return res.status(400).json({
        success: false,
        message: `Field '${key}' is not allowed`,
        data: null,
      });
    }
  }

  if (!body.institution || typeof body.institution !== 'string' || body.institution.trim().length < 2 || body.institution.trim().length > 120) {
    return res.status(400).json({
      success: false,
      message: 'Institution name is required and must be between 2 and 120 characters',
      data: null,
    });
  }

  if (!body.degree || typeof body.degree !== 'string' || body.degree.trim().length < 2 || body.degree.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Degree is required and must be between 2 and 100 characters',
      data: null,
    });
  }

  if (!body.startDate || isNaN(new Date(body.startDate).getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Valid startDate is required',
      data: null,
    });
  }

  const isCurrent = body.isCurrent === true;

  if (isCurrent) {
    if (body.endDate !== undefined && body.endDate !== null) {
      return res.status(400).json({
        success: false,
        message: 'endDate must be null when isCurrent is true',
        data: null,
      });
    }
  } else {
    if (!body.endDate || isNaN(new Date(body.endDate).getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Valid endDate is required when isCurrent is false',
        data: null,
      });
    }
    if (new Date(body.endDate) < new Date(body.startDate)) {
      return res.status(400).json({
        success: false,
        message: 'endDate cannot precede startDate',
        data: null,
      });
    }
  }

  if (body.fieldOfStudy !== undefined && body.fieldOfStudy !== null) {
    if (typeof body.fieldOfStudy !== 'string' || body.fieldOfStudy.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Field of study cannot exceed 100 characters',
        data: null,
      });
    }
  }

  if (body.location !== undefined && body.location !== null) {
    if (typeof body.location !== 'string' || body.location.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Location cannot exceed 100 characters',
        data: null,
      });
    }
  }

  if (body.grade !== undefined && body.grade !== null) {
    if (typeof body.grade !== 'string' || body.grade.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Grade cannot exceed 50 characters',
        data: null,
      });
    }
  }

  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string' || body.description.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Description cannot exceed 2000 characters',
        data: null,
      });
    }
  }

  if (body.achievements !== undefined && body.achievements !== null) {
    try {
      req.body.achievements = normalizeStringArray(body.achievements, 'achievements', 20, 300);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
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
 * Validates Education Update
 */
export const validateUpdateEducation = (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a valid JSON object',
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
    if (!ALLOWED_EDUCATION_UPDATE_FIELDS.includes(key)) {
      return res.status(400).json({
        success: false,
        message: `Field '${key}' is not allowed`,
        data: null,
      });
    }
  }

  if (body.institution !== undefined) {
    if (typeof body.institution !== 'string' || body.institution.trim().length < 2 || body.institution.trim().length > 120) {
      return res.status(400).json({
        success: false,
        message: 'Institution name must be between 2 and 120 characters',
        data: null,
      });
    }
  }

  if (body.degree !== undefined) {
    if (typeof body.degree !== 'string' || body.degree.trim().length < 2 || body.degree.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Degree must be between 2 and 100 characters',
        data: null,
      });
    }
  }

  if (body.startDate !== undefined && isNaN(new Date(body.startDate).getTime())) {
    return res.status(400).json({
      success: false,
      message: 'startDate must be a valid date',
      data: null,
    });
  }

  if (body.endDate !== undefined && body.endDate !== null && isNaN(new Date(body.endDate).getTime())) {
    return res.status(400).json({
      success: false,
      message: 'endDate must be a valid date',
      data: null,
    });
  }

  if (body.isCurrent === true && body.endDate !== undefined && body.endDate !== null) {
    return res.status(400).json({
      success: false,
      message: 'endDate must be null when isCurrent is true',
      data: null,
    });
  }

  if (body.startDate && body.endDate && new Date(body.endDate) < new Date(body.startDate)) {
    return res.status(400).json({
      success: false,
      message: 'endDate cannot precede startDate',
      data: null,
    });
  }

  if (body.achievements !== undefined && body.achievements !== null) {
    try {
      req.body.achievements = normalizeStringArray(body.achievements, 'achievements', 20, 300);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
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
 * Validates ObjectId route param
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
 * Validates reorder request for either experience or education
 */
export const validateReorderRecords = (req, res, next) => {
  const records = req.body.records || req.body.experience || req.body.education;

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Payload must contain a non-empty array of reorder items',
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
        message: `Invalid ID: ${id}`,
        data: null,
      });
    }

    if (displayOrder === undefined || !Number.isInteger(displayOrder) || displayOrder < 0) {
      return res.status(400).json({
        success: false,
        message: `displayOrder must be a non-negative integer for record ${id}`,
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

/**
 * Validates admin listing query params
 */
export const validateAdminQuery = (req, res, next) => {
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
      message: 'isPublished must be either true or false',
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
 * Validates public listing query params
 */
export const validatePublicQuery = (req, res, next) => {
  const { page, limit, search } = req.query;

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

  if (search !== undefined && (typeof search !== 'string' || search.length > 100)) {
    return res.status(400).json({
      success: false,
      message: 'search query parameter must be a string up to 100 characters',
      data: null,
    });
  }

  next();
};
