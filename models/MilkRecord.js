import mongoose from 'mongoose';

const milkRecordSchema = new mongoose.Schema(
  {
    animal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
      required: [true, 'Please associate an animal'],
    },
    morningMilk: {
      type: Number,
      default: 0,
    },
    eveningMilk: {
      type: Number,
      default: 0,
    },
    totalMilk: {
      type: Number,
      default: 0,
    },
    fat: {
      type: Number, // Fat %
      default: 0,
    },
    snf: {
      type: Number, // Solid-Not-Fat %
      default: 0,
    },
    quality: {
      type: String,
      enum: ['Excellent', 'Good', 'Average', 'Poor'],
      default: 'Good',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    employee: {
      type: String, // Name or ID of recording staff
      required: [true, 'Please record the logging employee name/ID'],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate totalMilk
milkRecordSchema.pre('save', function (next) {
  this.totalMilk = this.morningMilk + this.eveningMilk;
  next();
});

export default mongoose.model('MilkRecord', milkRecordSchema);
