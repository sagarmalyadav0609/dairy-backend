import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';

// Route Imports
import authRoutes from './routes/auth.js';
import animalRoutes from './routes/animals.js';
import milkRoutes from './routes/milk.js';
import employeeRoutes from './routes/employees.js';
import inventoryRoutes from './routes/inventory.js';
import financeRoutes from './routes/finance.js';
import healthRoutes from './routes/health.js';
import breedingRoutes from './routes/breeding.js';
import notificationRoutes from './routes/notifications.js';
import settingsRoutes from './routes/settings.js';
import dashboardRoutes from './routes/dashboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect to Database
connectDB();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading images from frontend
}));

// Enable CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

// Request Logger in dev mode
app.use(morgan('dev'));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiter for APIs
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', apiLimiter);

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/milk', milkRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/breeding', breedingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Simple Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Dairy Farm API is running smoothly' });
});

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

export default app;
