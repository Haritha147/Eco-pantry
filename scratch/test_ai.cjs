const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../server/.env') });

async function testGemini() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'List 3 fruits' }] }]
      })
    });
    const data = await res.json();
    console.log('Gemini 2.5 Flash status:', res.status);
    console.log('Gemini 2.5 Flash data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Gemini test failed:', err);
  }
}

testGemini();
