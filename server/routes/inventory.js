const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const InventoryItem = require('../models/InventoryItem');
const ScanHistory = require('../models/ScanHistory');
const User = require('../models/User');
const { validateInventoryCreate } = require('../middleware/validators');

// Raw fetch used for Groq to ensure API key works correctly
const Recipe = require('../models/Recipe');
const Donation = require('../models/Donation');

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

// Setup Multer for image uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// TC-06 FIX: Restrict file uploads to image and audio MIME types
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const dateStr = new Date().toISOString().split('T')[0];
    const isAudio = file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/');
    const ext = isAudio ? '.webm' : '.jpg';
    cb(null, dateStr + '-' + Date.now() + '-' + require('crypto').randomUUID() + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'video/webm'
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image and audio files are allowed'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// @route   GET /api/inventory
// @desc    Get all inventory items
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const familyCode = await getUserFamilyCode(userId);
    const query = familyCode ? { familyCode } : { $or: [{ user: null }, { user: { $exists: false } }] };
    const items = await InventoryItem.find(query).sort({ expirationDate: 1 });
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/inventory/analytics
// @desc    Get Inventory Analytics
router.get('/analytics', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const familyCode = await getUserFamilyCode(userId);
    const query = familyCode ? { familyCode } : { $or: [{ user: null }, { user: { $exists: false } }] };
    const items = await InventoryItem.find(query);
    
    // We can just return the total items count instead of CO2
    res.json({ totalItemsSaved: items.length });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/inventory
// @desc    Add a new inventory item manually
router.post('/', validateInventoryCreate, async (req, res) => {
  try {
    const { name, category, expirationDate, quantity } = req.body;
    const userId = req.headers['x-user-id'];
    const familyCode = await getUserFamilyCode(userId);
    const newItem = new InventoryItem({
      name,
      category,
      expirationDate,
      quantity,
      user: userId || undefined,
      familyCode: familyCode || 'DEFAULT'
    });
    const item = await newItem.save();
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/inventory/scan
// @desc    Upload image for CV scan and Groq AI response
router.post('/scan', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No image file uploaded' });
    }
    
    console.log('Image uploaded successfully:', req.file.path);

    const prompt = "Analyze this image, which may be a photo of a fridge/pantry OR a grocery receipt. Identify the food items. Return a JSON object with an 'items' array where each object has: 'name' (string), 'category' (Produce/Dairy/Meat/Grains/Beverages/Misc), 'confidenceScore' (number 0-100), 'expirationDays' (number, realistic shelf life in days), 'preservationTip' (string, hack), and 'box' (array of 4 numbers [ymin, xmin, ymax, xmax] from 0 to 1000 representing bounding box, or [0,0,0,0] if it's a receipt).";
    
    const imageBase64 = fs.readFileSync(req.file.path).toString("base64");
    console.log('Sending image to Groq Vision API...');
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.2-90b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${req.file.mimetype};base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq Vision API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || '{}';
    
    let detectedItems = [];
    try {
        const parsed = JSON.parse(responseText.trim());
        detectedItems = Array.isArray(parsed) ? parsed : (parsed.items || parsed.food_items || []);
        console.log('Successfully parsed structured output from Groq Vision:', detectedItems.length, 'items');
    } catch (e) {
        console.error('Failed to parse Groq Vision JSON:', e);
        detectedItems = [
            { name: 'Scanned Item', category: 'Misc', confidenceScore: 80, expirationDays: 5, box: [500, 500, 500, 500], preservationTip: 'Store properly.' }
        ];
    }

    const userId = req.headers['x-user-id'];
    const familyCode = await getUserFamilyCode(userId);

    // Map to our DB schema
    const itemsToSave = detectedItems.map(item => ({
        name: item.name || 'Unknown',
        category: item.category || 'Produce',
        confidenceScore: item.confidenceScore || 90,
        expirationDate: new Date(Date.now() + (item.expirationDays || 7) * 24 * 60 * 60 * 1000),
        preservationTip: item.preservationTip || 'Store in a cool, dry place.',
        user: userId || undefined,
        familyCode: familyCode || 'DEFAULT'
    }));

    // Save detected items to database
    let savedItems = [];
    try {
        savedItems = await InventoryItem.insertMany(itemsToSave);
    } catch (dbErr) {
        console.error('Failed to save to DB:', dbErr.message);
        return res.status(500).json({ msg: 'Failed to save scanned items to database', error: dbErr.message });
    }
    
    // Attach bounding boxes for frontend AR tags
    const scannedItemsWithBoxes = detectedItems.map(item => ({
        name: item.name,
        confidenceScore: item.confidenceScore || 90,
        expirationDays: item.expirationDays || 7,
        preservationTip: item.preservationTip || 'Store properly.',
        box: item.box || [500, 500, 500, 500]
    }));

    // Save to Scan History
    const fileName = req.file.filename;
    const scanHistory = new ScanHistory({
        user: userId || 'anonymous',
        familyCode: familyCode || 'DEFAULT',
        imageUrl: `http://localhost:5000/uploads/${fileName}`,
        fileName: fileName
    });
    
    try {
        await scanHistory.save();
    } catch (histErr) {
        console.error('Failed to save scan history:', histErr.message);
    }

    res.json({ message: 'Scan successful', items: savedItems, scannedItems: scannedItemsWithBoxes, scanRecord: scanHistory });
  } catch (err) {
    console.error('Groq Vision Failed:', err.message);
    
    // FALLBACK: Return mock scan data if API fails
    const mockItems = [
      { name: 'Apples', category: 'Produce', confidenceScore: 92, expirationDays: 7, preservationTip: 'Keep in crisper drawer.', box: [100, 100, 200, 200] },
      { name: 'Milk', category: 'Dairy', confidenceScore: 88, expirationDays: 5, preservationTip: 'Store in back of fridge, not door.', box: [300, 300, 400, 400] }
    ];
    
    const userId = req.headers['x-user-id'];
    const familyCode = await getUserFamilyCode(userId);

    const itemsToSave = mockItems.map(item => ({
        name: item.name,
        category: item.category,
        confidenceScore: item.confidenceScore,
        expirationDate: new Date(Date.now() + item.expirationDays * 24 * 60 * 60 * 1000),
        preservationTip: item.preservationTip,
        user: userId || undefined,
        familyCode: familyCode || 'DEFAULT'
    }));

    let savedItems = [];
    try {
        savedItems = await InventoryItem.insertMany(itemsToSave);
    } catch (dbErr) {
        return res.status(500).json({ msg: 'Failed to save scanned items to database', error: dbErr.message });
    }

    const scannedItemsWithBoxes = mockItems.map(item => ({
        name: item.name,
        confidenceScore: item.confidenceScore,
        expirationDays: item.expirationDays,
        preservationTip: item.preservationTip,
        box: item.box
    }));

    const scanHistory = new ScanHistory({
        user: userId || 'anonymous',
        familyCode: familyCode || 'DEFAULT',
        imageUrl: `http://localhost:5000/uploads/${req.file ? req.file.filename : 'mock'}`,
        fileName: req.file ? req.file.filename : 'mock'
    });
    
    try {
        await scanHistory.save();
    } catch (e) {}

    return res.json({ message: 'Mock scan successful', items: savedItems, scannedItems: scannedItemsWithBoxes, scanRecord: scanHistory });
  }
});

// @route   PUT /api/inventory/:id
// @desc    Update an item
router.put('/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });

    const updatedItem = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/inventory/:id
// @desc    Delete an item
router.delete('/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });

    // TC-05 FIX: Verify ownership before allowing deletion
    const userId = req.headers['x-user-id'];
    if (item.user && item.user.toString() !== userId) {
      return res.status(403).json({ msg: 'Forbidden: You do not own this item' });
    }
    
    await InventoryItem.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// VOICE NGOS
const VOICE_NGOS = [
  { id: 'ngo_loc_1', name: 'Eco-Pantry Food Rescue Alliance', distance: '1.4 km', type: 'Food Bank' },
  { id: 'ngo_loc_2', name: 'Robin Hood Rescue Kitchen', distance: '2.8 km', type: 'Community Kitchen' },
  { id: 'ngo_loc_3', name: 'Local Charity & Care Home', distance: '4.2 km', type: 'Shelter' }
];

// Voice Assistant Intent Processor using Groq (llama-3.3-70b-versatile)
async function handleVoiceAssistantIntent(transcript, userId) {
  // 1. Fetch user profile
  let userDetails = { name: 'Eco Chef', dietaryRestrictions: 'None', householdSize: 2 };
  if (userId) {
    try {
      const dbUser = await User.findById(userId);
      if (dbUser) userDetails = dbUser;
    } catch (e) {}
  }

  // 2. Fetch inventory items
  const familyCode = await getUserFamilyCode(userId);
  const query = familyCode ? { familyCode } : (userId ? { user: userId } : { $or: [{ user: null }, { user: { $exists: false } }] });
  const inventory = await InventoryItem.find(query).sort({ expirationDate: 1 });
  const inventorySummary = inventory.map(i => {
    const days = Math.ceil((new Date(i.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
    return `${i.name} (qty: ${i.quantity || 1}, expires in ${days} days)`;
  }).join(', ');

  const ngosSummary = VOICE_NGOS.map(n => `${n.name} (${n.distance}, ${n.type})`).join(', ');

  // 3. Prompt Groq (llama-3.3-70b-versatile) to classify and extract arguments
  const prompt = `Analyze the following voice command transcript from a pantry/fridge culinary app user: "${transcript}".
You must determine the user's intent, extract any arguments, and generate a natural spoken response as "assistantReply".

CONTEXT:
- User's Name: ${userDetails.name}
- Current Inventory: [ ${inventorySummary || 'Pantry is empty'} ]
- Nearby NGOs: [ ${ngosSummary} ]

Supported intents:
1. "add_item": Add food items to the inventory. Arguments: "items" (array of objects with 'name', 'category' (Produce/Dairy/Meat/Grains/Beverages/Misc), 'expirationDays' (number, default 7), 'quantity' (number, default 1), 'preservationTip' (string, optional)).
2. "remove_item": Delete items from inventory. Arguments: "items" (array of strings representing names of items to delete).
3. "check_inventory": Check what is currently in the pantry. Arguments: none.
4. "check_expiry": Check which items are expiring soon. Arguments: none.
5. "generate_recipes": Ask to generate recipes using pantry items. Arguments: none.
6. "search_item": Search for a specific item. Arguments: "query" (string, the item name).
7. "find_ngo": Find nearby NGOs or charities to donate food. Arguments: none.
8. "create_shopping_list": Add items to a shopping list. Arguments: "items" (array of strings representing shopping list items).
9. "donate_food": Donate food items. Arguments: "items" (array of objects with 'name' and 'quantity' to donate).
10. "ask_question": General sustainability, storage, cooking, or app question. Arguments: "question" (string, the question asked).

Return a JSON object with:
- "intent": (string, one of the 10 intents above)
- "arguments": (object with the intent's arguments as specified above, or empty object)
- "assistantReply": (string, a spoken response to be read aloud via Text-to-Speech immediately confirming the action or answering the query)`;

  console.log(`Processing voice assistant intent for transcript: "${transcript}"`);
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a smart voice assistant for Eco-Pantry. Output JSON format only.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    throw new Error(`Groq Voice Error: ${response.status} ${await response.text()}`);
  }

  const resData = await response.json();
  const resText = resData.choices?.[0]?.message?.content || '{}';
  const parsed = JSON.parse(resText.trim());

  let result = {
    intent: parsed.intent || 'ask_question',
    reply: parsed.assistantReply || "I'm sorry, I couldn't process that request."
  };

  // 4. Execute side-effects on the DB based on intent
  if (result.intent === 'add_item' && parsed.arguments?.items?.length > 0) {
    const itemsToSave = parsed.arguments.items.map(item => ({
      name: item.name || 'Unknown',
      category: item.category || 'Produce',
      confidenceScore: 100,
      expirationDate: new Date(Date.now() + (item.expirationDays || 7) * 24 * 60 * 60 * 1000),
      quantity: item.quantity || 1,
      preservationTip: item.preservationTip || 'Store properly.',
      user: userId || undefined,
      familyCode: familyCode || 'DEFAULT'
    }));
    const savedItems = await InventoryItem.insertMany(itemsToSave);
    result.items = savedItems;
  } 
  
  else if (result.intent === 'remove_item' && parsed.arguments?.items?.length > 0) {
    const namesToDelete = parsed.arguments.items;
    for (const name of namesToDelete) {
      const dbQuery = {
        ...query,
        name: { $regex: new RegExp(`^${name}$`, 'i') }
      };
      await InventoryItem.deleteMany(dbQuery);
    }
    result.removedNames = namesToDelete;
  } 
  
  else if (result.intent === 'generate_recipes') {
    // Generate recipes using top 3 expiring items
    const expiringItems = await InventoryItem.find(query).sort({ expirationDate: 1 }).limit(3);
    const expiringNames = expiringItems.map(item => item.name);
    
    if (expiringNames.length > 0) {
      const recipePrompt = `You are a Zero-Waste culinary expert. Generate exactly 2 unique, zero-waste recipes using these ingredients: ${expiringNames.join(', ')}.
Return a JSON object containing a 'recipes' field which is an array of recipe objects. Each recipe object must have:
- 'title' (string)
- 'description' (string, MUST include calculated savings in ₹)
- 'matchScore' (number 0-100)
- 'matchedIngredients' (array of strings)
- 'missingIngredients' (array of strings)
- 'instructions' (array of strings)`;

      const recipeRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: recipePrompt }],
          response_format: { type: 'json_object' }
        })
      });

      if (recipeRes.ok) {
        const rData = await recipeRes.json();
        const rParsed = JSON.parse(rData.choices?.[0]?.message?.content || '{}');
        const generatedRecipes = rParsed.recipes || [];
        
        const recipesToSave = generatedRecipes.map(recipe => ({
          ...recipe,
          user: userId || undefined,
          familyCode: familyCode || 'DEFAULT'
        }));
        
        if (recipesToSave.length > 0) {
          result.recipes = await Recipe.insertMany(recipesToSave);
        }
      }
    }
  } 
  
  else if (result.intent === 'create_shopping_list' && parsed.arguments?.items?.length > 0) {
    result.shoppingItems = parsed.arguments.items;
  } 
  
  else if (result.intent === 'donate_food' && parsed.arguments?.items?.length > 0) {
    const donationItems = parsed.arguments.items;
    // Remove from inventory
    for (const item of donationItems) {
      const dbQuery = { ...query, name: { $regex: new RegExp(`^${item.name}$`, 'i') } };
      const invItem = await InventoryItem.findOne(dbQuery);
      if (invItem) {
        if (invItem.quantity > item.quantity) {
          invItem.quantity -= item.quantity;
          await invItem.save();
        } else {
          await InventoryItem.findByIdAndDelete(invItem._id);
        }
      }
    }
    
    // Save donation record
    const donation = new Donation({
      user: userId || 'anonymous',
      ngoId: VOICE_NGOS[0].id,
      ngoName: VOICE_NGOS[0].name,
      items: donationItems.map(item => ({ name: item.name, quantity: item.quantity || 1 })),
      pickupAddress: 'Default Voice Assistant Address'
    });
    await donation.save();
  }

  return result;
}

// @route   POST /api/inventory/voice
// @desc    Process voice transcript and execute intent using Groq
router.post('/voice', async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) return res.status(400).json({ msg: 'Transcript is required' });

    const userId = req.headers['x-user-id'];
    const result = await handleVoiceAssistantIntent(transcript, userId);

    res.json(result);
  } catch (err) {
    console.error('Voice Assistant Error:', err.message);
    res.status(500).json({ msg: 'Server Error processing voice command', error: err.message });
  }
});

// @route   POST /api/inventory/voice-audio
// @desc    Upload audio file, transcribe via Groq Whisper, and process intent
router.post('/voice-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No audio file uploaded' });
    }

    console.log('Audio uploaded successfully:', req.file.path);

    // Prepare FormData for Groq Whisper
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileBlob = new Blob([fileBuffer], { type: req.file.mimetype });
    const formData = new FormData();
    formData.append('file', fileBlob, req.file.filename);
    formData.append('model', 'whisper-large-v3');

    console.log('Sending audio to Groq Whisper API...');
    const whisperRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: formData
    });

    if (!whisperRes.ok) {
        const errorText = await whisperRes.text();
        throw new Error(`Groq Whisper Error: ${whisperRes.status} ${errorText}`);
    }

    const whisperData = await whisperRes.json();
    const transcript = whisperData.text || '';
    
    // Clean up file
    fs.unlinkSync(req.file.path);

    if (!transcript.trim()) {
      return res.status(400).json({ msg: 'No speech detected in audio' });
    }

    console.log('Transcribed text:', transcript);

    const userId = req.headers['x-user-id'];
    const result = await handleVoiceAssistantIntent(transcript, userId);

    result.transcript = transcript;

    res.json(result);
    
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    console.error('Voice Audio Assistant Error:', err.message);
    res.status(500).json({ msg: 'Server Error processing voice audio', error: err.message });
  }
});

// @route   POST /api/inventory/deduct
// @desc    Deduct inventory items when a recipe is cooked
router.post('/deduct', async (req, res) => {
  try {
    const { ingredients } = req.body;
    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ msg: 'Ingredients array is required' });
    }

    const userId = req.headers['x-user-id'];
    const query = userId ? { user: userId } : { $or: [{ user: null }, { user: { $exists: false } }] };

    const items = await InventoryItem.find(query);
    let deductedCount = 0;

    for (const ingredientName of ingredients) {
      // Find the best match ignoring case and partial matches
      const itemToDeduct = items.find(item => 
        item.name.toLowerCase().includes(ingredientName.toLowerCase()) || 
        ingredientName.toLowerCase().includes(item.name.toLowerCase())
      );

      if (itemToDeduct) {
        if (itemToDeduct.quantity > 1) {
          itemToDeduct.quantity -= 1;
          await itemToDeduct.save();
          deductedCount++;
        } else {
          await InventoryItem.findByIdAndDelete(itemToDeduct._id);
          deductedCount++;
        }
      }
    }

    res.json({ message: `Successfully deducted ${deductedCount} items from inventory.`, deductedCount });
  } catch (err) {
    console.error(err.message);
        res.status(500).json({ msg: 'API Error: ' + err.message });
    }
});

// NEW ENDPOINT: Save items detected by local TensorFlow (coco-ssd) model
router.post('/save-local-scan', async (req, res) => {
    const userId = req.headers['x-user-id'] !== 'anonymous' ? req.headers['x-user-id'] : null;
    const { detectedItems } = req.body;

    if (!detectedItems || !Array.isArray(detectedItems)) {
        return res.status(400).json({ msg: 'No items provided' });
    }

    try {
        // Clear previous inventory to avoid infinitely stacking
        const deleteQuery = userId ? { user: userId } : { $or: [{ user: null }, { user: { $exists: false } }] };
        await InventoryItem.deleteMany(deleteQuery);

        const itemsToSave = detectedItems.map(item => ({
            name: item.name || 'Unknown',
            category: 'Produce', // Simplified
            confidenceScore: item.confidenceScore || 90,
            expirationDate: new Date(Date.now() + (item.expirationDays || 7) * 24 * 60 * 60 * 1000),
            preservationTip: item.preservationTip || 'Store properly.',
            user: userId || undefined
        }));

        const savedItems = await InventoryItem.insertMany(itemsToSave);

        // Save to Scan History
        const newScan = new ScanHistory({
            user: userId || undefined,
            date: new Date(),
            itemsCount: savedItems.length,
            imageUrl: 'local-tensorflow-scan.jpg'
        });
        const scanHistory = await newScan.save();

        res.json({
            message: 'Scan successful',
            items: savedItems,
            scannedItems: detectedItems, // Pass back directly for AR tags
            scanRecord: scanHistory
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error saving scan data' });
    }
});

// @route   GET /api/inventory/scans
// @desc    Get user's scan history
router.get('/scans', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const scans = await ScanHistory.find({ user: userId }).sort({ createdAt: -1 });
    res.json(scans);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
