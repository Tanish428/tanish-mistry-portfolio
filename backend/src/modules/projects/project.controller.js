import {
  createProject,
  getAdminProjects,
  getAdminProjectById,
  updateProject,
  deleteProject,
  publishProject,
  unpublishProject,
  updateFeaturedStatus,
  reorderProjects,
  getPublicProjects,
  getPublicProjectBySlug,
} from './project.service.js';

/**
 * Create a new draft project
 */
export const create = async (req, res, next) => {
  try {
    const project = await createProject(req.body);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all projects for administrator (draft and published)
 */
export const listAdmin = async (req, res, next) => {
  try {
    const result = await getAdminProjects(req.query);

    res.status(200).json({
      success: true,
      message: 'Projects retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get project by ID for administrator
 */
export const getById = async (req, res, next) => {
  try {
    const project = await getAdminProjectById(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project retrieved successfully',
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update project
 */
export const update = async (req, res, next) => {
  try {
    const project = await updateProject(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete project
 */
export const remove = async (req, res, next) => {
  try {
    await deleteProject(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Publish project
 */
export const publish = async (req, res, next) => {
  try {
    const project = await publishProject(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project published successfully',
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unpublish project
 */
export const unpublish = async (req, res, next) => {
  try {
    const project = await unpublishProject(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project unpublished successfully',
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update featured status
 */
export const setFeatured = async (req, res, next) => {
  try {
    const project = await updateFeaturedStatus(req.params.id, req.body.isFeatured);

    res.status(200).json({
      success: true,
      message: 'Project featured status updated successfully',
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reorder projects in bulk
 */
export const reorder = async (req, res, next) => {
  try {
    await reorderProjects(req.body.projects);

    res.status(200).json({
      success: true,
      message: 'Projects reordered successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List published and visible projects for public portfolio
 */
export const listPublic = async (req, res, next) => {
  try {
    const result = await getPublicProjects(req.query);

    res.status(200).json({
      success: true,
      message: 'Projects retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get published and visible project by slug for public portfolio
 */
export const getBySlugPublic = async (req, res, next) => {
  try {
    const project = await getPublicProjectBySlug(req.params.slug);

    res.status(200).json({
      success: true,
      message: 'Project retrieved successfully',
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};
