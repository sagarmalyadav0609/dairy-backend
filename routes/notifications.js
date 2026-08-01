import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getNotifications);

router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

export default router;
