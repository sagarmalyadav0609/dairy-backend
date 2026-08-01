import mongoose from 'mongoose';

const purchaseHistorySchema = new mongoose.Schema({
  item: String,
  quantity: Number,
  totalCost: Number,
  date: {
    type: Date,
    default: Date.now,
  },
});

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add supplier company/name'],
      trim: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please add supplier phone number'],
    },
    email: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
    },
    materialsSupplied: {
      type: String, // Description of what they supply
      trim: true,
    },
    outstandingPayment: {
      type: Number,
      default: 0,
    },
    purchases: [purchaseHistorySchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Supplier', supplierSchema);
