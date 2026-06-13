const express = require('express');
const router = express.Router();
const FamilyMessage = require('../models/FamilyMessage');
const ScanHistory = require('../models/ScanHistory');
const Recipe = require('../models/Recipe');
const User = require('../models/User');

async function getUserFamilyCode(userId) {
  if (!userId || userId === 'anonymous') return null;
  if (userId.startsWith('offline_') || userId.startsWith('google_offline_')) return null;
  try {
    const user = await User.findById(userId);
    return user ? user.familyCode : null;
  } catch (err) {
    return null;
  }
}

// @route   GET /api/family/scans
// @desc    Get the latest fridge scans from the whole family
router.get('/scans', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const familyCode = await getUserFamilyCode(userId);
    const query = familyCode ? { familyCode } : {};
    const scans = await ScanHistory.find(query).sort({ createdAt: -1 }).limit(10);
    res.json(scans);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/family/chat
// @desc    Get family group chat messages
router.get('/chat', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const familyCode = await getUserFamilyCode(userId);
    const query = familyCode ? { familyCode } : {};
    const messages = await FamilyMessage.find(query).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/family/chat
// @desc    Post a new family group message
router.post('/chat', async (req, res) => {
  try {
    const { senderName, text } = req.body;
    if (!text) {
      return res.status(400).json({ msg: 'Message text is required' });
    }
    const userId = req.headers['x-user-id'];
    const familyCode = await getUserFamilyCode(userId);

    const newMessage = new FamilyMessage({
      senderName: senderName || 'Family Member',
      text,
      familyCode: familyCode || 'DEFAULT'
    });
    await newMessage.save();
    
    // Fetch all messages to return the updated chat
    const query = familyCode ? { familyCode } : {};
    const messages = await FamilyMessage.find(query).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/family/recipes
// @desc    Get recipes shared/saved by the family
router.get('/recipes', async (req, res) => {
  try {
    // Note: If Recipe model was updated to have familyCode, filter by it.
    // For now we just return all recipes.
    const recipes = await Recipe.find().sort({ createdAt: -1 }).limit(10);
    res.json(recipes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/family/members
// @desc    Get members of the family
router.get('/members', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const familyCode = await getUserFamilyCode(userId);
    if (!familyCode) return res.json([]);
    const users = await User.find({ familyCode }).select('name email picture points badge');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
