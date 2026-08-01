import mongoose from 'mongoose';

const paymentHistorySchema = new mongoose.Schema({
  amount: Number,
  date: {
    type: Date,
    default: Date.now,
  },
  method: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque'],
    default: 'Cash',
  },
  notes: String,
});

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add customer name'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please add customer contact number'],
    },
    address: {
      type: String,
    },
    type: {
      type: String,
      enum: ['Milk Buyer', 'Animal Buyer', 'Both'],
      default: 'Milk Buyer',
    },
    outstandingBalance: {
      type: Number,
      default: 0,
    },
    payments: [paymentHistorySchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Customer', customerSchema);
