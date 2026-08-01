import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Half Day', 'Leave'],
    required: true,
  },
});

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    photo: {
      type: String,
    },
    mobile: {
      type: String,
      required: [true, 'Please add a phone number'],
    },
    address: {
      type: String,
    },
    salary: {
      type: Number,
      required: [true, 'Please specify salary amount'],
    },
    shift: {
      type: String,
      enum: ['Morning', 'Evening', 'Night'],
      default: 'Morning',
    },
    role: {
      type: String,
      enum: ['Super Admin', 'Farm Manager', 'Employee', 'Veterinarian', 'Accountant'],
      default: 'Employee',
    },
    attendance: [attendanceSchema],
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Terminated'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save to generate Employee ID (e.g. EMP-0001)
employeeSchema.pre('save', async function (next) {
  if (!this.employeeId) {
    const lastEmp = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });
    let nextId = 1;
    if (lastEmp && lastEmp.employeeId) {
      const match = lastEmp.employeeId.match(/EMP-(\d+)/);
      if (match) {
        nextId = parseInt(match[1], 10) + 1;
      }
    }
    this.employeeId = `EMP-${String(nextId).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model('Employee', employeeSchema);
