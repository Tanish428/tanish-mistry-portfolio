import Project, { generateSlug } from './project.model.js';
import Media from '../media/media.model.js';

/**
 * Escapes characters for safe regular expression matching
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Formats project for administrator responses
 */
export const formatAdminProject = (project) => ({
  id: project._id,
  title: project.title,
  slug: project.slug,
  shortDescription: project.shortDescription,
  description: project.description,
  technologies: project.technologies,
  category: project.category,
  thumbnailUrl: project.thumbnailUrl,
  thumbnailMediaId: project.thumbnailMediaId || null,
  thumbnailAlt: project.thumbnailAlt,
  liveDemoUrl: project.liveDemoUrl,
  repositoryUrl: project.repositoryUrl,
  role: project.role,
  keyFeatures: project.keyFeatures,
  startDate: project.startDate,
  endDate: project.endDate,
  isFeatured: project.isFeatured,
  isVisible: project.isVisible,
  isPublished: project.isPublished,
  displayOrder: project.displayOrder,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
});

/**
 * Formats project for public portfolio responses (excludes internal flags)
 */
export const formatPublicProject = (project) => ({
  id: project._id,
  title: project.title,
  slug: project.slug,
  shortDescription: project.shortDescription,
  description: project.description,
  technologies: project.technologies,
  category: project.category,
  thumbnailUrl: project.thumbnailUrl,
  thumbnailAlt: project.thumbnailAlt,
  liveDemoUrl: project.liveDemoUrl,
  repositoryUrl: project.repositoryUrl,
  role: project.role,
  keyFeatures: project.keyFeatures,
  startDate: project.startDate,
  endDate: project.endDate,
  isFeatured: project.isFeatured,
  displayOrder: project.displayOrder,
  createdAt: project.createdAt,
});

/**
 * Creates a new project in draft state
 */
export const createProject = async (projectData) => {
  const slug = projectData.slug
    ? projectData.slug.toLowerCase().trim()
    : generateSlug(projectData.title);

  if (!slug) {
    const error = new Error('Could not generate a valid slug from the project title');
    error.statusCode = 400;
    throw error;
  }

  // Pre-emptive duplicate slug check
  const existingWithSlug = await Project.findOne({ slug });
  if (existingWithSlug) {
    const error = new Error(`A project with slug '${slug}' already exists`);
    error.statusCode = 409;
    throw error;
  }

  if (projectData.thumbnailMediaId) {
    const media = await Media.findById(projectData.thumbnailMediaId);
    if (!media || media.resourceType !== 'image') {
      const error = new Error('Referenced media record not found or is not an image');
      error.statusCode = 400;
      throw error;
    }
    projectData.thumbnailUrl = media.secureUrl;
  }

  try {
    const project = await Project.create({
      ...projectData,
      slug,
      isPublished: false,
      isVisible: projectData.isVisible !== undefined ? projectData.isVisible : true,
      isFeatured: projectData.isFeatured !== undefined ? projectData.isFeatured : false,
      displayOrder: projectData.displayOrder !== undefined ? projectData.displayOrder : 0,
    });

    return formatAdminProject(project);
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error(`A project with slug '${slug}' already exists`);
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};

/**
 * Retrieves projects for administrator dashboard with filtering and pagination
 */
export const getAdminProjects = async (queryParams = {}) => {
  const filter = {};

  if (queryParams.category) {
    filter.category = queryParams.category;
  }

  if (queryParams.isPublished !== undefined) {
    filter.isPublished = queryParams.isPublished === 'true';
  }

  if (queryParams.isFeatured !== undefined) {
    filter.isFeatured = queryParams.isFeatured === 'true';
  }

  if (queryParams.search) {
    filter.title = { $regex: escapeRegex(queryParams.search.trim()), $options: 'i' };
  }

  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Project.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    projects: projects.map(formatAdminProject),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

/**
 * Retrieves a single project by ID for administrator
 */
export const getAdminProjectById = async (id) => {
  const project = await Project.findById(id);

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  return formatAdminProject(project);
};

/**
 * Updates allowed fields of a project
 */
export const updateProject = async (id, updateData) => {
  const project = await Project.findById(id);

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  // Handle explicit slug change
  if (updateData.slug) {
    const newSlug = updateData.slug.toLowerCase().trim();
    if (newSlug !== project.slug) {
      const existing = await Project.findOne({ slug: newSlug, _id: { $ne: id } });
      if (existing) {
        const error = new Error(`A project with slug '${newSlug}' already exists`);
        error.statusCode = 409;
        throw error;
      }
      project.slug = newSlug;
    }
  }

  const allowedFields = [
    'title',
    'shortDescription',
    'description',
    'technologies',
    'category',
    'thumbnailUrl',
    'thumbnailMediaId',
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

  if (updateData.thumbnailMediaId !== undefined) {
    if (updateData.thumbnailMediaId === null || updateData.thumbnailMediaId === '') {
      project.thumbnailMediaId = null;
      if (updateData.thumbnailUrl !== undefined) {
        project.thumbnailUrl = updateData.thumbnailUrl || null;
      } else {
        project.thumbnailUrl = null;
      }
    } else {
      const media = await Media.findById(updateData.thumbnailMediaId);
      if (!media || media.resourceType !== 'image') {
        const error = new Error('Referenced media record not found or is not an image');
        error.statusCode = 400;
        throw error;
      }
      project.thumbnailMediaId = media._id;
      project.thumbnailUrl = media.secureUrl;
    }
  } else if (updateData.thumbnailUrl !== undefined) {
    if (updateData.thumbnailUrl === null || updateData.thumbnailUrl === '') {
      project.thumbnailUrl = null;
      project.thumbnailMediaId = null;
    } else {
      project.thumbnailUrl = updateData.thumbnailUrl;
      project.thumbnailMediaId = null;
    }
  }

  for (const field of allowedFields) {
    if (field !== 'thumbnailMediaId' && field !== 'thumbnailUrl' && field in updateData) {
      project[field] = updateData[field];
    }
  }

  try {
    await project.save();
    return formatAdminProject(project);
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error(`A project with slug '${project.slug}' already exists`);
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};

/**
 * Permanently deletes a project
 */
export const deleteProject = async (id) => {
  const project = await Project.findByIdAndDelete(id);

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  return true;
};

/**
 * Publishes a project
 */
export const publishProject = async (id) => {
  const project = await Project.findById(id);

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  // Mandatory fields check before publishing
  if (
    !project.title ||
    !project.slug ||
    !project.shortDescription ||
    !project.description ||
    !project.category ||
    !Array.isArray(project.technologies) ||
    project.technologies.length === 0
  ) {
    const error = new Error('Project must have complete mandatory content before publishing');
    error.statusCode = 400;
    throw error;
  }

  project.isPublished = true;
  await project.save();

  return formatAdminProject(project);
};

/**
 * Unpublishes a project
 */
export const unpublishProject = async (id) => {
  const project = await Project.findById(id);

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  project.isPublished = false;
  await project.save();

  return formatAdminProject(project);
};

/**
 * Updates featured status of a project
 */
export const updateFeaturedStatus = async (id, isFeatured) => {
  const project = await Project.findById(id);

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  project.isFeatured = isFeatured;
  await project.save();

  return formatAdminProject(project);
};

/**
 * Safely reorders projects in bulk
 */
export const reorderProjects = async (projectsArray) => {
  const ids = projectsArray.map((p) => p.id);

  // Verify all IDs exist
  const existingCount = await Project.countDocuments({ _id: { $in: ids } });
  if (existingCount !== ids.length) {
    const error = new Error('One or more project IDs were not found');
    error.statusCode = 404;
    throw error;
  }

  const operations = projectsArray.map(({ id, displayOrder }) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { displayOrder } },
    },
  }));

  await Project.bulkWrite(operations);

  return true;
};

/**
 * Retrieves public projects (strictly published and visible)
 */
export const getPublicProjects = async (queryParams = {}) => {
  const filter = {
    isPublished: true,
    isVisible: true,
  };

  if (queryParams.category) {
    filter.category = queryParams.category;
  }

  if (queryParams.search) {
    filter.title = { $regex: escapeRegex(queryParams.search.trim()), $options: 'i' };
  }

  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Sorting: Featured first (-1), then displayOrder ascending (1), then createdAt descending (-1)
  const [projects, total] = await Promise.all([
    Project.find(filter)
      .sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Project.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    projects: projects.map(formatPublicProject),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

/**
 * Retrieves a single published and visible project by slug
 */
export const getPublicProjectBySlug = async (slug) => {
  const project = await Project.findOne({
    slug: slug.toLowerCase().trim(),
    isPublished: true,
    isVisible: true,
  });

  if (!project) {
    const error = new Error('Project not found or currently unavailable');
    error.statusCode = 404;
    throw error;
  }

  return formatPublicProject(project);
};
