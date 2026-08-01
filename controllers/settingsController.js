import Settings from '../models/Settings.js';
import User from '../models/User.js';
import Animal from '../models/Animal.js';
import MilkRecord from '../models/MilkRecord.js';
import Employee from '../models/Employee.js';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Customer from '../models/Customer.js';
import Supplier from '../models/Supplier.js';
import Inventory from '../models/Inventory.js';
import Vaccination from '../models/Vaccination.js';
import Treatment from '../models/Treatment.js';
import Pregnancy from '../models/Pregnancy.js';
import FeedRecord from '../models/FeedRecord.js';
import Notification from '../models/Notification.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get farm settings
// @route   GET /api/settings
// @access  Private
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update farm settings
// @route   PUT /api/settings
// @access  Private
export const updateSettings = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.farmLogo = `/uploads/${req.file.filename}`;
    }

    let settings = await Settings.findOne({});
    if (settings) {
      settings = await Settings.findByIdAndUpdate(settings._id, updateData, {
        new: true,
        runValidators: true,
      });
    } else {
      settings = await Settings.create(updateData);
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Backup entire database
// @route   POST /api/settings/backup
// @access  Private
export const backupDatabase = async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Gather all tables
    const dump = {
      users: await User.find({}),
      animals: await Animal.find({}),
      milkRecords: await MilkRecord.find({}),
      employees: await Employee.find({}),
      expenses: await Expense.find({}),
      income: await Income.find({}),
      customers: await Customer.find({}),
      suppliers: await Supplier.find({}),
      inventory: await Inventory.find({}),
      vaccinations: await Vaccination.find({}),
      treatments: await Treatment.find({}),
      pregnancies: await Pregnancy.find({}),
      feedRecords: await FeedRecord.find({}),
      notifications: await Notification.find({}),
      settings: await Settings.find({}),
    };

    const filePath = path.join(backupDir, `db_backup_${Date.now()}.json`);
    fs.writeFileSync(filePath, JSON.stringify(dump, null, 2), 'utf-8');

    res.json({
      success: true,
      message: 'Database backup created successfully',
      filename: path.basename(filePath),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Restore database from backup
// @route   POST /api/settings/restore
// @access  Private
export const restoreDatabase = async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      return res.status(404).json({ success: false, message: 'No backups found' });
    }

    const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));
    if (files.length === 0) {
      return res.status(404).json({ success: false, message: 'No backup files found' });
    }

    // Load the latest backup file
    files.sort((a, b) => {
      return fs.statSync(path.join(backupDir, b)).mtime - fs.statSync(path.join(backupDir, a)).mtime;
    });

    const fileToRestore = files[0];
    const data = JSON.parse(fs.readFileSync(path.join(backupDir, fileToRestore), 'utf-8'));

    // Clear and restore
    if (data.users) { await User.deleteMany(); await User.insertMany(data.users); }
    if (data.animals) { await Animal.deleteMany(); await Animal.insertMany(data.animals); }
    if (data.milkRecords) { await MilkRecord.deleteMany(); await MilkRecord.insertMany(data.milkRecords); }
    if (data.employees) { await Employee.deleteMany(); await Employee.insertMany(data.employees); }
    if (data.expenses) { await Expense.deleteMany(); await Expense.insertMany(data.expenses); }
    if (data.income) { await Income.deleteMany(); await Income.insertMany(data.income); }
    if (data.customers) { await Customer.deleteMany(); await Customer.insertMany(data.customers); }
    if (data.suppliers) { await Supplier.deleteMany(); await Supplier.insertMany(data.suppliers); }
    if (data.inventory) { await Inventory.deleteMany(); await Inventory.insertMany(data.inventory); }
    if (data.vaccinations) { await Vaccination.deleteMany(); await Vaccination.insertMany(data.vaccinations); }
    if (data.treatments) { await Treatment.deleteMany(); await Treatment.insertMany(data.treatments); }
    if (data.pregnancies) { await Pregnancy.deleteMany(); await Pregnancy.insertMany(data.pregnancies); }
    if (data.feedRecords) { await FeedRecord.deleteMany(); await FeedRecord.insertMany(data.feedRecords); }
    if (data.notifications) { await Notification.deleteMany(); await Notification.insertMany(data.notifications); }
    if (data.settings) { await Settings.deleteMany(); await Settings.insertMany(data.settings); }

    res.json({
      success: true,
      message: `Database restored successfully from file: ${fileToRestore}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
