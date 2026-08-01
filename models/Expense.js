import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: [
        'Feed',
        'Medicine',
        'Salary',
        'Electricity',
        'Water',
        'Equipment',
        'Fuel',
        'Maintenance',
        'Miscellaneous',
      ],
      required: [true, 'Please select a category'],
    },
    amount: {
      type: Number,
      required: [true, 'Please enter an expense amount'],
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
    document: {
      type: String,
    },
    loggedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Expense', expenseSchema);
