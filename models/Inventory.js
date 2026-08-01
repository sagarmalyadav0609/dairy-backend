import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add inventory item name'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Feed', 'Medicine', 'Equipment', 'Machinery', 'Tools'],
      required: [true, 'Please select category'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify quantity in stock'],
      default: 0,
    },
    unit: {
      type: String, // kg, Liters, Bags, Units
      required: [true, 'Please add stock unit (e.g. kg, Bags)'],
      default: 'Units',
    },
    supplier: {
      type: String,
      trim: true,
    },
    cost: {
      type: Number,
      default: 0,
    },
    minStockLevel: {
      type: Number,
      required: [true, 'Please specify minimum stock level for alert'],
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Inventory', inventorySchema);
