import Pregnancy from '../models/Pregnancy.js';
import Animal from '../models/Animal.js';

// @desc    Get all breeding records
// @route   GET /api/breeding
// @access  Private
export const getPregnancies = async (req, res) => {
  try {
    const { status, animalId } = req.query;
    let query = {};

    if (status) query.status = status;

    if (animalId) {
      const animal = await Animal.findOne({ animalId: animalId });
      if (animal) {
        query.animal = animal._id;
      } else {
        return res.json({ success: true, data: [] });
      }
    }

    const pregnancies = await Pregnancy.find(query)
      .populate('animal', 'animalId tagNumber name breed type')
      .sort({ matingDate: -1 });

    res.json({ success: true, count: pregnancies.length, data: pregnancies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register a mating/breeding record
// @route   POST /api/breeding
// @access  Private
export const createPregnancy = async (req, res) => {
  try {
    const { animal, matingDate, matingType, bullDetails, notes } = req.body;

    const animalExists = await Animal.findById(animal);
    if (!animalExists) {
      return res.status(404).json({ success: false, message: 'Female animal not found' });
    }

    const pregnancy = await Pregnancy.create({
      animal,
      matingDate,
      matingType,
      bullDetails,
      notes,
      status: 'Pending Check',
    });

    res.status(201).json({ success: true, data: pregnancy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a pregnancy/breeding record
// @route   PUT /api/breeding/:id
// @access  Private
export const updatePregnancy = async (req, res) => {
  try {
    const { status, pregnancyCheckDate, actualDeliveryDate, calfDetails, notes } = req.body;

    const pregnancy = await Pregnancy.findById(req.params.id);
    if (!pregnancy) {
      return res.status(404).json({ success: false, message: 'Breeding record not found' });
    }

    if (status) pregnancy.status = status;
    if (pregnancyCheckDate) pregnancy.pregnancyCheckDate = pregnancyCheckDate;
    if (actualDeliveryDate) pregnancy.actualDeliveryDate = actualDeliveryDate;
    if (notes) pregnancy.notes = notes;
    if (calfDetails) pregnancy.calfDetails = calfDetails;

    await pregnancy.save();

    // Trigger state changes on the mother animal based on breeding status
    const mother = await Animal.findById(pregnancy.animal);
    if (mother) {
      if (status === 'Confirmed') {
        mother.pregnancyStatus = 'Pregnant';
      } else if (status === 'Not Confirmed' || status === 'Aborted') {
        mother.pregnancyStatus = 'Not Pregnant';
      } else if (status === 'Delivered') {
        mother.pregnancyStatus = 'Not Pregnant';
        mother.lactationStatus = 'Lactating'; // Usually starts milking after delivery
        
        // Auto-Generate a calf record!
        if (calfDetails && calfDetails.tagNumber) {
          const calfExists = await Animal.findOne({ tagNumber: calfDetails.tagNumber });
          if (!calfExists) {
            await Animal.create({
              tagNumber: calfDetails.tagNumber,
              type: 'Calf',
              breed: mother.breed,
              gender: calfDetails.gender || 'Female',
              color: mother.color,
              weight: calfDetails.weight || 40,
              dateOfBirth: actualDeliveryDate || new Date(),
              fatherName: pregnancy.bullDetails || 'Unknown',
              motherName: mother.name || mother.tagNumber,
              pregnancyStatus: 'Not Applicable',
              lactationStatus: 'Not Applicable',
              healthStatus: 'Healthy',
              notes: `Born out of pregnancy record. ${calfDetails.notes || ''}`,
            });
          }
        }
      }
      await mother.save();
    }

    res.json({ success: true, data: pregnancy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete breeding record
// @route   DELETE /api/breeding/:id
// @access  Private
export const deletePregnancy = async (req, res) => {
  try {
    const pregnancy = await Pregnancy.findByIdAndDelete(req.params.id);
    if (!pregnancy) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.json({ success: true, message: 'Breeding record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
