const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: 'Uncategorized',
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  preservationTip: {
    type: String,
    default: 'Store in a cool, dry place to extend shelf life.',
  },
  user: {
    type: String,
    required: false
  },
  familyCode: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);
