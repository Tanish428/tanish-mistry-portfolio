import {
  createExperience,
  getAdminExperience,
  getAdminExperienceById,
  updateExperience,
  deleteExperience,
  publishExperience,
  unpublishExperience,
  reorderExperience,
  createEducation,
  getAdminEducation,
  getAdminEducationById,
  updateEducation,
  deleteEducation,
  publishEducation,
  unpublishEducation,
  reorderEducation,
  getPublicExperience,
  getPublicEducation,
} from './experience-education.service.js';

// ==========================================
// EXPERIENCE CONTROLLERS
// ==========================================

export const createExp = async (req, res, next) => {
  try {
    const experience = await createExperience(req.body);
    res.status(201).json({
      success: true,
      message: 'Experience record created successfully',
      data: { experience },
    });
  } catch (error) {
    next(error);
  }
};

export const listExpAdmin = async (req, res, next) => {
  try {
    const result = await getAdminExperience(req.query);
    res.status(200).json({
      success: true,
      message: 'Experience records retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getExpById = async (req, res, next) => {
  try {
    const experience = await getAdminExperienceById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Experience record retrieved successfully',
      data: { experience },
    });
  } catch (error) {
    next(error);
  }
};

export const updateExp = async (req, res, next) => {
  try {
    const experience = await updateExperience(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Experience record updated successfully',
      data: { experience },
    });
  } catch (error) {
    next(error);
  }
};

export const removeExp = async (req, res, next) => {
  try {
    await deleteExperience(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Experience record deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const publishExp = async (req, res, next) => {
  try {
    const experience = await publishExperience(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Experience record published successfully',
      data: { experience },
    });
  } catch (error) {
    next(error);
  }
};

export const unpublishExp = async (req, res, next) => {
  try {
    const experience = await unpublishExperience(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Experience record unpublished successfully',
      data: { experience },
    });
  } catch (error) {
    next(error);
  }
};

export const reorderExp = async (req, res, next) => {
  try {
    const records = req.validatedReorderRecords;
    await reorderExperience(records);
    res.status(200).json({
      success: true,
      message: 'Experience records reordered successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// EDUCATION CONTROLLERS
// ==========================================

export const createEdu = async (req, res, next) => {
  try {
    const education = await createEducation(req.body);
    res.status(201).json({
      success: true,
      message: 'Education record created successfully',
      data: { education },
    });
  } catch (error) {
    next(error);
  }
};

export const listEduAdmin = async (req, res, next) => {
  try {
    const result = await getAdminEducation(req.query);
    res.status(200).json({
      success: true,
      message: 'Education records retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getEduById = async (req, res, next) => {
  try {
    const education = await getAdminEducationById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Education record retrieved successfully',
      data: { education },
    });
  } catch (error) {
    next(error);
  }
};

export const updateEdu = async (req, res, next) => {
  try {
    const education = await updateEducation(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Education record updated successfully',
      data: { education },
    });
  } catch (error) {
    next(error);
  }
};

export const removeEdu = async (req, res, next) => {
  try {
    await deleteEducation(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Education record deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const publishEdu = async (req, res, next) => {
  try {
    const education = await publishEducation(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Education record published successfully',
      data: { education },
    });
  } catch (error) {
    next(error);
  }
};

export const unpublishEdu = async (req, res, next) => {
  try {
    const education = await unpublishEducation(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Education record unpublished successfully',
      data: { education },
    });
  } catch (error) {
    next(error);
  }
};

export const reorderEdu = async (req, res, next) => {
  try {
    const records = req.validatedReorderRecords;
    await reorderEducation(records);
    res.status(200).json({
      success: true,
      message: 'Education records reordered successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PUBLIC CONTROLLERS
// ==========================================

export const listExpPublic = async (req, res, next) => {
  try {
    const result = await getPublicExperience(req.query);
    res.status(200).json({
      success: true,
      message: 'Experience records retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const listEduPublic = async (req, res, next) => {
  try {
    const result = await getPublicEducation(req.query);
    res.status(200).json({
      success: true,
      message: 'Education records retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
