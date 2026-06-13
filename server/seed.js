const mongoose = require('mongoose');
require('dotenv').config();

const InventoryItem = require('./models/InventoryItem');
const Recipe = require('./models/Recipe');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await InventoryItem.deleteMany({});
    await Recipe.deleteMany({});
    console.log('Cleared existing data');

    const today = new Date();
    
    // Create Inventory Items
    const items = [
      {
        name: 'Milk',
        category: 'Dairy',
        confidenceScore: 98,
        expirationDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        quantity: 1,
        preservationTip: 'Keep milk in the main body of the fridge, not the door, where temperatures fluctuate.'
      },
      {
        name: 'Spinach',
        category: 'Vegetables',
        confidenceScore: 95,
        expirationDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days
        quantity: 2,
        preservationTip: 'Store in an airtight container with a paper towel to absorb excess moisture.'
      },
      {
        name: 'Apples',
        category: 'Fruits',
        confidenceScore: 99,
        expirationDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days
        quantity: 5,
        preservationTip: 'Store in the crisper drawer; keep away from other produce as they release ethylene gas.'
      },
      {
        name: 'Yogurt',
        category: 'Dairy',
        confidenceScore: 100,
        expirationDate: new Date(today.getTime() + 0 * 24 * 60 * 60 * 1000), // Today
        quantity: 3,
        preservationTip: 'Keep sealed until ready to eat. Can be frozen to extend life for smoothies.'
      },
      {
        name: 'Chicken Breast',
        category: 'Meat',
        confidenceScore: 90,
        expirationDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days
        quantity: 1,
        preservationTip: 'Store on the bottom shelf of the fridge to prevent cross-contamination.'
      }
    ];

    await InventoryItem.insertMany(items);
    console.log('Inserted showcase inventory items');

    // Create a matching recipe
    const recipes = [
      {
        title: 'Creamy Spinach Chicken',
        description: 'A delicious way to use up your soon-to-expire spinach and chicken.',
        matchScore: 95,
        matchedIngredients: ['Spinach', 'Chicken Breast', 'Milk'],
        missingIngredients: ['Garlic', 'Olive Oil', 'Parmesan Cheese'],
        instructions: [
          '1. Season the chicken breast and cook in a pan with olive oil.',
          '2. Remove chicken, add garlic and cook until fragrant.',
          '3. Add milk and simmer slightly to create a creamy base.',
          '4. Stir in the spinach until wilted.',
          '5. Add the chicken back in and top with parmesan cheese.'
        ]
      },
      {
        title: 'Spinach and Apple Smoothie',
        description: 'A quick and healthy smoothie using your fruits and veggies.',
        matchScore: 85,
        matchedIngredients: ['Spinach', 'Apples', 'Yogurt', 'Milk'],
        missingIngredients: ['Honey', 'Ice'],
        instructions: [
          '1. Core the apples and roughly chop them.',
          '2. Add apples, spinach, yogurt, and milk to a blender.',
          '3. Add honey to taste and a handful of ice.',
          '4. Blend until smooth.'
        ]
      }
    ];

    await Recipe.insertMany(recipes);
    console.log('Inserted showcase recipes');

    mongoose.connection.close();
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
