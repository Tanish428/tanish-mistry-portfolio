import { v2 as cloudinary } from 'cloudinary';
import config from './env.js';

if (config.isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
    secure: true,
  });
}

/**
 * Checks if Cloudinary credentials are configured
 */
export const isCloudinaryAvailable = () => config.isCloudinaryConfigured;

/**
 * Uploads a buffer directly to Cloudinary using upload_stream
 * @param {Buffer} buffer - File buffer from memory
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise<Object>}
 */
export const uploadStreamToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!config.isCloudinaryConfigured) {
      const error = new Error('Cloudinary service is not configured');
      error.statusCode = 503;
      return reject(error);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: config.cloudinaryFolder,
        overwrite: false,
        ...options,
      },
      (error, result) => {
        if (error) {
          const err = new Error(error.message || 'Failed to upload asset to Cloudinary');
          err.statusCode = 502;
          return reject(err);
        }
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Destroys a Cloudinary asset by its publicId
 * @param {string} publicId - Cloudinary publicId
 * @param {Object} options - Destruction options
 * @returns {Promise<Object>}
 */
export const destroyCloudinaryAsset = async (publicId, options = {}) => {
  if (!config.isCloudinaryConfigured) {
    const error = new Error('Cloudinary service is not configured');
    error.statusCode = 503;
    throw error;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      invalidate: true,
      ...options,
    });
    return result;
  } catch (error) {
    const err = new Error(error.message || 'Failed to delete asset from Cloudinary');
    err.statusCode = 502;
    throw err;
  }
};

export default cloudinary;
