import Employee from '../models/Employee.js';

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
export const getEmployees = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
      ];
    }

    const employees = await Employee.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new employee record
// @route   POST /api/employees
// @access  Private
export const createEmployee = async (req, res) => {
  try {
    const employeeData = { ...req.body };

    if (req.file) {
      employeeData.photo = `/uploads/${req.file.filename}`;
    }

    const employee = await Employee.create(employeeData);
    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update employee details
// @route   PUT /api/employees/:id
// @access  Private
export const updateEmployee = async (req, res) => {
  try {
    const employeeData = { ...req.body };

    if (req.file) {
      employeeData.photo = `/uploads/${req.file.filename}`;
    }

    const employee = await Employee.findByIdAndUpdate(req.params.id, employeeData, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete employee record
// @route   DELETE /api/employees/:id
// @access  Private
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, message: 'Employee removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark attendance for an employee
// @route   POST /api/employees/:id/attendance
// @access  Private
export const markAttendance = async (req, res) => {
  try {
    const { date, status } = req.body;
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const attDate = date ? new Date(date) : new Date();
    // Normalize date to remove time for checking duplicates
    attDate.setHours(0, 0, 0, 0);

    // Check if attendance already marked for this date
    const existingIndex = employee.attendance.findIndex(
      (a) => new Date(a.date).setHours(0, 0, 0, 0) === attDate.getTime()
    );

    if (existingIndex >= 0) {
      // Update existing attendance status
      employee.attendance[existingIndex].status = status;
    } else {
      // Add new record
      employee.attendance.push({ date: attDate, status });
    }

    await employee.save();
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Payroll / Payroll summary
// @route   GET /api/employees/payroll
// @access  Private
export const getPayroll = async (req, res) => {
  try {
    const employees = await Employee.find({});

    const payroll = employees.map((emp) => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Filter attendance for the current month
      const currentMonthAtt = emp.attendance.filter((att) => {
        const attDate = new Date(att.date);
        return attDate.getMonth() === currentMonth && attDate.getFullYear() === currentYear;
      });

      const totalDays = currentMonthAtt.length;
      const presents = currentMonthAtt.filter(a => a.status === 'Present').length;
      const leaves = currentMonthAtt.filter(a => a.status === 'Leave').length;
      const absents = currentMonthAtt.filter(a => a.status === 'Absent').length;

      // Deduction logic: deduct salary proportionally for absences
      let calculatedSalary = emp.salary;
      if (totalDays > 0) {
        const paidDays = presents + leaves; // leaves are paid, absents are unpaid
        calculatedSalary = Math.round((emp.salary / totalDays) * paidDays);
      }

      return {
        _id: emp._id,
        employeeId: emp.employeeId,
        name: emp.name,
        role: emp.role,
        baseSalary: emp.salary,
        presentDays: presents,
        leaveDays: leaves,
        absentDays: absents,
        calculatedSalary,
        status: emp.status,
      };
    });

    res.json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
