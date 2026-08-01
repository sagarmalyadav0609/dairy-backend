import Treatment from '../models/Treatment.js';
import Vaccination from '../models/Vaccination.js';
import Animal from '../models/Animal.js';

// ==========================================
// VACCINATION MANAGEMENT
// ==========================================

export const getVaccinations = async (req, res) => {
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

    const vaccinations = await Vaccination.find(query)
      .populate('animal', 'animalId tagNumber name type')
      .sort({ nextDueDate: 1 });

    res.json({ success: true, count: vaccinations.length, data: vaccinations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createVaccination = async (req, res) => {
  try {
    const { animal, vaccineName, dateAdministered, nextDueDate, veterinarian, cost, status } = req.body;

    const animalExists = await Animal.findById(animal);
    if (!animalExists) {
      return res.status(404).json({ success: false, message: 'Animal not found' });
    }

    const vaccination = await Vaccination.create({
      animal,
      vaccineName,
      dateAdministered: dateAdministered || new Date(),
      nextDueDate,
      veterinarian,
      cost: Number(cost || 0),
      status: status || 'Administered',
    });

    // Automatically update the animal's vaccinationStatus status field
    animalExists.vaccinationStatus = 'Up to Date';
    await animalExists.save();

    res.status(201).json({ success: true, data: vaccination });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVaccination = async (req, res) => {
  try {
    const vaccination = await Vaccination.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!vaccination) return res.status(404).json({ success: false, message: 'Vaccination record not found' });
    res.json({ success: true, data: vaccination });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteVaccination = async (req, res) => {
  try {
    const vaccination = await Vaccination.findByIdAndDelete(req.params.id);
    if (!vaccination) return res.status(404).json({ success: false, message: 'Vaccination record not found' });
    res.json({ success: true, message: 'Vaccination record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// TREATMENT / MEDICAL RECORDS
// ==========================================

export const getTreatments = async (req, res) => {
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

    const treatments = await Treatment.find(query)
      .populate('animal', 'animalId tagNumber name type')
      .sort({ treatmentDate: -1 });

    res.json({ success: true, count: treatments.length, data: treatments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTreatment = async (req, res) => {
  try {
    const { animal, disease, symptoms, diagnosis, medicine, doctor, cost, treatmentDate, followUpDate, status } = req.body;

    const animalExists = await Animal.findById(animal);
    if (!animalExists) {
      return res.status(404).json({ success: false, message: 'Animal not found' });
    }

    const treatment = await Treatment.create({
      animal,
      disease,
      symptoms,
      diagnosis,
      medicine,
      doctor,
      cost: Number(cost || 0),
      treatmentDate: treatmentDate || new Date(),
      followUpDate,
      status: status || 'Active',
    });

    // Update animal healthStatus
    animalExists.healthStatus = status === 'Completed' ? 'Healthy' : 'Under Treatment';
    await animalExists.save();

    res.status(201).json({ success: true, data: treatment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTreatment = async (req, res) => {
  try {
    const treatment = await Treatment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    if (!treatment) return res.status(404).json({ success: false, message: 'Treatment record not found' });

    // Synchronize animal status
    const animal = await Animal.findById(treatment.animal);
    if (animal) {
      animal.healthStatus = treatment.status === 'Completed' ? 'Healthy' : 'Under Treatment';
      await animal.save();
    }

    res.json({ success: true, data: treatment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTreatment = async (req, res) => {
  try {
    const treatment = await Treatment.findByIdAndDelete(req.params.id);
    if (!treatment) return res.status(404).json({ success: false, message: 'Treatment record not found' });
    res.json({ success: true, message: 'Treatment record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
