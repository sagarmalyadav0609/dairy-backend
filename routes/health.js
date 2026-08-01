import express from 'express';
import {
  getVaccinations,
  createVaccination,
  updateVaccination,
  deleteVaccination,
  getTreatments,
  createTreatment,
  updateTreatment,
  deleteTreatment,
} from '../controllers/healthController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Vaccinations
router.route('/vaccinations')
  .get(getVaccinations)
  .post(createVaccination);
router.route('/vaccinations/:id')
  .put(updateVaccination)
  .delete(deleteVaccination);

// Treatments
router.route('/treatments')
  .get(getTreatments)
  .post(createTreatment);
router.route('/treatments/:id')
  .put(updateTreatment)
  .delete(deleteTreatment);

export default router;
