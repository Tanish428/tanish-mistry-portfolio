import mongoose from 'mongoose';

const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [emailRegex, 'Please provide a valid email address'],
      maxlength: [254, 'Email cannot exceed 254 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      minlength: [2, 'Subject must be at least 2 characters long'],
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters long'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['new', 'read', 'archived'],
        message: 'Status must be one of: new, read, archived',
      },
      default: 'new',
    },
  },
  {
    timestamps: true,
  }
);

// Query indexes for inbox management
contactMessageSchema.index({ status: 1, createdAt: -1 });
contactMessageSchema.index({ createdAt: -1 });

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

export default ContactMessage;
