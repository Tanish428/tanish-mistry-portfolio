import Profile from './profile.model.js';
import Media from '../media/media.model.js';

/**
 * Creates the initial profile in draft state
 */
export const createProfile = async (profileData) => {
  const existing = await Profile.findOne({ singletonKey: 'primary' });
  if (existing) {
    const error = new Error('A profile has already been created. Please update the existing profile.');
    error.statusCode = 409;
    throw error;
  }

  if (profileData.profileImageMediaId) {
    const media = await Media.findById(profileData.profileImageMediaId);
    if (!media || media.resourceType !== 'image') {
      const error = new Error('Referenced media record not found or is not an image');
      error.statusCode = 400;
      throw error;
    }
    profileData.profileImageUrl = media.secureUrl;
  }

  try {
    const profile = await Profile.create({
      ...profileData,
      singletonKey: 'primary',
      isPublished: false,
      isVisible: profileData.isVisible !== undefined ? profileData.isVisible : true,
    });

    return formatAdminProfile(profile);
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error('A profile already exists.');
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};

/**
 * Retrieves the profile for administrator dashboard
 */
export const getAdminProfile = async () => {
  const profile = await Profile.findOne({ singletonKey: 'primary' });

  if (!profile) {
    const error = new Error('Profile not found');
    error.statusCode = 404;
    throw error;
  }

  return formatAdminProfile(profile);
};

/**
 * Retrieves published and visible profile for public portfolio
 */
export const getPublicProfile = async () => {
  const profile = await Profile.findOne({
    singletonKey: 'primary',
    isPublished: true,
    isVisible: true,
  });

  if (!profile) {
    const error = new Error('Profile not found or currently unavailable');
    error.statusCode = 404;
    throw error;
  }

  return {
    fullName: profile.fullName,
    professionalTitle: profile.professionalTitle,
    shortIntroduction: profile.shortIntroduction,
    about: profile.about,
    location: profile.location,
    publicEmail: profile.publicEmail,
    profileImageUrl: profile.profileImageUrl,
    profileImageAlt: profile.profileImageAlt,
    availabilityStatus: profile.availabilityStatus,
  };
};

/**
 * Partially updates allowed profile fields
 */
export const updateProfile = async (updateData) => {
  const profile = await Profile.findOne({ singletonKey: 'primary' });

  if (!profile) {
    const error = new Error('Profile not found');
    error.statusCode = 404;
    throw error;
  }

  const allowedFields = [
    'fullName',
    'professionalTitle',
    'shortIntroduction',
    'about',
    'location',
    'publicEmail',
    'profileImageUrl',
    'profileImageMediaId',
    'profileImageAlt',
    'availabilityStatus',
    'isVisible',
  ];

  if (updateData.profileImageMediaId !== undefined) {
    if (updateData.profileImageMediaId === null || updateData.profileImageMediaId === '') {
      profile.profileImageMediaId = null;
    } else {
      const media = await Media.findById(updateData.profileImageMediaId);
      if (!media || media.resourceType !== 'image') {
        const error = new Error('Referenced media record not found or is not an image');
        error.statusCode = 400;
        throw error;
      }
      profile.profileImageMediaId = media._id;
      profile.profileImageUrl = media.secureUrl;
    }
  }

  for (const field of allowedFields) {
    if (field !== 'profileImageMediaId' && field in updateData) {
      profile[field] = updateData[field];
    }
  }

  await profile.save();
  return formatAdminProfile(profile);
};

/**
 * Publishes the profile
 */
export const publishProfile = async () => {
  const profile = await Profile.findOne({ singletonKey: 'primary' });

  if (!profile) {
    const error = new Error('Profile not found');
    error.statusCode = 404;
    throw error;
  }

  // Verify mandatory fields are present before publishing
  if (!profile.fullName || !profile.professionalTitle || !profile.shortIntroduction || !profile.about) {
    const error = new Error('Profile must have complete mandatory content before publishing');
    error.statusCode = 400;
    throw error;
  }

  profile.isPublished = true;
  await profile.save();

  return formatAdminProfile(profile);
};

/**
 * Unpublishes the profile
 */
export const unpublishProfile = async () => {
  const profile = await Profile.findOne({ singletonKey: 'primary' });

  if (!profile) {
    const error = new Error('Profile not found');
    error.statusCode = 404;
    throw error;
  }

  profile.isPublished = false;
  await profile.save();

  return formatAdminProfile(profile);
};

/**
 * Formats full profile for administrator response
 */
const formatAdminProfile = (profile) => ({
  id: profile._id,
  fullName: profile.fullName,
  professionalTitle: profile.professionalTitle,
  shortIntroduction: profile.shortIntroduction,
  about: profile.about,
  location: profile.location,
  publicEmail: profile.publicEmail,
  profileImageUrl: profile.profileImageUrl,
  profileImageMediaId: profile.profileImageMediaId || null,
  profileImageAlt: profile.profileImageAlt,
  availabilityStatus: profile.availabilityStatus,
  isVisible: profile.isVisible,
  isPublished: profile.isPublished,
  createdAt: profile.createdAt,
  updatedAt: profile.updatedAt,
});
