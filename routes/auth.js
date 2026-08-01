import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Diagnostic test endpoint to check environment settings on Render/Local
router.get('/test-config', (req, res) => {
  res.status(200).json({
    success: true,
    resendKeyConfigured: !!process.env.RESEND_API_KEY,
    resendKeyLength: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0,
    nodeEnv: process.env.NODE_ENV || 'not set',
    hostname: req.hostname,
  });
});

export default router;
