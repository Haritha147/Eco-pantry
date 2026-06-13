const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpiry: {
    type: Date,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  dietaryRestrictions: {
    type: String,
    default: 'None',
  },
  householdSize: {
    type: Number,
    default: 2,
  },
  points: {
    type: Number,
    default: 150,
  },
  badge: {
    type: String,
    default: 'Silver',
  },
  picture: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  familyCode: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('User', UserSchema);
