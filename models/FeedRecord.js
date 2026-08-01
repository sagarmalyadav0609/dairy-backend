import mongoose from 'mongoose';

const feedRecordSchema = new mongoose.Schema(
  {
    animal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
      required: [true, 'Please associate an animal'],
    },
    feedName: {
      type: String, // Feed item name (or links to Inventory)
      required: [true, 'Please specify feed name'],
      trim: true,
    },
    quantity: {
      type: Number, // in kg
      required: [true, 'Please enter feed quantity (kg)'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    time: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening', 'Night'],
      default: 'Morning',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('FeedRecord', feedRecordSchema);
