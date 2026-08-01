import express from 'express';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  recordCustomerPayment,
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  recordSupplierPayment,
  getFinancialSummary,
} from '../controllers/financeController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

// Summary metrics
router.get('/summary', getFinancialSummary);

// Expenses
router.route('/expenses')
  .get(getExpenses)
  .post(upload.single('document'), createExpense);
router.route('/expenses/:id')
  .put(upload.single('document'), updateExpense)
  .delete(deleteExpense);

// Income
router.route('/income')
  .get(getIncomes)
  .post(createIncome);
router.route('/income/:id')
  .put(updateIncome)
  .delete(deleteIncome);

// Customers
router.route('/customers')
  .get(getCustomers)
  .post(createCustomer);
router.route('/customers/:id')
  .get(getCustomerById)
  .put(updateCustomer)
  .delete(deleteCustomer);
router.post('/customers/:id/payment', recordCustomerPayment);

// Suppliers
router.route('/suppliers')
  .get(getSuppliers)
  .post(createSupplier);
router.route('/suppliers/:id')
  .get(getSupplierById)
  .put(updateSupplier)
  .delete(deleteSupplier);
router.post('/suppliers/:id/payment', recordSupplierPayment);

export default router;
