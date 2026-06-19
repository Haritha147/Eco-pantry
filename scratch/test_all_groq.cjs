const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const mongoose = require(path.join(__dirname, '../server/node_modules/mongoose'));

async function runRequest(endpoint, method, headers, payload, name) {
  console.log(`\n========================================\nTesting ${name} (${endpoint})...`);
  try {
    const res = await fetch(`http://localhost:5000${endpoint}`, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: payload ? JSON.stringify(payload) : undefined
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    return { status: res.status, data };
  } catch (err) {
    console.error(`${name} test failed:`, err);
    return { status: 500, err };
  }
}

async function main() {
  const email = `settings_test_${Date.now()}@example.com`;
  const password = 'password123';
  const newPassword = 'newpassword456';

  // 1. Register User
  const reg = await runRequest('/api/auth/register', 'POST', {}, {
    name: 'Settings Tester',
    email: email,
    password: password
  }, 'User Registration');
  await sleep(2000);

  // 2. Connect to MongoDB to fetch OTP
  console.log('Connecting to MongoDB Atlas...');
  const mongoUri = process.env.MONGO_URI || 'mongodb+srv://admin123:haritha123@mern.ckxkvny.mongodb.net/eco-pantry?appName=MERN';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB. Querying OTP...');
  
  // Define User schema simply for reading
  const UserSchema = new mongoose.Schema({
    email: String,
    otp: String
  }, { collection: 'users' });
  
  const User = mongoose.models.User || mongoose.model('User', UserSchema);
  
  const user = await User.findOne({ email: email.toLowerCase() });
  const otpCode = user ? user.otp : null;
  console.log('Fetched OTP Code from database:', otpCode);
  
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');

  if (!otpCode) {
    console.error('Could not find OTP code in database. Exiting.');
    return;
  }

  // 3. Verify User with fetched OTP
  const verify = await runRequest('/api/auth/verify', 'POST', {}, {
    email: email,
    otp: otpCode
  }, 'OTP Verification');
  await sleep(1500);

  // 4. Login with current password to get JWT token
  const login = await runRequest('/api/auth/login', 'POST', {}, {
    email: email,
    password: password
  }, 'Login with Old Password');
  await sleep(1500);

  const token = login.data.token;
  if (!token) {
    console.error('Failed to obtain JWT token. Skipping password change tests.');
    return;
  }

  const authHeader = { 'Authorization': `Bearer ${token}` };

  // 5. Change Password (JWT Authorized)
  await runRequest('/api/auth/change-password', 'POST', authHeader, {
    currentPassword: password,
    newPassword: newPassword
  }, 'Change Password (JWT Authorized)');
  await sleep(1500);

  // 6. Try logging in with the OLD password (should fail)
  await runRequest('/api/auth/login', 'POST', {}, {
    email: email,
    password: password
  }, 'Login with Old Password (Should Fail)');
  await sleep(1500);

  // 7. Login with the NEW password (should succeed)
  const loginNew = await runRequest('/api/auth/login', 'POST', {}, {
    email: email,
    password: newPassword
  }, 'Login with New Password (Should Succeed)');
  await sleep(1500);

  const newToken = loginNew.data.token;
  const newAuthHeader = { 'Authorization': `Bearer ${newToken}` };

  // 8. Update User Profile Settings (JWT Authorized)
  await runRequest('/api/auth/profile', 'PUT', newAuthHeader, {
    dietaryRestrictions: 'Vegan',
    householdSize: 3
  }, 'Update Profile settings (JWT Authorized)');
}

main();
