import {
  createProfile,
  getAdminProfile,
  getPublicProfile,
  updateProfile,
  publishProfile,
  unpublishProfile,
} from './profile.service.js';

/**
 * Create initial profile
 */
export const create = async (req, res, next) => {
  try {
    const profile = await createProfile(req.body);

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get administrator profile (includes draft/unpublished fields)
 */
export const getAdmin = async (req, res, next) => {
  try {
    const profile = await getAdminProfile();

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update allowed profile fields
 */
export const update = async (req, res, next) => {
  try {
    const profile = await updateProfile(req.body);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Publish profile
 */
export const publish = async (req, res, next) => {
  try {
    const profile = await publishProfile();

    res.status(200).json({
      success: true,
      message: 'Profile published successfully',
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unpublish profile
 */
export const unpublish = async (req, res, next) => {
  try {
    const profile = await unpublishProfile();

    res.status(200).json({
      success: true,
      message: 'Profile unpublished successfully',
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get published and visible profile for public portfolio
 */
export const getPublic = async (req, res, next) => {
  try {
    const profile = await getPublicProfile();

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};
