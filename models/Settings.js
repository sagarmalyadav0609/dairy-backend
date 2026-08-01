import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    farmName: {
      type: String,
      default: 'Green Valley Dairy Farm',
    },
    farmLogo: {
      type: String,
    },
    address: {
      type: String,
      default: '123 Meadow Road, Dairy Town',
    },
    gstNumber: {
      type: String,
      default: '29ABCDE1234F1Z5',
    },
    phone: {
      type: String,
      default: '+1 (555) 019-2834',
    },
    email: {
      type: String,
      default: 'contact@greenvalley.com',
    },
    language: {
      type: String,
      default: 'English',
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Settings', settingsSchema);
