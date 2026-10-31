import mongoose from 'mongoose';

const AVAILABILITY_STATUSES = [
  'open_to_opportunities',
  'not_available',
  'open_to_internships',
  'open_to_full_time',
];

const profileSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      default: 'primary',
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    professionalTitle: {
      type: String,
      required: [true, 'Professional title is required'],
      trim: true,
      minlength: [2, 'Professional title must be at least 2 characters'],
      maxlength: [150, 'Professional title cannot exceed 150 characters'],
    },
    shortIntroduction: {
      type: String,
      required: [true, 'Short introduction is required'],
      trim: true,
      minlength: [10, 'Short introduction must be at least 10 characters'],
      maxlength: [300, 'Short introduction cannot exceed 300 characters'],
    },
    about: {
      type: String,
      required: [true, 'About description is required'],
      trim: true,
      minlength: [10, 'About description must be at least 10 characters'],
      maxlength: [5000, 'About description cannot exceed 5000 characters'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
      default: null,
    },
    publicEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    profileImageUrl: {
      type: String,
      trim: true,
      default: null,
    },
    profileImageMediaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media',
      default: null,
    },
    profileImageAlt: {
      type: String,
      trim: true,
      maxlength: [150, 'Image alt text cannot exceed 150 characters'],
      default: null,
    },
    availabilityStatus: {
      type: String,
      enum: {
        values: [...AVAILABILITY_STATUSES, null],
        message: 'Invalid availability status',
      },
      default: null,
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

const Profile = mongoose.model('Profile', profileSchema);

export { AVAILABILITY_STATUSES };
export default Profile;
