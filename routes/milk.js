import express from 'express';
import {
  addMilkRecord,
  getMilkRecords,
  getMilkReports,
} from '../controllers/milkController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(addMilkRecord)
  .get(getMilkRecords);

router.get('/reports', getMilkReports);

export default router;
