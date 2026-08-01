import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ['Milk Sale', 'Animal Sale', 'Manure Sale', 'Breeding Service', 'Other Income'],
      required: [true, 'Please select an income source'],
    },
    amount: {
      type: Number,
      required: [true, 'Please enter an income amount'],
    },
    customer: {
      type: String, // Customer name or link
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
    loggedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Income', incomeSchema);
