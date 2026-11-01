import mongoose from 'mongoose';
import SkillCategory, { generateSlug } from './skill-category.model.js';
import Skill from './skill.model.js';

/**
 * Escapes characters for safe regular expression matching
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Format category for admin response
 */
export const formatAdminCategory = (cat) => ({
  id: cat._id,
  name: cat.name,
  slug: cat.slug,
  description: cat.description,
  displayOrder: cat.displayOrder,
  isVisible: cat.isVisible,
  isPublished: cat.isPublished,
  createdAt: cat.createdAt,
  updatedAt: cat.updatedAt,
});

/**
 * Format category for public response
 */
export const formatPublicCategory = (cat) => ({
  id: cat._id,
  name: cat.name,
  slug: cat.slug,
  description: cat.description,
  displayOrder: cat.displayOrder,
});

/**
 * Format skill for admin response
 */
export const formatAdminSkill = (skill) => ({
  id: skill._id,
  name: skill.name,
  slug: skill.slug,
  category: skill.category?._id
    ? {
        id: skill.category._id,
        name: skill.category.name,
        slug: skill.category.slug,
      }
    : skill.category,
  description: skill.description,
  proficiencyLevel: skill.proficiencyLevel,
  iconName: skill.iconName,
  isFeatured: skill.isFeatured,
  isVisible: skill.isVisible,
  isPublished: skill.isPublished,
  displayOrder: skill.displayOrder,
  createdAt: skill.createdAt,
  updatedAt: skill.updatedAt,
});

/**
 * Format skill for public response
 */
export const formatPublicSkill = (skill) => ({
  id: skill._id,
  name: skill.name,
  slug: skill.slug,
  category: skill.category?._id
    ? {
        id: skill.category._id,
        name: skill.category.name,
        slug: skill.category.slug,
      }
    : skill.category,
  description: skill.description,
  proficiencyLevel: skill.proficiencyLevel,
  iconName: skill.iconName,
  isFeatured: skill.isFeatured,
  displayOrder: skill.displayOrder,
});

// ==========================================
// SKILL CATEGORY OPERATIONS
// ==========================================

/**
 * Creates a new skill category in draft state
 */
export const createSkillCategory = async (categoryData) => {
  const slug = categoryData.slug
    ? categoryData.slug.toLowerCase().trim()
    : generateSlug(categoryData.name);

  if (!slug) {
    const error = new Error('Could not generate a valid slug from the category name');
    error.statusCode = 400;
    throw error;
  }

  const existing = await SkillCategory.findOne({ slug });
  if (existing) {
    const error = new Error(`A category with slug '${slug}' already exists`);
    error.statusCode = 409;
    throw error;
  }

  try {
    const category = await SkillCategory.create({
      ...categoryData,
      slug,
      isPublished: false,
      isVisible: categoryData.isVisible !== undefined ? categoryData.isVisible : true,
      displayOrder: categoryData.displayOrder !== undefined ? categoryData.displayOrder : 0,
    });

    return formatAdminCategory(category);
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error(`A category with slug '${slug}' already exists`);
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};

/**
 * Retrieves all skill categories for administrator
 */
export const getAdminSkillCategories = async (queryParams = {}) => {
  const filter = {};

  if (queryParams.isPublished !== undefined) {
    filter.isPublished = queryParams.isPublished === 'true';
  }

  if (queryParams.search) {
    filter.name = { $regex: escapeRegex(queryParams.search.trim()), $options: 'i' };
  }

  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const [categories, total] = await Promise.all([
    SkillCategory.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    SkillCategory.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    categories: categories.map(formatAdminCategory),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

/**
 * Retrieves a single skill category by ID for administrator
 */
export const getAdminSkillCategoryById = async (id) => {
  const category = await SkillCategory.findById(id);

  if (!category) {
    const error = new Error('Skill category not found');
    error.statusCode = 404;
    throw error;
  }

  return formatAdminCategory(category);
};

/**
 * Updates a skill category
 */
export const updateSkillCategory = async (id, updateData) => {
  const category = await SkillCategory.findById(id);

  if (!category) {
    const error = new Error('Skill category not found');
    error.statusCode = 404;
    throw error;
  }

  if (updateData.slug) {
    const newSlug = updateData.slug.toLowerCase().trim();
    if (newSlug !== category.slug) {
      const existing = await SkillCategory.findOne({ slug: newSlug, _id: { $ne: id } });
      if (existing) {
        const error = new Error(`A category with slug '${newSlug}' already exists`);
        error.statusCode = 409;
        throw error;
      }
      category.slug = newSlug;
    }
  }

  const allowedFields = ['name', 'description', 'displayOrder', 'isVisible'];
  for (const field of allowedFields) {
    if (field in updateData) {
      category[field] = updateData[field];
    }
  }

  try {
    await category.save();
    return formatAdminCategory(category);
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error(`A category with slug '${category.slug}' already exists`);
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};

/**
 * Deletes a skill category, blocked if skills still reference it
 */
export const deleteSkillCategory = async (id) => {
  const category = await SkillCategory.findById(id);

  if (!category) {
    const error = new Error('Skill category not found');
    error.statusCode = 404;
    throw error;
  }

  const skillsCount = await Skill.countDocuments({ category: id });
  if (skillsCount > 0) {
    const error = new Error('Cannot delete category with associated skills. Please reassign or delete the skills first.');
    error.statusCode = 409;
    throw error;
  }

  await SkillCategory.findByIdAndDelete(id);
  return true;
};

/**
 * Publishes a skill category
 */
export const publishSkillCategory = async (id) => {
  const category = await SkillCategory.findById(id);

  if (!category) {
    const error = new Error('Skill category not found');
    error.statusCode = 404;
    throw error;
  }

  if (!category.name || !category.slug) {
    const error = new Error('Category must have complete mandatory content before publishing');
    error.statusCode = 400;
    throw error;
  }

  category.isPublished = true;
  await category.save();

  return formatAdminCategory(category);
};

/**
 * Unpublishes a skill category
 */
export const unpublishSkillCategory = async (id) => {
  const category = await SkillCategory.findById(id);

  if (!category) {
    const error = new Error('Skill category not found');
    error.statusCode = 404;
    throw error;
  }

  category.isPublished = false;
  await category.save();

  return formatAdminCategory(category);
};

/**
 * Reorders skill categories in bulk
 */
export const reorderSkillCategories = async (categoriesArray) => {
  const ids = categoriesArray.map((c) => c.id);

  const existingCount = await SkillCategory.countDocuments({ _id: { $in: ids } });
  if (existingCount !== ids.length) {
    const error = new Error('One or more category IDs were not found');
    error.statusCode = 404;
    throw error;
  }

  const operations = categoriesArray.map(({ id, displayOrder }) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { displayOrder } },
    },
  }));

  await SkillCategory.bulkWrite(operations);
  return true;
};

// ==========================================
// SKILL OPERATIONS
// ==========================================

/**
 * Creates a new skill in draft state
 */
export const createSkill = async (skillData) => {
  // Verify category exists
  const category = await SkillCategory.findById(skillData.category);
  if (!category) {
    const error = new Error('Referenced category does not exist');
    error.statusCode = 400;
    throw error;
  }

  const slug = skillData.slug
    ? skillData.slug.toLowerCase().trim()
    : generateSlug(skillData.name);

  if (!slug) {
    const error = new Error('Could not generate a valid slug from the skill name');
    error.statusCode = 400;
    throw error;
  }

  const existing = await Skill.findOne({ slug });
  if (existing) {
    const error = new Error(`A skill with slug '${slug}' already exists`);
    error.statusCode = 409;
    throw error;
  }

  try {
    const skill = await Skill.create({
      ...skillData,
      slug,
      isPublished: false,
      isVisible: skillData.isVisible !== undefined ? skillData.isVisible : true,
      isFeatured: skillData.isFeatured !== undefined ? skillData.isFeatured : false,
      displayOrder: skillData.displayOrder !== undefined ? skillData.displayOrder : 0,
    });

    await skill.populate('category', 'name slug');
    return formatAdminSkill(skill);
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error(`A skill with slug '${slug}' already exists`);
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};

/**
 * Retrieves all skills for administrator with filtering and pagination
 */
export const getAdminSkills = async (queryParams = {}) => {
  const filter = {};

  if (queryParams.category) {
    if (mongoose.Types.ObjectId.isValid(queryParams.category)) {
      filter.category = queryParams.category;
    } else {
      const cat = await SkillCategory.findOne({ slug: queryParams.category.toLowerCase().trim() });
      if (cat) {
        filter.category = cat._id;
      } else {
        filter.category = new mongoose.Types.ObjectId(); // matches none
      }
    }
  }

  if (queryParams.proficiencyLevel) {
    filter.proficiencyLevel = queryParams.proficiencyLevel;
  }

  if (queryParams.isPublished !== undefined) {
    filter.isPublished = queryParams.isPublished === 'true';
  }

  if (queryParams.isFeatured !== undefined) {
    filter.isFeatured = queryParams.isFeatured === 'true';
  }

  if (queryParams.search) {
    filter.name = { $regex: escapeRegex(queryParams.search.trim()), $options: 'i' };
  }

  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const [skills, total] = await Promise.all([
    Skill.find(filter)
      .populate('category', 'name slug')
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Skill.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    skills: skills.map(formatAdminSkill),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

/**
 * Retrieves a single skill by ID for administrator
 */
export const getAdminSkillById = async (id) => {
  const skill = await Skill.findById(id).populate('category', 'name slug');

  if (!skill) {
    const error = new Error('Skill not found');
    error.statusCode = 404;
    throw error;
  }

  return formatAdminSkill(skill);
};

/**
 * Updates a skill
 */
export const updateSkill = async (id, updateData) => {
  const skill = await Skill.findById(id);

  if (!skill) {
    const error = new Error('Skill not found');
    error.statusCode = 404;
    throw error;
  }

  if (updateData.category) {
    const categoryExists = await SkillCategory.findById(updateData.category);
    if (!categoryExists) {
      const error = new Error('Referenced category does not exist');
      error.statusCode = 400;
      throw error;
    }
    skill.category = updateData.category;
  }

  if (updateData.slug) {
    const newSlug = updateData.slug.toLowerCase().trim();
    if (newSlug !== skill.slug) {
      const existing = await Skill.findOne({ slug: newSlug, _id: { $ne: id } });
      if (existing) {
        const error = new Error(`A skill with slug '${newSlug}' already exists`);
        error.statusCode = 409;
        throw error;
      }
      skill.slug = newSlug;
    }
  }

  const allowedFields = [
    'name',
    'description',
    'proficiencyLevel',
    'iconName',
    'isFeatured',
    'isVisible',
    'displayOrder',
  ];

  for (const field of allowedFields) {
    if (field in updateData) {
      skill[field] = updateData[field];
    }
  }

  try {
    await skill.save();
    await skill.populate('category', 'name slug');
    return formatAdminSkill(skill);
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error(`A skill with slug '${skill.slug}' already exists`);
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};

/**
 * Deletes a skill
 */
export const deleteSkill = async (id) => {
  const skill = await Skill.findByIdAndDelete(id);

  if (!skill) {
    const error = new Error('Skill not found');
    error.statusCode = 404;
    throw error;
  }

  return true;
};

/**
 * Publishes a skill
 */
export const publishSkill = async (id) => {
  const skill = await Skill.findById(id);

  if (!skill) {
    const error = new Error('Skill not found');
    error.statusCode = 404;
    throw error;
  }

  if (!skill.name || !skill.slug || !skill.category || !skill.proficiencyLevel) {
    const error = new Error('Skill must have complete mandatory content before publishing');
    error.statusCode = 400;
    throw error;
  }

  skill.isPublished = true;
  await skill.save();
  await skill.populate('category', 'name slug');

  return formatAdminSkill(skill);
};

/**
 * Unpublishes a skill
 */
export const unpublishSkill = async (id) => {
  const skill = await Skill.findById(id);

  if (!skill) {
    const error = new Error('Skill not found');
    error.statusCode = 404;
    throw error;
  }

  skill.isPublished = false;
  await skill.save();
  await skill.populate('category', 'name slug');

  return formatAdminSkill(skill);
};

/**
 * Updates skill featured status
 */
export const updateSkillFeaturedStatus = async (id, isFeatured) => {
  const skill = await Skill.findById(id);

  if (!skill) {
    const error = new Error('Skill not found');
    error.statusCode = 404;
    throw error;
  }

  skill.isFeatured = isFeatured;
  await skill.save();
  await skill.populate('category', 'name slug');

  return formatAdminSkill(skill);
};

/**
 * Safely reorders skills within a specified category
 */
export const reorderSkills = async (categoryId, skillsArray) => {
  const categoryExists = await SkillCategory.findById(categoryId);
  if (!categoryExists) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  const ids = skillsArray.map((s) => s.id);

  // Verify all skills exist AND belong to the specified category
  const existingSkills = await Skill.find({ _id: { $in: ids } });
  if (existingSkills.length !== ids.length) {
    const error = new Error('One or more skill IDs were not found');
    error.statusCode = 404;
    throw error;
  }

  for (const s of existingSkills) {
    if (s.category.toString() !== categoryId.toString()) {
      const error = new Error(`Skill with ID '${s._id}' does not belong to category '${categoryId}'`);
      error.statusCode = 400;
      throw error;
    }
  }

  const operations = skillsArray.map(({ id, displayOrder }) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { displayOrder } },
    },
  }));

  await Skill.bulkWrite(operations);
  return true;
};

// ==========================================
// PUBLIC PORTFOLIO OPERATIONS
// ==========================================

/**
 * Retrieves published and visible skill categories for public portfolio
 */
export const getPublicSkillCategories = async () => {
  const categories = await SkillCategory.find({
    isPublished: true,
    isVisible: true,
  }).sort({ displayOrder: 1, createdAt: -1 });

  return {
    categories: categories.map(formatPublicCategory),
  };
};

/**
 * Retrieves published and visible skills whose category is also published and visible
 */
export const getPublicSkills = async (queryParams = {}) => {
  // Step 1: Query published and visible categories
  const activeCategories = await SkillCategory.find({
    isPublished: true,
    isVisible: true,
  });

  if (activeCategories.length === 0) {
    return {
      skills: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
      },
    };
  }

  const activeCategoryIds = activeCategories.map((c) => c._id);
  const filter = {
    isPublished: true,
    isVisible: true,
    category: { $in: activeCategoryIds },
  };

  // Step 2: Handle optional public category filter (by slug or by ObjectId)
  if (queryParams.category) {
    const rawCat = queryParams.category.trim();
    const matchingCat = activeCategories.find(
      (c) => c.slug === rawCat.toLowerCase() || c._id.toString() === rawCat
    );

    if (!matchingCat) {
      // Category is either non-existent, unpublished, or invisible
      return {
        skills: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        },
      };
    }

    filter.category = matchingCat._id;
  }

  // Step 3: Handle optional featured filter
  if (queryParams.featured !== undefined) {
    filter.isFeatured = queryParams.featured === 'true';
  }

  // Step 4: Handle optional search filter
  if (queryParams.search) {
    filter.name = { $regex: escapeRegex(queryParams.search.trim()), $options: 'i' };
  }

  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 50;
  const skip = (page - 1) * limit;

  // Sorting: featured first, then displayOrder ascending, then createdAt descending
  const [skills, total] = await Promise.all([
    Skill.find(filter)
      .populate('category', 'name slug')
      .sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Skill.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    skills: skills.map(formatPublicSkill),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};
