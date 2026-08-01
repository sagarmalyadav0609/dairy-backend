import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Info', 'Warning', 'Alert', 'Success'],
      default: 'Info',
    },
    category: {
      type: String,
      enum: ['Vaccination', 'Pregnancy', 'Medicine', 'Stock', 'Salary', 'General'],
      default: 'General',
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String, // Path to route (e.g. /animals/DF-001)
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Notification', notificationSchema);
