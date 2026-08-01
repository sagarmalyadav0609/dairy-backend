import express from 'express';
import {
  getAnimals,
  getAnimalById,
  getAnimalBySerialId,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  exportAnimalsExcel,
  exportAnimalCardPDF,
} from '../controllers/animalController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Apply auth protection to all animal routes
router.use(protect);

router.get('/export/excel', exportAnimalsExcel);
router.get('/:id/pdf', exportAnimalCardPDF);
router.get('/serial/:animalId', getAnimalBySerialId);

router.route('/')
  .get(getAnimals)
  .post(upload.single('image'), createAnimal);

router.route('/:id')
  .get(getAnimalById)
  .put(upload.single('image'), updateAnimal)
  .delete(deleteAnimal);

export default router;
