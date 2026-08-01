import express from 'express';
import {
  getInventory,
  getInventoryById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockAlerts,
  getFeedingRecords,
  addFeedingRecord,
} from '../controllers/inventoryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Stock warning alerts
router.get('/alerts/low-stock', getLowStockAlerts);

// Animal Feeding Logs
router.route('/feeding')
  .get(getFeedingRecords)
  .post(addFeedingRecord);

// Inventory CRUD
router.route('/')
  .get(getInventory)
  .post(createInventoryItem);

router.route('/:id')
  .get(getInventoryById)
  .put(updateInventoryItem)
  .delete(deleteInventoryItem);

export default router;
