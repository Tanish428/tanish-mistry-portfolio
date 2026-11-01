import * as homepageSectionService from './homepage-section.service.js';

/**
 * Administrator: Creates a new homepage section in draft state
 */
export const createHomepageSection = async (req, res, next) => {
  try {
    const section = await homepageSectionService.createHomepageSection(req.body);
    return res.status(201).json({
      success: true,
      message: 'Homepage section created successfully',
      data: { section },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Administrator: Retrieves all homepage sections
 */
export const getAdminHomepageSections = async (req, res, next) => {
  try {
    const sections = await homepageSectionService.getAdminHomepageSections();
    return res.status(200).json({
      success: true,
      message: 'Homepage sections retrieved successfully',
      data: { sections },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Administrator: Retrieves single homepage section by ID
 */
export const getAdminHomepageSectionById = async (req, res, next) => {
  try {
    const section = await homepageSectionService.getAdminHomepageSectionById(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Homepage section retrieved successfully',
      data: { section },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Administrator: Partially updates homepage section
 */
export const updateHomepageSection = async (req, res, next) => {
  try {
    const section = await homepageSectionService.updateHomepageSection(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Homepage section updated successfully',
      data: { section },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Administrator: Permanently deletes homepage section
 */
export const deleteHomepageSection = async (req, res, next) => {
  try {
    await homepageSectionService.deleteHomepageSection(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Homepage section deleted successfully',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Administrator: Publishes homepage section
 */
export const publishHomepageSection = async (req, res, next) => {
  try {
    const section = await homepageSectionService.publishHomepageSection(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Homepage section published successfully',
      data: { section },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Administrator: Unpublishes homepage section
 */
export const unpublishHomepageSection = async (req, res, next) => {
  try {
    const section = await homepageSectionService.unpublishHomepageSection(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Homepage section unpublished successfully',
      data: { section },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Administrator: Bulk reorders homepage sections
 */
export const reorderHomepageSections = async (req, res, next) => {
  try {
    await homepageSectionService.reorderHomepageSections(req.body);
    return res.status(200).json({
      success: true,
      message: 'Homepage sections reordered successfully',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Public: Retrieves published and visible homepage sections with populated content
 */
export const getPublicHomepageSections = async (req, res, next) => {
  try {
    const result = await homepageSectionService.getPublicHomepageSections();
    return res.status(200).json({
      success: true,
      message: 'Public homepage sections retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
