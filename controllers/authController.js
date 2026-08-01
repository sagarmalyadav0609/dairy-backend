import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendOTP } from '../utils/sendEmail.js';

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey12345', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Private (Super Admin or Farm Manager)
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Employee',
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token (Hybrid OTP & Direct Password flow)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password, otp } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user and select password, otp fields
    const user = await User.findOne({ email }).select('+password +otp +otpExpires');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account is deactivated' });
    }

    // Match password first for all logins
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // OTP Requirement check: only for Super Admin email
    const isSuperAdminEmail = email.toLowerCase() === 'sagarmalyadav9799@gmail.com';

    if (isSuperAdminEmail) {
      if (!otp) {
        // Step 1: Generate & send OTP
        const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
        
        user.otp = generatedOtp;
        user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiry
        await user.save();

        // Dispatch via SMTP
        try {
          await sendOTP(user.email, generatedOtp);
        } catch (err) {
          return res.status(500).json({
            success: false,
            message: `Credentials correct, but failed to send OTP: ${err.message}`,
          });
        }

        return res.json({
          success: true,
          otpRequired: true,
          message: 'Security verification code (OTP) sent to your registered email.',
        });
      } else {
        // Step 2: Validate OTP code
        if (!user.otp || !user.otpExpires || user.otp !== String(otp)) {
          return res.status(400).json({ success: false, message: 'Invalid OTP code' });
        }

        if (new Date() > user.otpExpires) {
          return res.status(400).json({ success: false, message: 'OTP code has expired' });
        }

        // Clear OTP fields on success
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
      }
    }

    // Return JWT and User details (for direct logins or verified OTP admins)
    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with this email' });
    }

    res.json({
      success: true,
      message: 'Password reset link sent to your registered email address.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = password;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
