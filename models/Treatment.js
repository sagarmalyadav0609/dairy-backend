import mongoose from 'mongoose';

const treatmentSchema = new mongoose.Schema(
  {
    animal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
      required: [true, 'Please associate an animal'],
    },
    disease: {
      type: String,
      required: [true, 'Please state the disease/condition'],
      trim: true,
    },
    symptoms: {
      type: String,
      trim: true,
    },
    diagnosis: {
      type: String,
      trim: true,
    },
    medicine: {
      type: String, // Medicines prescribed/administered
      trim: true,
    },
    doctor: {
      type: String, // Doctor's name
      trim: true,
    },
    cost: {
      type: Number,
      default: 0,
    },
    treatmentDate: {
      type: Date,
      default: Date.now,
    },
    followUpDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Under Observation'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Treatment', treatmentSchema);
