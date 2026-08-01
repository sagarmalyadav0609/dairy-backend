import Inventory from '../models/Inventory.js';
import Notification from '../models/Notification.js';
import FeedRecord from '../models/FeedRecord.js';
import Animal from '../models/Animal.js';

// ==========================================
// INVENTORY CRUD
// ==========================================

export const getInventory = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const items = await Inventory.find(query).sort({ name: 1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInventoryById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.create(req.body);

    // Trigger stock checks
    if (item.quantity <= item.minStockLevel) {
      await Notification.create({
        title: 'Low Stock Alert',
        message: `${item.name} (${item.category}) is low in stock. Current quantity: ${item.quantity} ${item.unit}`,
        type: 'Warning',
        category: 'Stock',
      });
    }

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    if (item.quantity <= item.minStockLevel) {
      const exists = await Notification.findOne({
        title: 'Low Stock Alert',
        message: { $regex: item.name, $options: 'i' },
        read: false,
      });

      if (!exists) {
        await Notification.create({
          title: 'Low Stock Alert',
          message: `${item.name} (${item.category}) is low in stock. Current quantity: ${item.quantity} ${item.unit}`,
          type: 'Warning',
          category: 'Stock',
        });
      }
    }

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item removed from inventory' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLowStockAlerts = async (req, res) => {
  try {
    const alerts = await Inventory.find({
      $expr: { $lte: ['$quantity', '$minStockLevel'] },
    });
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// ANIMAL FEEDING LOGS
// ==========================================

export const getFeedingRecords = async (req, res) => {
  try {
    const { animalId } = req.query;
    let query = {};

    if (animalId) {
      const animal = await Animal.findOne({ animalId: animalId });
      if (animal) {
        query.animal = animal._id;
      } else {
        return res.json({ success: true, data: [] });
      }
    }

    const records = await FeedRecord.find(query)
      .populate('animal', 'animalId tagNumber name type')
      .sort({ date: -1 });

    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addFeedingRecord = async (req, res) => {
  try {
    const { animal, feedName, quantity, date, time } = req.body;

    const animalExists = await Animal.findById(animal);
    if (!animalExists) {
      return res.status(404).json({ success: false, message: 'Animal not found' });
    }

    // Deduct from Inventory Feed stock automatically if exact name match
    const feedItem = await Inventory.findOne({ name: feedName, category: 'Feed' });
    if (feedItem) {
      feedItem.quantity = Math.max(0, feedItem.quantity - Number(quantity));
      await feedItem.save();

      // Low stock notification trigger
      if (feedItem.quantity <= feedItem.minStockLevel) {
        const notifExists = await Notification.findOne({
          title: 'Low Feed Stock Alert',
          message: { $regex: feedItem.name, $options: 'i' },
          read: false,
        });

        if (!notifExists) {
          await Notification.create({
            title: 'Low Feed Stock Alert',
            message: `${feedItem.name} feed level is extremely low (${feedItem.quantity} ${feedItem.unit} remaining).`,
            type: 'Warning',
            category: 'Stock',
          });
        }
      }
    }

    const record = await FeedRecord.create({
      animal,
      feedName,
      quantity: Number(quantity),
      date: date || new Date(),
      time: time || 'Morning',
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
