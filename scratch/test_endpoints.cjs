const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testChat() {
  console.log('Testing /api/chat endpoint...');
  try {
    const res = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'offline_test_user'
      },
      body: JSON.stringify({
        message: 'Tell me a simple preservation hack for bananas and list 2 recipes.'
      })
    });
    const data = await res.json();
    console.log('Chat Status:', res.status);
    console.log('Chat Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Chat test failed:', err);
  }
}

async function testVoice() {
  console.log('Testing /api/inventory/voice endpoint...');
  try {
    const res = await fetch('http://localhost:5000/api/inventory/voice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'offline_test_user'
      },
      body: JSON.stringify({
        transcript: 'I just bought 3 apples and a carton of milk'
      })
    });
    const data = await res.json();
    console.log('Voice Status:', res.status);
    console.log('Voice Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Voice test failed:', err);
  }
}

async function run() {
  await testChat();
  await sleep(3000); // Wait 3 seconds to avoid rate limits
  await testVoice();
}

run();
