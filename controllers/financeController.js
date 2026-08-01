import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Customer from '../models/Customer.js';
import Supplier from '../models/Supplier.js';

// ==========================================
// EXPENSES MANAGEMENT
// ==========================================

export const getExpenses = async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;
    let query = {};

    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const expenseData = { ...req.body };
    if (req.file) {
      expenseData.document = `/uploads/${req.file.filename}`;
    }
    const expense = await Expense.create(expenseData);
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const expenseData = { ...req.body };
    if (req.file) {
      expenseData.document = `/uploads/${req.file.filename}`;
    }
    const expense = await Expense.findByIdAndUpdate(req.params.id, expenseData, {
      new: true,
      runValidators: true,
    });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// INCOME MANAGEMENT
// ==========================================

export const getIncomes = async (req, res) => {
  try {
    const { source, startDate, endDate } = req.query;
    let query = {};

    if (source) query.source = source;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const incomes = await Income.find(query).sort({ date: -1 });
    res.json({ success: true, count: incomes.length, data: incomes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createIncome = async (req, res) => {
  try {
    const income = await Income.create(req.body);
    res.status(201).json({ success: true, data: income });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateIncome = async (req, res) => {
  try {
    const income = await Income.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!income) return res.status(404).json({ success: false, message: 'Income record not found' });
    res.json({ success: true, data: income });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findByIdAndDelete(req.params.id);
    if (!income) return res.status(404).json({ success: false, message: 'Income record not found' });
    res.json({ success: true, message: 'Income record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// CUSTOMERS MANAGEMENT
// ==========================================

export const getCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    const customers = await Customer.find(query).sort({ name: 1 });
    res.json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const recordCustomerPayment = async (req, res) => {
  try {
    const { amount, method, notes } = req.body;
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    customer.payments.push({ amount, method, notes });
    customer.outstandingBalance = Math.max(0, customer.outstandingBalance - Number(amount));

    await customer.save();

    // Register income record automatically
    await Income.create({
      source: 'Milk Sale',
      amount: Number(amount),
      customer: customer.name,
      description: `Payment received from customer. Notes: ${notes || ''}`,
    });

    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// SUPPLIERS MANAGEMENT
// ==========================================

export const getSuppliers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    const suppliers = await Supplier.find(query).sort({ name: 1 });
    res.json({ success: true, count: suppliers.length, data: suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, message: 'Supplier deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const recordSupplierPayment = async (req, res) => {
  try {
    const { amount, item, quantity, notes } = req.body;
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });

    supplier.purchases.push({ item, quantity: Number(quantity), totalCost: Number(amount) });
    supplier.outstandingPayment = Math.max(0, supplier.outstandingPayment - Number(amount));

    await supplier.save();

    // Register expense record automatically
    await Expense.create({
      category: 'Miscellaneous',
      amount: Number(amount),
      description: `Payment to supplier for ${item || 'supplies'}. Notes: ${notes || ''}`,
    });

    res.json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// FINANCIAL REPORT SUMMARY
// ==========================================

export const getFinancialSummary = async (req, res) => {
  try {
    const totalIncomeDocs = await Income.find({});
    const totalExpenseDocs = await Expense.find({});

    const totalIncome = totalIncomeDocs.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = totalExpenseDocs.reduce((sum, item) => sum + item.amount, 0);
    const profit = totalIncome - totalExpense;

    // Monthly breakdown of cash flows (past 6 months)
    const monthlySummary = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mNum = d.getMonth();
      const yNum = d.getFullYear();

      const incMonth = totalIncomeDocs.filter(
        (x) => new Date(x.date).getMonth() === mNum && new Date(x.date).getFullYear() === yNum
      ).reduce((s, x) => s + x.amount, 0);

      const expMonth = totalExpenseDocs.filter(
        (x) => new Date(x.date).getMonth() === mNum && new Date(x.date).getFullYear() === yNum
      ).reduce((s, x) => s + x.amount, 0);

      monthlySummary.push({
        month: `${months[mNum]} ${yNum}`,
        income: incMonth,
        expense: expMonth,
        profit: incMonth - expMonth,
      });
    }

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        profit,
        monthlySummary,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
