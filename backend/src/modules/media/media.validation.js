import multer from 'multer';
import mongoose from 'mongoose';

// 5 MB maximum file size limit
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const err = new Error('Unsupported media type. Only JPEG, PNG, and WebP are allowed.');
      err.statusCode = 415;
      cb(err, false);
    }
  },
}).single('image');

/**
 * Express middleware wrapping Multer to catch upload errors cleanly
 */
export const handleImageUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            success: false,
            message: 'File size exceeds maximum allowed limit of 5 MB',
            data: null,
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
          data: null,
        });
      }
      return res.status(err.statusCode || 400).json({
        success: false,
        message: err.message,
        data: null,
      });
    }
    next();
  });
};

/**
 * Checks file signature (magic bytes) to verify actual file content
 */
const detectImageFormat = (buffer) => {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png';
  }

  // WebP: RIFF ... WEBP
  const isRiff =
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46;
  const isWebp =
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50;

  if (isRiff && isWebp) {
    return 'webp';
  }

  return null;
};

/**
 * Deep inspection of uploaded file signature and metadata
 */
export const validateImageFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "An image file is required under field 'image'",
      data: null,
    });
  }

  if (!req.file.buffer || req.file.buffer.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Uploaded file cannot be empty',
      data: null,
    });
  }

  const detectedFormat = detectImageFormat(req.file.buffer);
  if (!detectedFormat) {
    return res.status(415).json({
      success: false,
      message: 'File content does not match allowed image signatures (JPEG, PNG, WebP)',
      data: null,
    });
  }

  req.file.detectedFormat = detectedFormat;

  if (req.body.altText !== undefined && req.body.altText !== null) {
    if (typeof req.body.altText !== 'string' || req.body.altText.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: 'altText must be a string not exceeding 200 characters',
        data: null,
      });
    }
  }

  next();
};

/**
 * Validates MongoDB ObjectId in route parameters
 */
export const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid media ID format',
      data: null,
    });
  }
  next();
};

/**
 * Validates pagination query parameters for media listing
 */
export const validateMediaPaginationQuery = (req, res, next) => {
  const { page, limit } = req.query;

  if (page !== undefined) {
    const parsed = parseInt(page, 10);
    if (isNaN(parsed) || parsed < 1) {
      return res.status(400).json({
        success: false,
        message: 'page must be a positive integer',
        data: null,
      });
    }
  }

  if (limit !== undefined) {
    const parsed = parseInt(limit, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 50) {
      return res.status(400).json({
        success: false,
        message: 'limit must be an integer between 1 and 50',
        data: null,
      });
    }
  }

  next();
};
