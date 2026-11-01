import crypto from 'node:crypto';
import Media from './media.model.js';
import Profile from '../profile/profile.model.js';
import Project from '../projects/project.model.js';
import config from '../../config/env.js';
import { uploadStreamToCloudinary, destroyCloudinaryAsset } from '../../config/cloudinary.js';

/**
 * Cloudinary operation adapter to facilitate mocking and test isolation
 */
export const cloudinaryAdapter = {
  uploadStream: uploadStreamToCloudinary,
  destroyAsset: destroyCloudinaryAsset,
};

/**
 * Formats a Media document into a consistent client response
 */
export const formatMedia = (doc) => ({
  id: doc._id,
  publicId: doc.publicId,
  secureUrl: doc.secureUrl,
  resourceType: doc.resourceType,
  format: doc.format,
  bytes: doc.bytes,
  width: doc.width,
  height: doc.height,
  folder: doc.folder,
  originalFilename: doc.originalFilename,
  altText: doc.altText,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

/**
 * Uploads an image to Cloudinary and persists its metadata in MongoDB
 */
export const uploadImage = async (file, body = {}) => {
  const randomSuffix = crypto.randomBytes(6).toString('hex');
  const generatedId = `img_${Date.now()}_${randomSuffix}`;

  const uploadResult = await cloudinaryAdapter.uploadStream(file.buffer, {
    public_id: generatedId,
    format: file.detectedFormat,
  });

  try {
    const media = await Media.create({
      publicId: uploadResult.public_id,
      secureUrl: uploadResult.secure_url,
      resourceType: 'image',
      format: uploadResult.format || file.detectedFormat,
      bytes: uploadResult.bytes || file.size,
      width: uploadResult.width || null,
      height: uploadResult.height || null,
      folder: config.cloudinaryFolder,
      originalFilename: file.originalname ? file.originalname.slice(0, 255) : null,
      altText: body.altText ? body.altText.trim() : null,
    });

    return formatMedia(media);
  } catch (dbErr) {
    try {
      await cloudinaryAdapter.destroyAsset(uploadResult.public_id);
    } catch (cleanupErr) {
      console.error('Failed to cleanup Cloudinary asset after MongoDB write failure:', cleanupErr.message);
    }
    throw dbErr;
  }
};

/**
 * Lists media records with pagination
 */
export const getMediaList = async (queryParams = {}) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [total, mediaRecords] = await Promise.all([
    Media.countDocuments(),
    Media.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    media: mediaRecords.map(formatMedia),
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Retrieves a single media record by ID
 */
export const getMediaById = async (id) => {
  const media = await Media.findById(id);
  if (!media) {
    const error = new Error('Media record not found');
    error.statusCode = 404;
    throw error;
  }
  return formatMedia(media);
};

/**
 * Safely deletes a media record and its corresponding Cloudinary asset
 */
export const deleteMedia = async (id) => {
  const media = await Media.findById(id);
  if (!media) {
    const error = new Error('Media record not found');
    error.statusCode = 404;
    throw error;
  }

  // 1. Reference check in Profile
  const profileRef = await Profile.findOne({
    $or: [
      { profileImageMediaId: id },
      { profileImageUrl: media.secureUrl },
    ],
  });

  if (profileRef) {
    const error = new Error('Cannot delete media asset because it is currently referenced by the profile');
    error.statusCode = 409;
    throw error;
  }

  // 2. Reference check in Project
  const projectRef = await Project.findOne({
    $or: [
      { thumbnailMediaId: id },
      { thumbnailUrl: media.secureUrl },
    ],
  });

  if (projectRef) {
    const error = new Error('Cannot delete media asset because it is currently referenced by a project');
    error.statusCode = 409;
    throw error;
  }

  // 3. Destroy Cloudinary asset
  const cloudResult = await cloudinaryAdapter.destroyAsset(media.publicId);
  // 'ok' or 'not found' (already removed from provider)
  if (cloudResult.result !== 'ok' && cloudResult.result !== 'not found') {
    const error = new Error('Failed to delete asset from Cloudinary');
    error.statusCode = 502;
    throw error;
  }

  // 4. Remove record from MongoDB with bounded retry for transient failures
  let deletedDoc = null;
  let dbDeleteError = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      deletedDoc = await Media.findByIdAndDelete(id);
      break;
    } catch (err) {
      dbDeleteError = err;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }
  }

  if (dbDeleteError) {
    console.error(`MongoDB deletion failed for media ID ${id} after Cloudinary asset destruction:`, dbDeleteError.message);
    throw dbDeleteError;
  }

  return true;
};
