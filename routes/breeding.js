import express from 'express';
import {
  getPregnancies,
  createPregnancy,
  updatePregnancy,
  deletePregnancy,
} from '../controllers/breedingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPregnancies)
  .post(createPregnancy);

router.route('/:id')
  .put(updatePregnancy)
  .delete(deletePregnancy);

export default router;
