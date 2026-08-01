import express from 'express';
import {
  getSettings,
  updateSettings,
  backupDatabase,
  restoreDatabase,
} from '../controllers/settingsController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSettings)
  .put(upload.single('farmLogo'), updateSettings);

router.post('/backup', backupDatabase);
router.post('/restore', restoreDatabase);

export default router;
