import mongoose from 'mongoose';

const vaccinationSchema = new mongoose.Schema(
  {
    animal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
      required: [true, 'Please associate an animal'],
    },
    vaccineName: {
      type: String,
      required: [true, 'Please provide vaccine name'],
      trim: true,
    },
    dateAdministered: {
      type: Date,
      default: Date.now,
    },
    nextDueDate: {
      type: Date,
      required: [true, 'Please specify next due date'],
    },
    veterinarian: {
      type: String,
      trim: true,
    },
    cost: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Administered', 'Scheduled', 'Overdue'],
      default: 'Administered',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Vaccination', vaccinationSchema);
