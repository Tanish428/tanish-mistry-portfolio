import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema(
  {
    institution: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true,
      minlength: [2, 'Institution name must be at least 2 characters'],
      maxlength: [120, 'Institution name cannot exceed 120 characters'],
    },
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true,
      minlength: [2, 'Degree must be at least 2 characters'],
      maxlength: [100, 'Degree cannot exceed 100 characters'],
    },
    fieldOfStudy: {
      type: String,
      trim: true,
      maxlength: [100, 'Field of study cannot exceed 100 characters'],
      default: null,
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
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
    grade: {
      type: String,
      trim: true,
      maxlength: [50, 'Grade cannot exceed 50 characters'],
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: null,
    },
    achievements: {
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
educationSchema.index({
  isPublished: 1,
  isVisible: 1,
  displayOrder: 1,
  startDate: -1,
  createdAt: -1,
});
educationSchema.index({ displayOrder: 1, startDate: -1, createdAt: -1 });

const Education = mongoose.model('Education', educationSchema);

export default Education;
