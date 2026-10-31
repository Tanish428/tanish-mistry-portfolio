import mongoose from 'mongoose';

/**
 * Generates a URL-friendly slug from string
 * @param {string} text
 * @returns {string}
 */
export const generateSlug = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const skillCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters'],
      maxlength: [60, 'Category name cannot exceed 60 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug must be URL-friendly (lowercase letters, numbers, and hyphens)',
      ],
      maxlength: [80, 'Category slug cannot exceed 80 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
      default: null,
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: [0, 'Display order cannot be negative'],
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
    toJSON: { virtuals: false },
    toObject: { virtuals: false },
  }
);

// Compound & secondary indexes (slug unique index is declared on field path)
skillCategorySchema.index({
  isPublished: 1,
  isVisible: 1,
  displayOrder: 1,
  createdAt: -1,
});
skillCategorySchema.index({ displayOrder: 1, createdAt: -1 });

const SkillCategory = mongoose.model('SkillCategory', skillCategorySchema);

export default SkillCategory;
