import mongoose from 'mongoose';

export const PROJECT_CATEGORIES = [
  'web',
  'mobile',
  'desktop',
  'backend',
  'fullstack',
  'other',
];

/**
 * Generates a URL-friendly slug from title
 * @param {string} title
 * @returns {string}
 */
export const generateSlug = (title) => {
  if (!title || typeof title !== 'string') return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Project slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug must be URL-friendly (lowercase letters, numbers, and hyphens)',
      ],
      maxlength: [120, 'Slug cannot exceed 120 characters'],
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
      minlength: [10, 'Short description must be at least 10 characters'],
      maxlength: [300, 'Short description cannot exceed 300 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    technologies: {
      type: [String],
      required: [true, 'Technologies are required'],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 1 && arr.length <= 30,
        message: 'Project must contain between 1 and 30 technologies',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: PROJECT_CATEGORIES,
        message: 'Category must be one of: web, mobile, desktop, backend, fullstack, other',
      },
    },
    thumbnailUrl: {
      type: String,
      trim: true,
      default: null,
    },
    thumbnailAlt: {
      type: String,
      trim: true,
      maxlength: [200, 'Thumbnail alt cannot exceed 200 characters'],
      default: null,
    },
    liveDemoUrl: {
      type: String,
      trim: true,
      default: null,
    },
    repositoryUrl: {
      type: String,
      trim: true,
      default: null,
    },
    role: {
      type: String,
      trim: true,
      maxlength: [100, 'Role cannot exceed 100 characters'],
      default: null,
    },
    keyFeatures: {
      type: [String],
      default: [],
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: [0, 'Display order cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: false },
    toObject: { virtuals: false },
  }
);

// Compound & secondary indexes (slug unique index is declared on the field path)
projectSchema.index({
  isPublished: 1,
  isVisible: 1,
  isFeatured: -1,
  displayOrder: 1,
  createdAt: -1,
});
projectSchema.index({ isPublished: 1, isVisible: 1, category: 1 });
projectSchema.index({ displayOrder: 1, createdAt: -1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
