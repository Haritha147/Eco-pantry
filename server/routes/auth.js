const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

// TC-02 FIX: Use bcrypt with salt instead of raw SHA-256
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function generateToken(user) {
  return jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

// Helper to generate 6-digit numeric OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// @route   POST /api/auth/register
// @desc    Register a new user (generates and returns OTP for demo)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, familyCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      otp,
      otpExpiry,
      isVerified: false,
      familyCode: familyCode || crypto.randomBytes(3).toString('hex').toUpperCase()
    });

    await user.save();

    // TC-03 FIX: OTP is no longer leaked in the response.
    // In production, send via email (e.g., NodeMailer). For demo, it is logged server-side.
    console.log(`[DEMO] OTP for ${user.email}: ${otp}`);
    res.status(201).json({
      msg: 'Registration successful. Check your email for the verification code.',
      email: user.email
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/verify
// @desc    Verify OTP code
router.post('/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ msg: 'Please provide email and verification code' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ msg: 'User does not exist' });
    }

    // Validate OTP
    if (user.otp !== otp) {
      return res.status(400).json({ msg: 'Invalid verification code' });
    }

    // Check expiry
    if (user.otpExpiry && new Date() > user.otpExpiry) {
      return res.status(400).json({ msg: 'Verification code has expired' });
    }

    // Update status
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({
      msg: 'Verification successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dietaryRestrictions: user.dietaryRestrictions,
        householdSize: user.householdSize,
        points: user.points,
        badge: user.badge,
        picture: user.picture,
        familyCode: user.familyCode
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and get token/user details
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // TC-02 FIX: Compare using bcrypt
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if verified
    if (!user.isVerified) {
      // Re-generate OTP for verification
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();

      // TC-03 FIX: Do not leak OTP
      console.log(`[DEMO] OTP for ${user.email}: ${otp}`);
      return res.status(401).json({
        msg: 'Please verify your email address',
        unverified: true,
        email: user.email
      });
    }

    // TC-01 FIX: Issue JWT token on successful login
    const token = generateToken(user);
    res.json({
      msg: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dietaryRestrictions: user.dietaryRestrictions,
        householdSize: user.householdSize,
        points: user.points,
        badge: user.badge,
        picture: user.picture,
        familyCode: user.familyCode
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile & AI settings
// TC-04 FIX: Profile route now protected by JWT middleware
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email, dietaryRestrictions, householdSize, points, badge, picture } = req.body;

    // TC-04 FIX: userId comes from verified JWT token, not from client body
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (dietaryRestrictions) user.dietaryRestrictions = dietaryRestrictions;
    if (householdSize !== undefined) user.householdSize = householdSize;
    if (points !== undefined) user.points = points;
    if (badge) user.badge = badge;
    if (picture !== undefined) user.picture = picture;

    await user.save();

    res.json({
      msg: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dietaryRestrictions: user.dietaryRestrictions,
        householdSize: user.householdSize,
        points: user.points,
        badge: user.badge,
        picture: user.picture,
        familyCode: user.familyCode
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: 'Please provide current and new passwords' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    res.json({ msg: 'Password changed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP to user
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ msg: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // TC-03 FIX: Do not leak OTP
    console.log(`[DEMO] OTP for ${user.email}: ${otp}`);
    res.json({
      msg: 'New OTP code sent. Check your email.',
      email: user.email
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
