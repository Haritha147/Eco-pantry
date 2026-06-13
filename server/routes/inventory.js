const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const InventoryItem = require('../models/InventoryItem');
const ScanHistory = require('../models/ScanHistory');
const User = require('../models/User');

// Raw fetch used for Gemini to ensure API key works correctly

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
router.post('/', async (req, res) => {
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
// @desc    Upload image for CV scan and mock AI response
router.post('/scan', upload.single('image'), async (req, res) => {
  try {
    // req.file contains the uploaded image information
    if (!req.file) {
      return res.status(400).json({ msg: 'No image file uploaded' });
    }
    
    console.log('Image uploaded successfully:', req.file.path);

    // Send to Gemini Vision
    const prompt = "Analyze this image, which may be a photo of a fridge/pantry OR a grocery receipt. If it is a fridge/pantry, identify the major food items clearly visible. If it is a receipt, extract the purchased food items from the text. For each identified item, ensure that the 'expirationDays' is a highly accurate and realistic estimate for the specific food item's general shelf life. For each item, provide a clever preservation hack to extend its life. Output the bounding box 'box' array as exactly 4 integers [ymin, xmin, ymax, xmax] normalized from 0 to 1000 representing the bounding box of the item in the image (if it's a receipt, just provide [0,0,0,0] for the box).";
    
    const imageBase64 = fs.readFileSync(req.file.path).toString("base64");
    console.log('Sending image to Groq Vision API...');
    
    const payload = {
      model: 'llama-3.2-90b-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'List every food item you can identify in this image. For each item provide: name, category (Produce/Dairy/Meat/Grains/Beverages/Misc), confidenceScore (0-100), expirationDays (realistic shelf life), preservationTip (a clever hack), and box [0,0,0,0]. Return ONLY a raw JSON array of objects, no markdown.' },
            { type: 'image_url', image_url: { url: `data:${req.file.mimetype};base64,${imageBase64}` } }
          ]
        }
      ]
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq Vision API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || '';
    
    let detectedItems = [];
    try {
        detectedItems = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());
        console.log('Successfully parsed structured output:', detectedItems.length, 'items');
    } catch (e) {
        console.error('Failed to parse Gemini JSON:', e);
        require('fs').writeFileSync('gemini_error.log', e.stack || e.message);
        // Fallback if parsing fails
        detectedItems = [
            { name: 'Unknown Item', category: 'Misc', confidenceScore: 50, expirationDays: 5, box: [500, 500, 500, 500] }
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
        // Append to inventory instead of replacing
        savedItems = await InventoryItem.insertMany(itemsToSave);
    } catch (dbErr) {
        console.error('Failed to save to DB:', dbErr.message);
        return res.status(500).json({ msg: 'Failed to save scanned items to database', error: dbErr.message });
    }
    
    // Attach bounding boxes to the response for the frontend AR tags
    const scannedItemsWithBoxes = detectedItems.map((item, index) => ({
        name: item.name,
        confidenceScore: item.confidenceScore,
        expirationDays: item.expirationDays || 7,
        preservationTip: item.preservationTip || 'Store properly.',
        box: item.box || [500, 500, 500, 500] // default center if missing
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
    console.error('Gemini API Failed:', err.message);
    // FALLBACK: Return mock scan data
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
        console.error('Failed to save to DB:', dbErr.message);
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
// @route   POST /api/inventory/voice
// @desc    Process voice transcript and add items
router.post('/voice', async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) return res.status(400).json({ msg: 'Transcript is required' });

    const prompt = `Extract food items from the following voice transcript: "${transcript}". For each item, provide a highly accurate and realistic estimate for the specific food item's general shelf life. Provide a clever preservation hack. Output a JSON array.`;

    let responseText = '';
    try {
      const payload = {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      };

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API Error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      responseText = data.choices?.[0]?.message?.content || '';
    } catch (apiErr) {
      console.error('Groq API Error in Voice:', apiErr.message);
      responseText = JSON.stringify([
          { name: 'Voice Item 1', category: 'Misc', confidenceScore: 85, expirationDays: 7, preservationTip: 'Keep dry.', box: [0,0,0,0] }
      ]);
    }

    let detectedItems = [];
    try {
        const parsed = JSON.parse(responseText);
        if (Array.isArray(parsed)) {
          detectedItems = parsed;
        } else if (parsed && Array.isArray(parsed.items)) {
          detectedItems = parsed.items;
        } else if (parsed && Array.isArray(parsed.food_items)) {
          detectedItems = parsed.food_items;
        } else if (parsed && typeof parsed === 'object') {
          const firstArrayKey = Object.keys(parsed).find(key => Array.isArray(parsed[key]));
          if (firstArrayKey) {
            detectedItems = parsed[firstArrayKey];
          } else if (parsed.name) {
            detectedItems = [parsed];
          }
        }
    } catch (e) {
        console.error('Failed to parse AI response:', responseText);
        return res.status(500).json({ msg: 'Failed to parse AI response' });
    }

    if (!Array.isArray(detectedItems) || detectedItems.length === 0) {
      return res.json({ items: [] });
    }

    const userId = req.headers['x-user-id'];
    const familyCode = await getUserFamilyCode(userId);

    const itemsToSave = detectedItems.map(item => ({
        name: item.name || 'Unknown',
        category: item.category || 'Produce',
        confidenceScore: item.confidenceScore || 90,
        expirationDate: new Date(Date.now() + (item.expirationDays || 7) * 24 * 60 * 60 * 1000),
        quantity: 1,
        preservationTip: item.preservationTip || 'Keep in a cool, dry place.',
        user: userId || undefined,
        familyCode: familyCode || 'DEFAULT'
    }));

    const savedItems = await InventoryItem.insertMany(itemsToSave);
    res.json({ items: savedItems });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/inventory/voice-audio
// @desc    Upload audio file, transcribe via Groq Whisper, and process items
router.post('/voice-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No audio file uploaded' });
    }

    console.log('Audio uploaded successfully:', req.file.path);

    // Prepare native FormData for Groq Whisper
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

    // Forward transcript to Groq LLM to extract items
    const prompt = `Extract food items from the following voice transcript: "${transcript}". For each item, provide a highly accurate and realistic estimate for the specific food item's general shelf life. Provide a clever preservation hack. Output a JSON array.`;
    let responseText = '';
    
    try {
      const payload = {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      };

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API Error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      responseText = data.choices?.[0]?.message?.content || '';
    } catch (apiErr) {
      console.error('Groq API Error in Voice Extraction:', apiErr.message);
      responseText = JSON.stringify([
          { name: 'Voice Item 1', category: 'Misc', confidenceScore: 85, expirationDays: 7, preservationTip: 'Keep dry.', box: [0,0,0,0] }
      ]);
    }

    let detectedItems = [];
    try {
        const parsed = JSON.parse(responseText);
        if (Array.isArray(parsed)) {
          detectedItems = parsed;
        } else if (parsed && Array.isArray(parsed.items)) {
          detectedItems = parsed.items;
        } else if (parsed && Array.isArray(parsed.food_items)) {
          detectedItems = parsed.food_items;
        } else if (parsed && typeof parsed === 'object') {
          const firstArrayKey = Object.keys(parsed).find(key => Array.isArray(parsed[key]));
          if (firstArrayKey) {
            detectedItems = parsed[firstArrayKey];
          } else if (parsed.name) {
            detectedItems = [parsed];
          }
        }
    } catch (e) {
        console.error('Failed to parse AI response:', responseText);
        return res.status(500).json({ msg: 'Failed to parse AI response' });
    }

    if (!Array.isArray(detectedItems) || detectedItems.length === 0) {
      return res.json({ items: [], transcript });
    }

    const userId = req.headers['x-user-id'];
    const familyCode = await getUserFamilyCode(userId);

    const itemsToSave = detectedItems.map(item => ({
        name: item.name || 'Unknown',
        category: item.category || 'Produce',
        confidenceScore: item.confidenceScore || 90,
        expirationDate: new Date(Date.now() + (item.expirationDays || 7) * 24 * 60 * 60 * 1000),
        quantity: 1,
        preservationTip: item.preservationTip || 'Keep in a cool, dry place.',
        user: userId || undefined,
        familyCode: familyCode || 'DEFAULT'
    }));

    const savedItems = await InventoryItem.insertMany(itemsToSave);
    res.json({ items: savedItems, transcript });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
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
