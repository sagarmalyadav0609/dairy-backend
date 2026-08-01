import mongoose from 'mongoose';

const pregnancySchema = new mongoose.Schema(
  {
    animal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
      required: [true, 'Please associate a female animal'],
    },
    matingDate: {
      type: Date,
      required: [true, 'Please provide the mating date'],
    },
    matingType: {
      type: String,
      enum: ['Artificial Insemination', 'Natural Mating'],
      required: true,
    },
    bullDetails: {
      type: String, // Breed details / Bull ID / Tag Number
      trim: true,
    },
    pregnancyCheckDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Not Confirmed', 'Doubtful', 'Delivered', 'Aborted', 'Pending Check'],
      default: 'Pending Check',
    },
    expectedDeliveryDate: {
      type: Date,
    },
    actualDeliveryDate: {
      type: Date,
    },
    calfDetails: {
      tagNumber: String,
      gender: {
        type: String,
        enum: ['Male', 'Female'],
      },
      weight: Number,
      notes: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save check: auto-calculate expected delivery date (gestation period for cows is ~283 days, buffalo is ~310 days)
pregnancySchema.pre('save', function (next) {
  if (this.matingDate && !this.expectedDeliveryDate) {
    // We'll estimate standard gestation period of ~283 days for safety
    const gestation = 283 * 24 * 60 * 60 * 1000;
    this.expectedDeliveryDate = new Date(this.matingDate.getTime() + gestation);
  }
  next();
});

export default mongoose.model('Pregnancy', pregnancySchema);
