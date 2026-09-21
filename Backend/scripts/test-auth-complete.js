// test-auth-complete.js
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import config from '../src/config/env.js';

const BASE_URL = 'http://localhost:5000';

async function runCompleteAuthAudit() {
  console.log('🚀 Running Complete Phase 4 Authentication Verification Suite...\n');

  // Connect to DB directly to verify schema
  await mongoose.connect(config.mongoUri);
  console.log('📦 Connected to MongoDB Atlas for model verification.');

  const suffix = Math.floor(Math.random() * 1000000);
  const customerEmail = `customer_${suffix}@kirana.test`;
  const customerPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const rawPassword = 'SecretPassword!123';

  // TEST 1: User Schema Verification
  console.log('\n--- TEST 1: User Schema Fields ---');
  const userSchemaPaths = Object.keys(User.schema.paths);
  const requiredFields = [
    'name',
    'email',
    'phone',
    'passwordHash',
    'role',
    'avatar',
    'addresses',
    'isActive',
    'createdAt',
    'updatedAt'
  ];
  for (const field of requiredFields) {
    if (userSchemaPaths.includes(field)) {
      console.log(`  ✅ Field "${field}" exists in Mongoose schema`);
    } else {
      throw new Error(`Missing required field "${field}" in User schema`);
    }
  }

  // Verify Roles enum
  const allowedRoles = User.schema.path('role').enumValues;
  const expectedRoles = ['customer', 'admin', 'manager', 'staff', 'delivery'];
  const allRolesPresent = expectedRoles.every(r => allowedRoles.includes(r));
  if (allRolesPresent) {
    console.log(`  ✅ Roles enum contains: ${allowedRoles.join(', ')}`);
  } else {
    throw new Error(`Roles missing. Expected: ${expectedRoles.join(', ')}, got: ${allowedRoles.join(', ')}`);
  }

  // TEST 2: POST /api/auth/register (Testing direct /api/auth endpoint path)
  console.log('\n--- TEST 2: POST /api/auth/register ---');
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Ananya Verma',
      email: customerEmail,
      phone: customerPhone,
      password: rawPassword,
      role: 'customer'
    })
  });
  const regJson = await regRes.json();
  if (regRes.status !== 201) throw new Error(`Register status ${regRes.status}: ${JSON.stringify(regJson)}`);
  console.log(`  ✅ Status: ${regRes.status} Created`);
  console.log(`  ✅ Returned user:`, {
    id: regJson.data.user._id,
    name: regJson.data.user.name,
    email: regJson.data.user.email,
    role: regJson.data.user.role,
    isActive: regJson.data.user.isActive
  });

  // TEST 3: Security - Never return passwordHash
  console.log('\n--- TEST 3: Security: passwordHash is never returned ---');
  if (regJson.data.user.passwordHash !== undefined) {
    throw new Error('SECURITY VIOLATION: passwordHash was leaked in registration response!');
  }
  console.log('  ✅ passwordHash is strictly omitted from API response');

  // TEST 4: Duplicate Email Rejection (409)
  console.log('\n--- TEST 4: Duplicate Email Rejection (409 Conflict) ---');
  const dupEmailRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Another Person',
      email: customerEmail,
      phone: `92${Math.floor(10000000 + Math.random() * 90000000)}`,
      password: rawPassword
    })
  });
  const dupEmailJson = await dupEmailRes.json();
  if (dupEmailRes.status !== 409) throw new Error(`Expected 409, got ${dupEmailRes.status}`);
  console.log(`  ✅ Status 409 Conflict returned: "${dupEmailJson.message}"`);

  // TEST 5: Duplicate Phone Rejection (409)
  console.log('\n--- TEST 5: Duplicate Phone Rejection (409 Conflict) ---');
  const dupPhoneRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Another Person',
      email: `another_${suffix}@kirana.test`,
      phone: customerPhone,
      password: rawPassword
    })
  });
  const dupPhoneJson = await dupPhoneRes.json();
  if (dupPhoneRes.status !== 409) throw new Error(`Expected 409, got ${dupPhoneRes.status}`);
  console.log(`  ✅ Status 409 Conflict returned: "${dupPhoneJson.message}"`);

  // TEST 6: Login with invalid credentials (401)
  console.log('\n--- TEST 6: Invalid Credentials Handling (401 Unauthorized) ---');
  const invalidLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: customerEmail,
      password: 'IncorrectPassword'
    })
  });
  const invalidLoginJson = await invalidLoginRes.json();
  if (invalidLoginRes.status !== 401) throw new Error(`Expected 401, got ${invalidLoginRes.status}`);
  console.log(`  ✅ Status 401 Unauthorized returned: "${invalidLoginJson.message}"`);

  // TEST 7: Login Success with Email & Phone
  console.log('\n--- TEST 7: POST /api/auth/login with valid credentials ---');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: customerPhone, // Testing phone login
      password: rawPassword
    })
  });
  const loginJson = await loginRes.json();
  if (loginRes.status !== 200) throw new Error(`Expected 200, got ${loginRes.status}`);
  const customerAccessToken = loginJson.data.accessToken;
  const customerRefreshToken = loginJson.data.refreshToken;
  console.log(`  ✅ Status 200 OK. Received accessToken & refreshToken.`);
  console.log(`  ✅ passwordHash omitted from login: ${loginJson.data.user.passwordHash === undefined}`);

  // TEST 8: GET /api/auth/me with Bearer token
  console.log('\n--- TEST 8: GET /api/auth/me with Bearer token ---');
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${customerAccessToken}` }
  });
  const meJson = await meRes.json();
  if (meRes.status !== 200) throw new Error(`Expected 200, got ${meRes.status}`);
  console.log(`  ✅ Status 200 OK. Fetched current user: ${meJson.data.user.name} (${meJson.data.user.role})`);
  console.log(`  ✅ passwordHash omitted from GET /me: ${meJson.data.user.passwordHash === undefined}`);

  // TEST 9: Expired/Missing Session (401)
  console.log('\n--- TEST 9: Protected endpoint with no token (401) ---');
  const noAuthRes = await fetch(`${BASE_URL}/api/auth/me`);
  const noAuthJson = await noAuthRes.json();
  if (noAuthRes.status !== 401) throw new Error(`Expected 401, got ${noAuthRes.status}`);
  console.log(`  ✅ Status 401 correctly returned: "${noAuthJson.message}"`);

  // TEST 10: Refresh Token Rotation
  console.log('\n--- TEST 10: Refresh Token Rotation ---');
  const refreshRes = await fetch(`${BASE_URL}/api/v1/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: customerRefreshToken })
  });
  const refreshJson = await refreshRes.json();
  if (refreshRes.status !== 200 || !refreshJson.data.accessToken) {
    throw new Error(`Refresh token failed: ${JSON.stringify(refreshJson)}`);
  }
  console.log(`  ✅ New Access Token received successfully!`);

  // Clean up test customer from database
  await User.deleteOne({ email: customerEmail });
  console.log('\n🧹 Test customer cleaned from database.');

  await mongoose.disconnect();
  console.log('\n🎉 ALL 10 PHASE 4 AUTHENTICATION AUDIT TESTS PASSED WITH 100% SUCCESS!');
}

runCompleteAuthAudit().catch(err => {
  console.error('\n❌ Audit Failure:', err);
  process.exit(1);
});
