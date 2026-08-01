import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
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
import Settings from '../models/Settings.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dairy-farm';
    await mongoose.connect(mongoURI);
    console.log('Connected to DB for seeding...');

    // Clean existing database
    await User.deleteMany();
    await Animal.deleteMany();
    await MilkRecord.deleteMany();
    await Employee.deleteMany();
    await Expense.deleteMany();
    await Income.deleteMany();
    await Customer.deleteMany();
    await Supplier.deleteMany();
    await Inventory.deleteMany();
    await Vaccination.deleteMany();
    await Treatment.deleteMany();
    await Pregnancy.deleteMany();
    await FeedRecord.deleteMany();
    await Notification.deleteMany();
    await Settings.deleteMany();

    console.log('Database cleared.');

    // 1. Seed Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = await User.insertMany([
      { name: 'Super Admin User', email: 'sagarmalyadav9799@gmail.com', password: hashedPassword, role: 'Super Admin' },
      { name: 'John Manager', email: 'manager@farm.com', password: hashedPassword, role: 'Farm Manager' },
      { name: 'Dr. Sarah Vet', email: 'vet@farm.com', password: hashedPassword, role: 'Veterinarian' },
      { name: 'Robert Accountant', email: 'accountant@farm.com', password: hashedPassword, role: 'Accountant' },
      { name: 'David Employee', email: 'employee@farm.com', password: hashedPassword, role: 'Employee' },
    ]);
    console.log('Users seeded.');

    // 2. Seed Settings
    await Settings.create({
      farmName: 'Royal Dairy Farms',
      address: '77 Meadows Highway, Green County',
      gstNumber: '29ABCDE1234F1Z5',
      phone: '+1 (555) 789-0123',
      email: 'contact@royaldairy.com',
      language: 'English',
      theme: 'light',
    });
    console.log('Settings seeded.');

    // 3. Seed Animals
    const animalsData = [
      { tagNumber: 'COW-101', type: 'Cow', breed: 'Holstein Friesian', gender: 'Female', name: 'Daisy', color: 'Black & White', weight: 650, height: 145, dateOfBirth: new Date('2020-03-12'), purchaseDate: new Date('2022-05-10'), purchasePrice: 2200, currentValue: 2500, pregnancyStatus: 'Pregnant', lactationStatus: 'Lactating', healthStatus: 'Healthy', vaccinationStatus: 'Up to Date', dewormingStatus: 'Done', notes: 'High milk producer' },
      { tagNumber: 'COW-102', type: 'Cow', breed: 'Jersey', gender: 'Female', name: 'Bella', color: 'Brown', weight: 520, height: 135, dateOfBirth: new Date('2021-06-15'), purchaseDate: new Date('2023-01-20'), purchasePrice: 1800, currentValue: 1900, pregnancyStatus: 'Not Pregnant', lactationStatus: 'Lactating', healthStatus: 'Healthy', vaccinationStatus: 'Up to Date', dewormingStatus: 'Done' },
      { tagNumber: 'COW-103', type: 'Cow', breed: 'Gyr', gender: 'Female', name: 'Ganga', color: 'Reddish Brown', weight: 480, height: 140, dateOfBirth: new Date('2019-01-10'), purchaseDate: new Date('2021-11-15'), purchasePrice: 2000, currentValue: 2100, pregnancyStatus: 'Not Pregnant', lactationStatus: 'Dry', healthStatus: 'Sick', vaccinationStatus: 'Pending', dewormingStatus: 'Overdue', notes: 'Recovering from minor hoof infection' },
      { tagNumber: 'BUF-201', type: 'Buffalo', breed: 'Murrah', gender: 'Female', name: 'Lakshmi', color: 'Jet Black', weight: 750, height: 150, dateOfBirth: new Date('2018-09-05'), purchaseDate: new Date('2021-04-01'), purchasePrice: 3000, currentValue: 3200, pregnancyStatus: 'Pregnant', lactationStatus: 'Lactating', healthStatus: 'Healthy', vaccinationStatus: 'Up to Date', dewormingStatus: 'Done' },
      { tagNumber: 'BUF-202', type: 'Buffalo', breed: 'Nili-Ravi', gender: 'Female', name: 'Kali', color: 'Black', weight: 700, height: 148, dateOfBirth: new Date('2020-11-22'), purchaseDate: new Date('2023-02-18'), purchasePrice: 2600, currentValue: 2700, pregnancyStatus: 'Not Pregnant', lactationStatus: 'Lactating', healthStatus: 'Healthy', vaccinationStatus: 'Up to Date', dewormingStatus: 'Done' },
      { tagNumber: 'GOA-301', type: 'Goat', breed: 'Boer', gender: 'Female', name: 'Nanny', color: 'White & Brown', weight: 65, height: 75, dateOfBirth: new Date('2023-05-04'), purchaseDate: new Date('2023-12-10'), purchasePrice: 350, currentValue: 400, pregnancyStatus: 'Not Pregnant', lactationStatus: 'Dry', healthStatus: 'Healthy', vaccinationStatus: 'Up to Date', dewormingStatus: 'Done' },
      { tagNumber: 'CLF-401', type: 'Calf', breed: 'Jersey', gender: 'Female', name: 'Coco', color: 'Light Brown', weight: 80, height: 85, dateOfBirth: new Date('2026-02-10'), fatherName: 'Bull-09', motherName: 'Bella', pregnancyStatus: 'Not Applicable', lactationStatus: 'Not Applicable', healthStatus: 'Healthy', vaccinationStatus: 'Up to Date', dewormingStatus: 'Done' },
      { tagNumber: 'BUL-501', type: 'Bull', breed: 'Holstein', gender: 'Male', name: 'Thor', color: 'Black & White', weight: 900, height: 165, dateOfBirth: new Date('2018-05-15'), purchaseDate: new Date('2020-07-22'), purchasePrice: 4500, currentValue: 5000, pregnancyStatus: 'Not Applicable', lactationStatus: 'Not Applicable', healthStatus: 'Healthy', vaccinationStatus: 'Up to Date', dewormingStatus: 'Done' },
    ];

    const seededAnimals = [];
    // We save animals sequentially to let the pre-save hook generate `animalId` correctly
    for (const anim of animalsData) {
      const saved = await Animal.create(anim);
      seededAnimals.push(saved);
    }
    console.log(`${seededAnimals.length} Animals seeded.`);

    // 4. Seed Milk Records
    // Create daily records for the past 7 days for the lactating animals
    const milkRecords = [];
    const lactatingAnimals = seededAnimals.filter(a => a.lactationStatus === 'Lactating');
    
    for (let i = 0; i < 7; i++) {
      const recordDate = new Date();
      recordDate.setDate(recordDate.getDate() - i);

      for (const anim of lactatingAnimals) {
        // Murrah buffaloes yield more fat but slightly less yield, HF cows yield high volume
        const isCow = anim.type === 'Cow';
        const morning = isCow ? Math.floor(Math.random() * 8) + 10 : Math.floor(Math.random() * 5) + 6;
        const evening = isCow ? Math.floor(Math.random() * 6) + 8 : Math.floor(Math.random() * 4) + 5;
        const fatVal = isCow ? (Math.random() * 1.5 + 3.5).toFixed(1) : (Math.random() * 2 + 6.5).toFixed(1);
        const snfVal = isCow ? (Math.random() * 0.8 + 8.2).toFixed(1) : (Math.random() * 1.2 + 9.0).toFixed(1);

        milkRecords.push({
          animal: anim._id,
          morningMilk: morning,
          eveningMilk: evening,
          fat: parseFloat(fatVal),
          snf: parseFloat(snfVal),
          quality: parseFloat(fatVal) > 6 ? 'Excellent' : 'Good',
          date: recordDate,
          employee: 'David Employee',
        });
      }
    }
    // Bulk create milk records (so pre-save calculates totalMilk)
    for (const milk of milkRecords) {
      await MilkRecord.create(milk);
    }
    console.log('Milk Records seeded.');

    // 5. Seed Employees & Attendance
    const seededEmployees = [];
    const empRoles = ['Farm Manager', 'Veterinarian', 'Accountant', 'Employee'];
    const empNames = ['John Manager', 'Sarah Vet', 'Robert Accountant', 'David Employee'];
    const empPhones = ['9876543210', '9876543211', '9876543212', '9876543213'];
    const salaries = [5000, 4500, 4000, 2500];
    const shifts = ['Morning', 'Morning', 'Morning', 'Evening'];

    for (let j = 0; j < 4; j++) {
      const attendance = [];
      // Generate attendance for past 10 days
      for (let day = 0; day < 10; day++) {
        const attendanceDate = new Date();
        attendanceDate.setDate(attendanceDate.getDate() - day);
        // Exclude sundays or make minor absences
        const isAbsent = day === 6; // Just one absent day
        attendance.push({
          date: attendanceDate,
          status: isAbsent ? 'Absent' : 'Present',
        });
      }

      const emp = await Employee.create({
        name: empNames[j],
        mobile: empPhones[j],
        address: `${j + 10} Dairy Farm Colony, Green Road`,
        salary: salaries[j],
        shift: shifts[j],
        role: empRoles[j],
        attendance: attendance,
        status: 'Active',
      });
      seededEmployees.push(emp);
    }
    console.log('Employees seeded.');

    // 6. Seed Suppliers
    const suppliers = await Supplier.insertMany([
      { name: 'Apex Feeds Ltd', contactPerson: 'Mark Miller', phone: '555-010-2233', email: 'sales@apexfeeds.com', address: 'Grain District, Cityville', materialsSupplied: 'Cattle feeds, Mineral blocks, Hay', outstandingPayment: 850 },
      { name: 'VetriMed Corp', contactPerson: 'Dr. Allan', phone: '555-020-4499', email: 'support@vetrimed.com', address: 'Medical Row, BioTown', materialsSupplied: 'Vaccines, Deworming tablets, Syringes', outstandingPayment: 200 },
    ]);
    console.log('Suppliers seeded.');

    // 7. Seed Customers
    const customers = await Customer.insertMany([
      { name: 'City Dairy Co-op', email: 'coop@citydairy.com', phone: '555-015-7788', address: '12 Logistics Way, Metro City', type: 'Milk Buyer', outstandingBalance: 1200 },
      { name: 'Alexander Farms', email: 'alex@farms.com', phone: '555-017-9900', address: 'North Pastures', type: 'Animal Buyer', outstandingBalance: 0 },
    ]);
    console.log('Customers seeded.');

    // 8. Seed Inventory
    const inventory = await Inventory.insertMany([
      { name: 'High-Protein Grain Mix', category: 'Feed', quantity: 250, unit: 'kg', supplier: 'Apex Feeds Ltd', cost: 12.5, minStockLevel: 100 },
      { name: 'Alfalfa Hay Bale', category: 'Feed', quantity: 8, unit: 'Bags', supplier: 'Apex Feeds Ltd', cost: 45, minStockLevel: 10 }, // Low Stock!
      { name: 'Foot & Mouth Vaccine', category: 'Medicine', quantity: 50, unit: 'Units', supplier: 'VetriMed Corp', cost: 15, minStockLevel: 15 },
      { name: 'Milking Machine Tube', category: 'Equipment', quantity: 15, unit: 'Units', supplier: 'General Hardware', cost: 30, minStockLevel: 5 },
      { name: 'Veterinary Dewormer', category: 'Medicine', quantity: 3, unit: 'Units', supplier: 'VetriMed Corp', cost: 8, minStockLevel: 10 }, // Low Stock!
    ]);
    console.log('Inventory seeded.');

    // 9. Seed Financials (Past 4 months of records for charting)
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const expensesData = [
      // Salaries
      { category: 'Salary', amount: 16000, description: 'Staff payroll for May', date: new Date(currentYear, currentMonth - 2, 28) },
      { category: 'Salary', amount: 16000, description: 'Staff payroll for June', date: new Date(currentYear, currentMonth - 1, 28) },
      // Feeds
      { category: 'Feed', amount: 4500, description: 'Bulk buy grain mix and hay', date: new Date(currentYear, currentMonth - 2, 5) },
      { category: 'Feed', amount: 5200, description: 'Apex feeds order 42', date: new Date(currentYear, currentMonth - 1, 8) },
      { category: 'Feed', amount: 3125, description: 'High-protein grain mix stock refill', date: new Date(currentYear, currentMonth, 12) },
      // Medicines & Vet
      { category: 'Medicine', amount: 1200, description: 'Vaccines and dewormers from VetriMed', date: new Date(currentYear, currentMonth - 1, 15) },
      { category: 'Medicine', amount: 750, description: 'Emergency treatment meds', date: new Date(currentYear, currentMonth, 20) },
      // Utilities
      { category: 'Electricity', amount: 1800, description: 'Power bill barn & cooling', date: new Date(currentYear, currentMonth - 1, 10) },
      { category: 'Electricity', amount: 2100, description: 'Power bill hot weather cooling', date: new Date(currentYear, currentMonth, 10) },
      { category: 'Water', amount: 650, description: 'Water bill', date: new Date(currentYear, currentMonth - 1, 12) },
      { category: 'Water', amount: 700, description: 'Water bill', date: new Date(currentYear, currentMonth, 12) },
      // Maintenance
      { category: 'Maintenance', amount: 1100, description: 'Milking machine service and tubes', date: new Date(currentYear, currentMonth, 5) },
    ];
    await Expense.insertMany(expensesData);

    const incomeData = [
      // Milk sales
      { source: 'Milk Sale', amount: 28500, customer: 'City Dairy Co-op', description: 'May milk supply payout', date: new Date(currentYear, currentMonth - 2, 30) },
      { source: 'Milk Sale', amount: 32000, customer: 'City Dairy Co-op', description: 'June milk supply payout', date: new Date(currentYear, currentMonth - 1, 30) },
      { source: 'Milk Sale', amount: 14500, customer: 'City Dairy Co-op', description: 'Mid-month milk supply', date: new Date(currentYear, currentMonth, 15) },
      // Breeding
      { source: 'Breeding Service', amount: 1500, customer: 'Greenfields Farm', description: 'Breeding service with Thor Bull', date: new Date(currentYear, currentMonth - 1, 20) },
      // Animal sale
      { source: 'Animal Sale', amount: 1800, customer: 'Alexander Farms', description: 'Sold heifer Jersey heifer', date: new Date(currentYear, currentMonth, 10) },
      // Manure
      { source: 'Manure Sale', amount: 600, customer: 'Local Fertilizer Nursery', description: 'Bulk composted manure sale', date: new Date(currentYear, currentMonth, 22) },
    ];
    await Income.insertMany(incomeData);
    console.log('Finance (Expenses & Income) seeded.');

    // 10. Seed Health Records (Vaccination & Treatment)
    const cow1 = seededAnimals.find(a => a.tagNumber === 'COW-101');
    const cow2 = seededAnimals.find(a => a.tagNumber === 'COW-102');
    const cow3 = seededAnimals.find(a => a.tagNumber === 'COW-103');
    const buf1 = seededAnimals.find(a => a.tagNumber === 'BUF-201');

    await Vaccination.insertMany([
      { animal: cow1._id, vaccineName: 'Brucellosis', dateAdministered: new Date('2026-03-01'), nextDueDate: new Date('2027-03-01'), veterinarian: 'Dr. Sarah Vet', cost: 25, status: 'Administered' },
      { animal: cow2._id, vaccineName: 'Foot & Mouth Disease', dateAdministered: new Date('2026-01-15'), nextDueDate: new Date('2026-07-15'), veterinarian: 'Dr. Sarah Vet', cost: 15, status: 'Overdue' },
      { animal: buf1._id, vaccineName: 'Foot & Mouth Disease', dateAdministered: new Date('2026-07-28'), nextDueDate: new Date('2027-01-28'), veterinarian: 'Dr. Sarah Vet', cost: 15, status: 'Administered' },
      { animal: cow3._id, vaccineName: 'Haemorrhagic Septicaemia', dateAdministered: new Date('2026-05-10'), nextDueDate: new Date('2026-08-15'), veterinarian: 'Dr. Sarah Vet', cost: 20, status: 'Scheduled' },
    ]);

    await Treatment.insertMany([
      { animal: cow3._id, disease: 'Hoof Infection', symptoms: 'Limping on right hind leg, inflammation', diagnosis: 'Foot rot caused by damp soil', medicine: 'Antibiotic spray, zinc sulphate wash', doctor: 'Dr. Sarah Vet', cost: 120, treatmentDate: new Date(), followUpDate: new Date(new Date().setDate(new Date().getDate() + 7)), status: 'Active' },
      { animal: cow2._id, disease: 'Mastitis', symptoms: 'Mild swelling of udder', diagnosis: 'Subclinical mastitis', medicine: 'Intramammary infusions', doctor: 'Dr. Sarah Vet', cost: 80, treatmentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), status: 'Completed' },
    ]);
    console.log('Health Records (Vaccinations & Treatments) seeded.');

    // 11. Seed Breeding
    await Pregnancy.insertMany([
      { animal: cow1._id, matingDate: new Date('2025-11-10'), matingType: 'Artificial Insemination', bullDetails: 'Jersey Bull Semen J-908', pregnancyCheckDate: new Date('2026-01-10'), status: 'Confirmed', expectedDeliveryDate: new Date('2026-08-20'), notes: 'Heifer is doing great. High feed intake.' },
      { animal: buf1._id, matingDate: new Date('2026-02-15'), matingType: 'Natural Mating', bullDetails: 'Murrah Stud Bull M-10', pregnancyCheckDate: new Date('2026-04-15'), status: 'Confirmed', expectedDeliveryDate: new Date('2026-11-20') },
      { animal: cow2._id, matingDate: new Date('2026-07-05'), matingType: 'Artificial Insemination', bullDetails: 'HF Bull Semen HF-01', status: 'Pending Check' },
    ]);
    console.log('Pregnancies seeded.');

    // 12. Seed Feed Records
    const feedsToSeed = [];
    for (let k = 0; k < 5; k++) {
      const feedDate = new Date();
      feedDate.setDate(feedDate.getDate() - k);
      seededAnimals.forEach(a => {
        feedsToSeed.push({
          animal: a._id,
          feedName: a.type === 'Buffalo' ? 'High-Protein Grain Mix' : 'Alfalfa Hay Bale',
          quantity: a.type === 'Cow' || a.type === 'Buffalo' ? 12 : 1.5,
          date: feedDate,
          time: k % 2 === 0 ? 'Morning' : 'Evening',
        });
      });
    }
    await FeedRecord.insertMany(feedsToSeed);
    console.log('Feeding Records seeded.');

    // 13. Seed Notifications
    await Notification.insertMany([
      { title: 'Vaccination Overdue', message: 'Bella (COW-102) is overdue for Foot & Mouth Disease vaccine', type: 'Alert', category: 'Vaccination', read: false },
      { title: 'Low Feed Stock Alert', message: 'Alfalfa Hay Bale stock is below the minimum level (8 Bags remaining)', type: 'Warning', category: 'Stock', read: false },
      { title: 'Pregnancy Check Due', message: 'Bella (COW-102) is due for a pregnancy scan check', type: 'Info', category: 'Pregnancy', read: false },
      { title: 'Low Stock Alert', message: 'Veterinary Dewormer stock is extremely low (3 Units remaining)', type: 'Warning', category: 'Stock', read: false },
    ]);
    console.log('Notifications seeded.');

    console.log('Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
