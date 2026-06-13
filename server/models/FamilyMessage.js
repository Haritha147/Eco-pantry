const mongoose = require('mongoose');

const FamilyMessageSchema = new mongoose.Schema({
  senderName: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  familyCode: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('FamilyMessage', FamilyMessageSchema);
