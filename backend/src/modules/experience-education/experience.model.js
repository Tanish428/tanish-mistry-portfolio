import mongoose from 'mongoose';

export const EMPLOYMENT_TYPES = [
  'internship',
  'full_time',
  'part_time',
  'contract',
  'freelance',
  'other',
];

export const WORK_MODES = ['onsite', 'remote', 'hybrid'];

const experienceSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      minlength: [2, 'Company name must be at least 2 characters'],
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
      minlength: [2, 'Position must be at least 2 characters'],
      maxlength: [100, 'Position cannot exceed 100 characters'],
    },
    employmentType: {
      type: String,
      required: [true, 'Employment type is required'],
      enum: {
        values: EMPLOYMENT_TYPES,
        message: `Employment type must be one of: ${EMPLOYMENT_TYPES.join(', ')}`,
      },
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
      default: null,
    },
    workMode: {
      type: String,
      enum: {
        values: WORK_MODES,
        message: `Work mode must be one of: ${WORK_MODES.join(', ')}`,
      },
      default: null,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      default: null,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: null,
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    achievements: {
      type: [String],
      default: [],
    },
    technologies: {
      type: [String],
      default: [],
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

// Compound indexes for public and administrator sorting
experienceSchema.index({
  isPublished: 1,
  isVisible: 1,
  displayOrder: 1,
  startDate: -1,
  createdAt: -1,
});
experienceSchema.index({ displayOrder: 1, startDate: -1, createdAt: -1 });

const Experience = mongoose.model('Experience', experienceSchema);

export default Experience;
