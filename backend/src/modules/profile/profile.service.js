import Profile from './profile.model.js';

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
    'profileImageAlt',
    'availabilityStatus',
    'isVisible',
  ];

  for (const field of allowedFields) {
    if (field in updateData) {
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
  profileImageAlt: profile.profileImageAlt,
  availabilityStatus: profile.availabilityStatus,
  isVisible: profile.isVisible,
  isPublished: profile.isPublished,
  createdAt: profile.createdAt,
  updatedAt: profile.updatedAt,
});
