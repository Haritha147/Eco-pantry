const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  ngoId: {
    type: String,
    required: true
  },
  ngoName: {
    type: String,
    required: true
  },
  items: [{
    name: String,
    quantity: Number,
    expirationDate: Date
  }],
  status: {
    type: String,
    enum: ['Pending Pickup', 'In Transit', 'Completed', 'Cancelled'],
    default: 'Pending Pickup'
  },
  pickupAddress: {
    type: String,
    default: 'User Default Address'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Donation', DonationSchema);
