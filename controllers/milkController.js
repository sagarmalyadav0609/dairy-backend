import MilkRecord from '../models/MilkRecord.js';
import Animal from '../models/Animal.js';

// @desc    Add daily milk collection record
// @route   POST /api/milk
// @access  Private
export const addMilkRecord = async (req, res) => {
  try {
    const { animal, morningMilk, eveningMilk, fat, snf, quality, date, employee } = req.body;

    const animalExists = await Animal.findById(animal);
    if (!animalExists) {
      return res.status(404).json({ success: false, message: 'Animal not found' });
    }

    const record = await MilkRecord.create({
      animal,
      morningMilk: Number(morningMilk || 0),
      eveningMilk: Number(eveningMilk || 0),
      fat: Number(fat || 0),
      snf: Number(snf || 0),
      quality: quality || 'Good',
      date: date || new Date(),
      employee: employee || 'Staff',
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get milk collection records (with filters)
// @route   GET /api/milk
// @access  Private
export const getMilkRecords = async (req, res) => {
  try {
    const { startDate, endDate, animalId } = req.query;

    let query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (animalId) {
      const animal = await Animal.findOne({ animalId: animalId });
      if (animal) {
        query.animal = animal._id;
      } else {
        // Return empty list if searched animal doesn't exist
        return res.json({ success: true, data: [] });
      }
    }

    const records = await MilkRecord.find(query)
      .populate('animal', 'animalId tagNumber type breed')
      .sort({ date: -1 });

    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Milk Production Aggregation Reports
// @route   GET /api/milk/reports
// @access  Private
export const getMilkReports = async (req, res) => {
  try {
    const { filter } = req.query; // 'daily', 'weekly', 'monthly', 'yearly'

    let groupBy = {};
    let format = '%Y-%m-%d';

    if (filter === 'weekly') {
      groupBy = { $week: '$date' };
    } else if (filter === 'monthly') {
      groupBy = { $month: '$date' };
      format = '%Y-%m';
    } else if (filter === 'yearly') {
      groupBy = { $year: '$date' };
      format = '%Y';
    } else {
      // Default daily
      groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
    }

    const reports = await MilkRecord.aggregate([
      {
        $group: {
          _id: groupBy,
          totalMilk: { $sum: '$totalMilk' },
          avgFat: { $avg: '$fat' },
          avgSnf: { $avg: '$snf' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
