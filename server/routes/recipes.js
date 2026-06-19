const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const InventoryItem = require('../models/InventoryItem');
const User = require('../models/User');

// Raw fetch used for Groq API calls

async function getUserFamilyCode(userId) {
  if (!userId || userId === 'anonymous') return null;
  if (userId.startsWith('offline_') || userId.startsWith('google_offline_')) return null;
  try {
    const user = await User.findById(userId);
    return user ? user.familyCode : null;
  } catch(e) {
    return null;
  }
}

// @route   GET /api/recipes
// @desc    Get all saved recipes
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const familyCode = await getUserFamilyCode(userId);
    const query = familyCode ? { familyCode } : (userId ? { user: userId } : { $or: [{ user: null }, { user: { $exists: false } }] });
    const recipes = await Recipe.find(query).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/recipes/generate
// @desc    Generate recipes based on inventory
router.post('/generate', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const familyCode = await getUserFamilyCode(userId);
    const query = familyCode ? { familyCode } : (userId ? { user: userId } : { $or: [{ user: null }, { user: { $exists: false } }] });
    
    // Fetch the Top 3 "Red Zone" items (expiring soonest) for this family
    const inventory = await InventoryItem.find(query).sort({ expirationDate: 1 }).limit(3);
    
    if (inventory.length === 0) {
      return res.status(400).json({ msg: 'No inventory items to generate recipes from.' });
    }

    const inventoryNames = inventory.map(item => item.name);

    // Prompt Groq for Zero-Waste Recipes using MUST-USE Red Zone items
    const prompt = `You are a Zero-Waste culinary expert. I absolutely MUST use these specific ingredients nearing expiration: ${inventoryNames.join(', ')}. Generate exactly 2 unique, zero-waste recipes that prioritize using ALL of these exact items.
    Return a JSON object containing a 'recipes' field which is an array of recipe objects. Each recipe object must have:
    - 'title' (string)
    - 'description' (string, MUST include the calculated monetary savings in ₹. Example: "Saves ₹120")
    - 'matchScore' (number 0-100)
    - 'matchedIngredients' (array of strings)
    - 'missingIngredients' (array of strings)
    - 'instructions' (array of strings)`;

    let rawText = '';
    
    try {
        console.log('Sending ingredients to Groq API for recipe generation...');
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a zero-waste culinary expert. Output JSON containing a list of recipes.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Groq API Error: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        rawText = data.choices?.[0]?.message?.content || '';
        rawText = rawText.trim();
        console.log('Groq raw recipe response:', rawText);
    } catch (apiErr) {
        console.error('Groq Recipe Generation Failed:', apiErr.message);
        console.log('Falling back to MOCK recipe data...');
        rawText = JSON.stringify({
            recipes: [
                {
                    title: "Zero-Waste Veggie Stir Fry",
                    description: "A quick and delicious stir fry using your exact ingredients. Saves ₹120.",
                    matchScore: 95,
                    matchedIngredients: inventoryNames,
                    missingIngredients: ["Soy Sauce", "Cooking Oil"],
                    instructions: ["Chop all ingredients.", "Heat oil in a pan.", "Stir fry for 10 minutes and serve hot."]
                },
                {
                    title: "Eco-Pantry Soup",
                    description: "A warm, comforting soup to reduce waste. Saves ₹85.",
                    matchScore: 80,
                    matchedIngredients: inventoryNames,
                    missingIngredients: ["Vegetable Broth", "Salt", "Pepper"],
                    instructions: ["Boil the broth.", "Add your ingredients.", "Simmer for 20 minutes until tender."]
                }
            ]
        });
    }

    let generatedRecipes = [];
    try {
        const parsed = JSON.parse(rawText);
        generatedRecipes = Array.isArray(parsed) ? parsed : (parsed.recipes || []);
    } catch (e) {
        console.error('Failed to parse Groq recipe JSON:', e);
        return res.status(500).json({ msg: 'Failed to parse Groq response' });
    }

    // Associate user with recipes
    const recipesToSave = generatedRecipes.map(recipe => ({
      ...recipe,
      user: userId || undefined,
      familyCode: familyCode || 'DEFAULT'
    }));

    // Save to database
    let savedRecipes = recipesToSave;
    try {
        savedRecipes = await Recipe.insertMany(recipesToSave);
    } catch (dbErr) {
        console.error('Failed to save recipes to DB (ensure MongoDB is running):', dbErr.message);
    }
    
    res.json({ message: 'Recipes generated successfully', recipes: savedRecipes });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'API Error: ' + err.message });
  }
});

module.exports = router;
