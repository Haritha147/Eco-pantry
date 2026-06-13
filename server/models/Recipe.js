const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  matchedIngredients: [{
    type: String
  }],
  missingIngredients: [{
    type: String
  }],
  instructions: [{
    type: String
  }],
  user: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Recipe', RecipeSchema);
