import Animal from '../models/Animal.js';
import MilkRecord from '../models/MilkRecord.js';
import Employee from '../models/Employee.js';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Vaccination from '../models/Vaccination.js';
import Pregnancy from '../models/Pregnancy.js';
import Notification from '../models/Notification.js';

// @desc    Get complete dashboard stats & charts data
// @route   GET /api/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Animal Counts
    const totalAnimals = await Animal.countDocuments();
    const cowCount = await Animal.countDocuments({ type: 'Cow' });
    const buffaloCount = await Animal.countDocuments({ type: 'Buffalo' });
    const goatCount = await Animal.countDocuments({ type: 'Goat' });
    const calfCount = await Animal.countDocuments({ type: 'Calf' });
    
    const sickAnimals = await Animal.countDocuments({ healthStatus: { $in: ['Sick', 'Under Treatment'] } });
    const pregnantAnimals = await Animal.countDocuments({ pregnancyStatus: 'Pregnant' });

    // 2. Milk Production Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMilkRecords = await MilkRecord.find({
      date: { $gte: today, $lt: tomorrow }
    });
    const milkProductionToday = todayMilkRecords.reduce((sum, item) => sum + item.totalMilk, 0);

    // 3. Employee Count
    const totalEmployees = await Employee.countDocuments({ status: 'Active' });

    // 4. Financial Statistics
    const incomes = await Income.find({});
    const expenses = await Expense.find({});

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const profit = totalIncome - totalExpenses;

    // 5. Unread Notifications
    const notifications = await Notification.find({ read: false })
      .sort({ createdAt: -1 })
      .limit(5);

    // 6. Upcoming Vaccinations (next 15 days)
    const fifteenDaysFromNow = new Date();
    fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);
    
    const upcomingVaccinations = await Vaccination.find({
      nextDueDate: { $gte: today, $lte: fifteenDaysFromNow },
      status: { $ne: 'Administered' }
    })
      .populate('animal', 'animalId tagNumber name')
      .sort({ nextDueDate: 1 })
      .limit(5);

    // 7. Upcoming Pregnancies / Deliveries (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const upcomingDeliveries = await Pregnancy.find({
      expectedDeliveryDate: { $gte: today, $lte: thirtyDaysFromNow },
      status: 'Confirmed'
    })
      .populate('animal', 'animalId tagNumber name')
      .sort({ expectedDeliveryDate: 1 })
      .limit(5);

    // 8. Recent activities log (combines latest edits / logs or mock)
    const recentActivities = [
      { id: 1, action: 'Milk collection logged', details: 'Morning/evening yield uploaded by David', time: '10 mins ago' },
      { id: 2, action: 'Vaccination completed', details: 'FMD vaccine administered to Bella', time: '2 hours ago' },
      { id: 3, action: 'Pregnancy confirmed', details: 'Cow Daisy (COW-101) check is Confirmed', time: '1 day ago' },
      { id: 4, action: 'Expense record filed', details: '$4,500 feed stock buy registered', time: '2 days ago' },
    ];

    // 9. Charts Data
    // A. Milk Yields Past 7 Days
    const milkYieldData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayRecords = await MilkRecord.find({
        date: { $gte: d, $lt: nextDay }
      });

      const dayTotal = dayRecords.reduce((sum, item) => sum + item.totalMilk, 0);

      milkYieldData.push({
        date: `${d.getDate()} ${months[d.getMonth()]}`,
        yield: dayTotal || 0,
      });
    }

    // B. Financial Trends (past 6 months)
    const financialData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mNum = d.getMonth();
      const yNum = d.getFullYear();

      const incMonth = incomes.filter(
        (x) => new Date(x.date).getMonth() === mNum && new Date(x.date).getFullYear() === yNum
      ).reduce((s, x) => s + x.amount, 0);

      const expMonth = expenses.filter(
        (x) => new Date(x.date).getMonth() === mNum && new Date(x.date).getFullYear() === yNum
      ).reduce((s, x) => s + x.amount, 0);

      financialData.push({
        month: `${months[mNum]}`,
        income: incMonth,
        expense: expMonth,
      });
    }

    // C. Animal Distribution Pie Chart
    const animalDistribution = [
      { name: 'Cows', value: cowCount },
      { name: 'Buffaloes', value: buffaloCount },
      { name: 'Goats', value: goatCount },
      { name: 'Calves', value: calfCount },
    ].filter(a => a.value > 0);

    res.json({
      success: true,
      data: {
        summary: {
          totalAnimals,
          cowCount,
          buffaloCount,
          goatCount,
          calfCount,
          sickAnimals,
          pregnantAnimals,
          milkProductionToday,
          totalEmployees,
          totalIncome,
          totalExpenses,
          profit,
        },
        notifications,
        upcomingVaccinations,
        upcomingDeliveries,
        recentActivities,
        charts: {
          milkYieldData,
          financialData,
          animalDistribution,
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
