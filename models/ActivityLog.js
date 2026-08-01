import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: String, // email/name of the user who triggered the action
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    action: {
      type: String, // 'CREATE_ANIMAL', 'UPDATE_MILK', etc.
      required: true,
    },
    details: {
      type: String, // human-readable description
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('ActivityLog', activityLogSchema);
