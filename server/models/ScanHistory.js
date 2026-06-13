const mongoose = require('mongoose');

const ScanHistorySchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  familyCode: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ScanHistory', ScanHistorySchema);
