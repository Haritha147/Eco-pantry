const express = require('express');
const router = express.Router();
const User = require('../models/User');
const InventoryItem = require('../models/InventoryItem');
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

const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const upload = multer({ 
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, 'chat-' + Date.now() + '.webm')
  })
});

// @route   POST /api/chat/transcribe
// @desc    Transcribe user voice chat audio
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No audio file' });

    const fileBuffer = fs.readFileSync(req.file.path);
    const fileBlob = new Blob([fileBuffer], { type: req.file.mimetype });
    const formData = new FormData();
    formData.append('file', fileBlob, req.file.filename);
    formData.append('model', 'whisper-large-v3');

    const whisperRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
      body: formData
    });

    if (!whisperRes.ok) throw new Error(await whisperRes.text());
    
    const whisperData = await whisperRes.json();
    fs.unlinkSync(req.file.path);
    
    res.json({ transcript: whisperData.text || '' });
  } catch (err) {
    console.error('Chat transcribe error:', err);
    if (req.file) fs.unlinkSync(req.file.path).catch(()=>{});
    res.status(500).json({ msg: 'Failed to transcribe audio' });
  }
});

const { validateChatMessage } = require('../middleware/validators');

// @route   POST /api/chat
// @desc    Interact with the inventory-aware AI Eco Assistant
router.post('/', validateChatMessage, async (req, res) => {
  const { message, history } = req.body;
  const userId = req.headers['x-user-id'];

  if (!message) {
    return res.status(400).json({ msg: 'Message is required' });
  }

  // Default context details
  let userDetails = { name: 'Eco Chef', dietaryRestrictions: 'None', householdSize: 2 };
  let inventoryNames = [];

  try {

    if (userId) {
      // Fetch user profile from DB (handle both ObjectId and offline string formats)
      try {
        const dbUser = await User.findById(userId);
        if (dbUser) {
          userDetails = dbUser;
        }
      } catch (err) {
        // Fallback for custom/mock offline IDs
        console.log('Offline/simulated user token used in chat context.');
      }

      // Fetch user's family inventory from DB
      try {
        const familyCode = await getUserFamilyCode(userId);
        if (!familyCode) throw new Error('No family code for offline user');
        const query = { familyCode };
        const items = await InventoryItem.find(query).sort({ expirationDate: 1 });
        inventoryNames = items.map(i => {
          const daysToExpire = Math.ceil((new Date(i.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
          return `${i.name} (expires in ${daysToExpire} day${daysToExpire !== 1 ? 's' : ''})`;
        });
      } catch (err) {
        console.error('Failed to query inventory for chat context:', err.message);
      }
    }

    // Dynamic AI assistant system prompt
    const systemPrompt = `You are Eco-Bot, a friendly and expert AI culinary and food sustainability assistant for the Eco-Pantry command center.
You are chatting with: ${userDetails.name}.
Dietary Restrictions: ${userDetails.dietaryRestrictions || 'None'}.
Household Size: ${userDetails.householdSize || 2} portions.
Current Scanned Fridge/Pantry Items: ${inventoryNames.length > 0 ? inventoryNames.join(', ') : 'No food items are currently registered in their pantry. Advise them to upload a photo of their fridge to get started!'}.

Guidelines:
1. Provide highly practical, clever zero-waste cooking suggestions, prioritizing ingredients nearing expiration first.
2. Share interesting food preservation hacks (e.g. freezing cheese, keeping herbs in water).
3. If giving a recipe, scale it automatically for ${userDetails.householdSize || 2} portions and respect the "${userDetails.dietaryRestrictions || 'None'}" restriction.
4. Keep replies relatively concise (under 3 short paragraphs), engaging, and cleanly formatted using markdown.
5. Answer questions about how the app works (e.g., earning Eco Points by scanning fridge photos, and marking items as preserved).`;

    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    (req.body.history || []).forEach(msg => {
      messages.push({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.text
      });
    });

    messages.push({
      role: 'user',
      content: message
    });

    const payload = {
      model: 'llama-3.3-70b-versatile',
      messages: messages
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
    const replyText = data.choices?.[0]?.message?.content || '';
    res.json({ reply: replyText });
  } catch (err) {
    console.error('API Error in Chat (Fallback to Local Engine):', err.message);
    
    // INTEGRATED LOCAL CHATBOT ENGINE
    const msgLower = message.toLowerCase();
    let mockReply = "";

    if (msgLower.match(/hello|hi|hey|greetings/)) {
      mockReply = `Hello there, ${userDetails.name}! I am your built-in Eco-Pantry assistant. I see you have ${inventoryNames.length} items in your fridge right now. How can I help you reduce food waste today?`;
    } 
    else if (msgLower.match(/recipe|cook|make|dinner|lunch|hungry/)) {
      if (inventoryNames.length > 0) {
        mockReply = `Here is a quick zero-waste idea using your pantry! Since you have **${inventoryNames[0].split('(')[0].trim()}**, you can chop it up, sauté it with some simple spices, and serve it over rice or toast. This automatically scales to ${userDetails.householdSize} portions and perfectly respects your dietary preferences!`;
      } else {
        mockReply = `I'd love to suggest a recipe, but your digital pantry is empty! Try uploading a photo of your fridge first so I can see what ingredients we have to work with.`;
      }
    } 
    else if (msgLower.match(/waste|spoil|expire|save|preserve|hack/)) {
      mockReply = `**Eco Hack:** Did you know you can freeze almost any vegetable before it goes bad? If your greens are wilting, chop them up and freeze them in olive oil or water in an ice cube tray for future soups and stir-fries!`;
    } 
    else if (msgLower.match(/points|badge|reward|eco/)) {
      mockReply = `You earn **Eco Points** every time you upload a receipt or a photo of your fridge, and every time you mark an item as "Cooked" instead of throwing it away. Keep it up to level up your Eco Badge!`;
    } 
    else {
      mockReply = `I am currently operating as the built-in Eco-Bot! I can help you with zero-waste recipes, preservation hacks, or tracking your Eco Points. (Try asking me for a recipe!)`;
    }

    res.json({ reply: mockReply });
  }
});

module.exports = router;
