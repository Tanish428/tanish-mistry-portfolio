import mongoose from 'mongoose';

export const PROFICIENCY_LEVELS = [
  'beginner',
  'intermediate',
  'advanced',
  'expert',
];

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      minlength: [1, 'Skill name must be at least 1 character'],
      maxlength: [60, 'Skill name cannot exceed 60 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Skill slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug must be URL-friendly (lowercase letters, numbers, and hyphens)',
      ],
      maxlength: [80, 'Skill slug cannot exceed 80 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillCategory',
      required: [true, 'Category reference is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: null,
    },
    proficiencyLevel: {
      type: String,
      required: [true, 'Proficiency level is required'],
      enum: {
        values: PROFICIENCY_LEVELS,
        message: 'Proficiency level must be one of: beginner, intermediate, advanced, expert',
      },
    },
    iconName: {
      type: String,
      trim: true,
      maxlength: [100, 'iconName cannot exceed 100 characters'],
      match: [
        /^[a-zA-Z0-9_-]+$/,
        'iconName must be a valid alphanumeric identifier with hyphens or underscores',
      ],
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

// Compound & secondary indexes (slug unique index is declared on field path)
skillSchema.index({ category: 1 });
skillSchema.index({
  isPublished: 1,
  isVisible: 1,
  category: 1,
  isFeatured: -1,
  displayOrder: 1,
  createdAt: -1,
});
skillSchema.index({ category: 1, displayOrder: 1, createdAt: -1 });

const Skill = mongoose.model('Skill', skillSchema);

export default Skill;
