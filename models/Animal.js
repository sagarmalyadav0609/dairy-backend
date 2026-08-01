import mongoose from 'mongoose';

const animalSchema = new mongoose.Schema(
  {
    animalId: {
      type: String,
      unique: true,
      index: true,
    },
    rfidNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    tagNumber: {
      type: String,
      required: [true, 'Please add a Tag Number'],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Buffalo', 'Cow', 'Goat', 'Calf', 'Bull', 'Ox', 'Sheep', 'Camel', 'Horse', 'Others'],
      required: [true, 'Please specify animal type'],
    },
    breed: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Female', 'Male'],
      required: [true, 'Please specify gender'],
    },
    color: {
      type: String,
      trim: true,
    },
    weight: {
      type: Number, // in kg
    },
    height: {
      type: Number, // in cm
    },
    dateOfBirth: {
      type: Date,
    },
    purchaseDate: {
      type: Date,
    },
    purchasePrice: {
      type: Number,
    },
    currentValue: {
      type: Number,
    },
    fatherName: {
      type: String,
      trim: true,
    },
    motherName: {
      type: String,
      trim: true,
    },
    pregnancyStatus: {
      type: String,
      enum: ['Pregnant', 'Not Pregnant', 'Not Applicable'],
      default: 'Not Pregnant',
    },
    lactationStatus: {
      type: String,
      enum: ['Lactating', 'Dry', 'Not Applicable'],
      default: 'Dry',
    },
    healthStatus: {
      type: String,
      enum: ['Healthy', 'Sick', 'Under Treatment', 'Quarantined'],
      default: 'Healthy',
    },
    vaccinationStatus: {
      type: String,
      enum: ['Up to Date', 'Pending', 'Overdue'],
      default: 'Pending',
    },
    dewormingStatus: {
      type: String,
      trim: true,
    },
    insurance: {
      type: String, // Policy number or 'None'
      default: 'None',
    },
    image: {
      type: String,
    },
    documents: [
      {
        name: String,
        url: String,
      },
    ],
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate incremental animalId (e.g. DF-0001) if not set
animalSchema.pre('save', async function (next) {
  if (!this.animalId) {
    const lastAnimal = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });
    let nextId = 1;
    if (lastAnimal && lastAnimal.animalId) {
      const match = lastAnimal.animalId.match(/DF-(\d+)/);
      if (match) {
        nextId = parseInt(match[1], 10) + 1;
      }
    }
    this.animalId = `DF-${String(nextId).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model('Animal', animalSchema);
