import {
  createSkillCategory,
  getAdminSkillCategories,
  getAdminSkillCategoryById,
  updateSkillCategory,
  deleteSkillCategory,
  publishSkillCategory,
  unpublishSkillCategory,
  reorderSkillCategories,
  createSkill,
  getAdminSkills,
  getAdminSkillById,
  updateSkill,
  deleteSkill,
  publishSkill,
  unpublishSkill,
  updateSkillFeaturedStatus,
  reorderSkills,
  getPublicSkillCategories,
  getPublicSkills,
} from './skills.service.js';

// ==========================================
// CATEGORY CONTROLLERS
// ==========================================

export const createCategory = async (req, res, next) => {
  try {
    const category = await createSkillCategory(req.body);
    res.status(201).json({
      success: true,
      message: 'Skill category created successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

export const listCategoriesAdmin = async (req, res, next) => {
  try {
    const result = await getAdminSkillCategories(req.query);
    res.status(200).json({
      success: true,
      message: 'Skill categories retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await getAdminSkillCategoryById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Skill category retrieved successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await updateSkillCategory(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Skill category updated successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

export const removeCategory = async (req, res, next) => {
  try {
    await deleteSkillCategory(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Skill category deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const publishCategory = async (req, res, next) => {
  try {
    const category = await publishSkillCategory(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Skill category published successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

export const unpublishCategory = async (req, res, next) => {
  try {
    const category = await unpublishSkillCategory(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Skill category unpublished successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

export const reorderCategories = async (req, res, next) => {
  try {
    await reorderSkillCategories(req.body.categories);
    res.status(200).json({
      success: true,
      message: 'Skill categories reordered successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// SKILL CONTROLLERS
// ==========================================

export const create = async (req, res, next) => {
  try {
    const skill = await createSkill(req.body);
    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: { skill },
    });
  } catch (error) {
    next(error);
  }
};

export const listSkillsAdmin = async (req, res, next) => {
  try {
    const result = await getAdminSkills(req.query);
    res.status(200).json({
      success: true,
      message: 'Skills retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getSkillById = async (req, res, next) => {
  try {
    const skill = await getAdminSkillById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Skill retrieved successfully',
      data: { skill },
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const skill = await updateSkill(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      data: { skill },
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await deleteSkill(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Skill deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const publish = async (req, res, next) => {
  try {
    const skill = await publishSkill(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Skill published successfully',
      data: { skill },
    });
  } catch (error) {
    next(error);
  }
};

export const unpublish = async (req, res, next) => {
  try {
    const skill = await unpublishSkill(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Skill unpublished successfully',
      data: { skill },
    });
  } catch (error) {
    next(error);
  }
};

export const setFeatured = async (req, res, next) => {
  try {
    const skill = await updateSkillFeaturedStatus(req.params.id, req.body.isFeatured);
    res.status(200).json({
      success: true,
      message: 'Skill featured status updated successfully',
      data: { skill },
    });
  } catch (error) {
    next(error);
  }
};

export const reorder = async (req, res, next) => {
  try {
    await reorderSkills(req.body.categoryId, req.body.skills);
    res.status(200).json({
      success: true,
      message: 'Skills reordered successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PUBLIC CONTROLLERS
// ==========================================

export const listPublicCategories = async (req, res, next) => {
  try {
    const result = await getPublicSkillCategories();
    res.status(200).json({
      success: true,
      message: 'Skill categories retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const listPublicSkills = async (req, res, next) => {
  try {
    const result = await getPublicSkills(req.query);
    res.status(200).json({
      success: true,
      message: 'Skills retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
