import mongoose from 'mongoose';

export const SECTION_TYPES = Object.freeze([
  'hero',
  'about',
  'projects',
  'skills',
  'experience',
  'education',
  'social_links',
  'contact',
]);

const homepageSectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Section type is required'],
      enum: {
        values: SECTION_TYPES,
        message: 'Invalid section type. Must be one of the supported allowlisted types.',
      },
      unique: true,
      trim: true,
      immutable: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      default: null,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [300, 'Subtitle cannot exceed 300 characters'],
      default: null,
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    displayOrder: {
      type: Number,
      required: [true, 'Display order is required'],
      min: [0, 'Display order cannot be negative'],
      default: 0,
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

homepageSectionSchema.index({ isPublished: 1, isVisible: 1, displayOrder: 1, createdAt: 1 });

const HomepageSection = mongoose.model('HomepageSection', homepageSectionSchema);

export default HomepageSection;
