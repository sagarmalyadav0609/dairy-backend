import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  markAttendance,
  getPayroll,
} from '../controllers/employeeController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.get('/payroll', getPayroll);

router.route('/')
  .get(getEmployees)
  .post(upload.single('photo'), createEmployee);

router.route('/:id')
  .get(getEmployeeById)
  .put(upload.single('photo'), updateEmployee)
  .delete(deleteEmployee);

router.post('/:id/attendance', markAttendance);

export default router;
