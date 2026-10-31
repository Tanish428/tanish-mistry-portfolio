import mongoose from 'mongoose';

const socialLinkSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[a-z0-9-]+$/, 'Platform identifier must only contain lowercase alphanumeric characters and hyphens'],
      maxlength: [50, 'Platform identifier cannot exceed 50 characters'],
    },
    label: {
      type: String,
      required: [true, 'Display label is required'],
      trim: true,
      minlength: [1, 'Display label cannot be empty'],
      maxlength: [60, 'Display label cannot exceed 60 characters'],
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
      validate: {
        validator: function (v) {
          try {
            const parsed = new URL(v);
            return parsed.protocol === 'https:';
          } catch {
            return false;
          }
        },
        message: 'URL must be a valid HTTPS URL',
      },
    },
    iconName: {
      type: String,
      trim: true,
      default: null,
      validate: {
        validator: function (v) {
          if (v === null || v === undefined || v === '') return true;
          return /^[a-zA-Z0-9_-]{1,50}$/.test(v);
        },
        message: 'iconName must be a safe alphanumeric identifier containing only letters, numbers, underscores, or hyphens',
      },
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: [0, 'displayOrder must be a non-negative integer'],
      validate: {
        validator: Number.isInteger,
        message: 'displayOrder must be an integer',
      },
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Query indexes
socialLinkSchema.index({ isPublished: 1, isVisible: 1, displayOrder: 1, createdAt: -1 });
socialLinkSchema.index({ displayOrder: 1, createdAt: -1 });

const SocialLink = mongoose.model('SocialLink', socialLinkSchema);

export default SocialLink;
