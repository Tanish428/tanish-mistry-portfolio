import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: [true, 'publicId is required'],
      unique: true,
      trim: true,
    },
    secureUrl: {
      type: String,
      required: [true, 'secureUrl is required'],
      trim: true,
    },
    resourceType: {
      type: String,
      required: true,
      enum: {
        values: ['image'],
        message: 'Only image resource types are supported in this phase',
      },
      default: 'image',
    },
    format: {
      type: String,
      required: [true, 'format is required'],
      trim: true,
      lowercase: true,
    },
    bytes: {
      type: Number,
      required: [true, 'bytes is required'],
      min: [1, 'bytes must be greater than zero'],
    },
    width: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
    folder: {
      type: String,
      required: true,
      trim: true,
      default: 'portfolio',
    },
    originalFilename: {
      type: String,
      trim: true,
      maxlength: [255, 'originalFilename cannot exceed 255 characters'],
      default: null,
    },
    altText: {
      type: String,
      trim: true,
      maxlength: [200, 'altText cannot exceed 200 characters'],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
mediaSchema.index({ createdAt: -1 });

const Media = mongoose.model('Media', mediaSchema);

export default Media;
