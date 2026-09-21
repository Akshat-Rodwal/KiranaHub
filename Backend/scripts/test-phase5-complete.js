// test-phase5-complete.js
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import Category from '../src/models/Category.js';
import User from '../src/models/User.js';
import config from '../src/config/env.js';

const BASE_URL = 'http://localhost:5000';

async function runPhase5Audit() {
  console.log('🚀 Running Complete Phase 5 Products & Categories Verification Suite...\n');

  // Connect to DB directly
  await mongoose.connect(config.mongoUri);
  console.log('📦 Connected to MongoDB Atlas.');

  // TEST 1: Preserve Existing 54 Products and 10 Categories in Atlas
  console.log('\n--- TEST 1: Verify Existing Data in Atlas ---');
  const totalCategories = await Category.countDocuments();
  const totalProducts = await Product.countDocuments();
  console.log(`  Categories in DB: ${totalCategories} (Expected: >= 10)`);
  console.log(`  Products in DB: ${totalProducts} (Expected: >= 54)`);
  if (totalCategories < 10 || totalProducts < 54) {
    throw new Error(`Data loss detected! Found only ${totalCategories} categories and ${totalProducts} products.`);
  }
  console.log('  ✅ Existing Atlas catalogue completely preserved!');

  // TEST 2: Dual Mounted Endpoints (/api/v1/* and /api/*)
  console.log('\n--- TEST 2: Dual-Mounted Endpoints ---');
  const catV1Res = await fetch(`${BASE_URL}/api/v1/categories`);
  const catV1Json = await catV1Res.json();
  const catRootRes = await fetch(`${BASE_URL}/api/categories`);
  const catRootJson = await catRootRes.json();

  if (catV1Res.status !== 200 || catRootRes.status !== 200) {
    throw new Error(`Dual mounting failed for categories! v1: ${catV1Res.status}, root: ${catRootRes.status}`);
  }
  console.log(`  ✅ GET /api/v1/categories: 200 OK (${catV1Json.data.items.length} items)`);
  console.log(`  ✅ GET /api/categories: 200 OK (${catRootJson.data.items.length} items)`);

  const prodV1Res = await fetch(`${BASE_URL}/api/v1/products?limit=2`);
  const prodRootRes = await fetch(`${BASE_URL}/api/products?limit=2`);
  if (prodV1Res.status !== 200 || prodRootRes.status !== 200) {
    throw new Error(`Dual mounting failed for products! v1: ${prodV1Res.status}, root: ${prodRootRes.status}`);
  }
  console.log('  ✅ Dual mounting at /api/v1/* and /api/* verified successfully!');

  // TEST 3: Pagination, Filtering, and Sorting on /api/products
  console.log('\n--- TEST 3: Pagination, Filtering & Sorting ---');
  // 3a. Pagination
  const pagedRes = await fetch(`${BASE_URL}/api/products?page=2&limit=5`);
  const pagedJson = await pagedRes.json();
  if (pagedJson.data.items.length !== 5 || pagedJson.data.pagination.page !== 2) {
    throw new Error(`Pagination failed: ${JSON.stringify(pagedJson.data.pagination)}`);
  }
  console.log('  ✅ Pagination verified: Page 2, 5 items/page, total:', pagedJson.data.pagination.total);

  // 3b. Category filtering
  const catFilterRes = await fetch(`${BASE_URL}/api/products?category=dairy-eggs-bread`);
  const catFilterJson = await catFilterRes.json();
  if (catFilterJson.data.items.length === 0) {
    throw new Error('Category filter for dairy-eggs-bread returned 0 items');
  }
  console.log(`  ✅ Category filtering verified: ${catFilterJson.data.items.length} dairy products returned`);

  // 3c. Price range filtering
  const priceRes = await fetch(`${BASE_URL}/api/products?minPrice=50&maxPrice=150`);
  const priceJson = await priceRes.json();
  const allInRange = priceJson.data.items.every(p => p.price >= 50 && p.price <= 150);
  if (!allInRange) {
    throw new Error('Price range filter failed! Found products outside 50-150 range');
  }
  console.log(`  ✅ Price range filtering verified (50 - 150): ${priceJson.data.items.length} products within bounds`);

  // 3d. Sorting: Price Low-to-High
  const sortAscRes = await fetch(`${BASE_URL}/api/products?sort=price-asc&limit=10`);
  const sortAscJson = await sortAscRes.json();
  const ascPrices = sortAscJson.data.items.map(p => p.price);
  for (let i = 1; i < ascPrices.length; i++) {
    if (ascPrices[i] < ascPrices[i - 1]) {
      throw new Error(`sort=price-asc failed! ${ascPrices.join(', ')}`);
    }
  }
  console.log('  ✅ sort=price-asc verified (prices ascending)');

  // 3e. Sorting: Price High-to-Low
  const sortDescRes = await fetch(`${BASE_URL}/api/products?sort=price-desc&limit=10`);
  const sortDescJson = await sortDescRes.json();
  const descPrices = sortDescJson.data.items.map(p => p.price);
  for (let i = 1; i < descPrices.length; i++) {
    if (descPrices[i] > descPrices[i - 1]) {
      throw new Error(`sort=price-desc failed! ${descPrices.join(', ')}`);
    }
  }
  console.log('  ✅ sort=price-desc verified (prices descending)');

  // 3f. In-Stock only filter
  const inStockRes = await fetch(`${BASE_URL}/api/products?inStock=true`);
  const inStockJson = await inStockRes.json();
  const allInStock = inStockJson.data.items.every(p => p.stock > 0);
  if (!allInStock) throw new Error('inStock filter failed! Product with stock 0 was returned');
  console.log(`  ✅ inStock=true verified: ${inStockJson.data.items.length} in-stock products`);

  // 3g. Empty query string safety
  const emptySearchRes = await fetch(`${BASE_URL}/api/products?search=`);
  if (emptySearchRes.status !== 200) {
    throw new Error(`Empty search query threw status ${emptySearchRes.status}!`);
  }
  console.log('  ✅ Empty search query safely handled with 200 OK without 400 error');

  // TEST 4: Product Lookup by Slug, by ObjectId, and Related Products
  console.log('\n--- TEST 4: Product Lookup by Slug & ID ---');
  const sampleProduct = await Product.findOne({ isActive: true });
  if (!sampleProduct) throw new Error('No active products found in DB');

  // Lookup by Slug
  const bySlugRes = await fetch(`${BASE_URL}/api/products/${sampleProduct.slug}`);
  const bySlugJson = await bySlugRes.json();
  if (bySlugRes.status !== 200 || bySlugJson.data.name !== sampleProduct.name) {
    throw new Error(`Lookup by slug failed: status ${bySlugRes.status}`);
  }
  console.log(`  ✅ Lookup by slug (${sampleProduct.slug}): 200 OK — "${bySlugJson.data.name}"`);

  // Lookup by MongoDB ObjectId
  const byIdRes = await fetch(`${BASE_URL}/api/products/${sampleProduct._id.toString()}`);
  const byIdJson = await byIdRes.json();
  if (byIdRes.status !== 200 || byIdJson.data.slug !== sampleProduct.slug) {
    throw new Error(`Lookup by ObjectId failed: status ${byIdRes.status}`);
  }
  console.log(`  ✅ Lookup by ObjectId (${sampleProduct._id}): 200 OK — "${byIdJson.data.name}"`);

  // Related Products
  const relatedRes = await fetch(`${BASE_URL}/api/products/${sampleProduct.slug}/related`);
  const relatedJson = await relatedRes.json();
  if (relatedRes.status !== 200 || !Array.isArray(relatedJson.data.items)) {
    throw new Error(`Related products failed: status ${relatedRes.status}`);
  }
  console.log(`  ✅ Related products for '${sampleProduct.slug}': 200 OK (${relatedJson.data.items.length} items)`);

  // TEST 5: Strict Role Protection on Write Endpoints
  console.log('\n--- TEST 5: Strict Role-Based Protection on Write Operations ---');
  const testSuffix = Math.floor(Math.random() * 1000000);
  const customerEmail = `cust_phase5_${testSuffix}@kirana.test`;
  const adminEmail = `admin_phase5_${testSuffix}@kirana.test`;
  const testPhoneCust = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const testPhoneAdmin = `98${Math.floor(10000000 + Math.random() * 90000000)}`;

  // Register Customer User
  const regCustRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Regular Customer',
      email: customerEmail,
      phone: testPhoneCust,
      password: 'CustomerPassword!123',
      role: 'customer'
    })
  });
  const regCustJson = await regCustRes.json();
  const customerToken = regCustJson.data.accessToken;

  // 5a. Customer attempt to POST /api/products -> Expect 403 Forbidden
  console.log('  Testing Customer write rejection on POST /api/products...');
  const custWriteRes = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({
      name: 'Unauthorized Product',
      slug: `unauthorized-${testSuffix}`,
      category: 'dairy-eggs-bread',
      unit: '1 pc',
      price: 100,
      mrp: 120,
      stock: 10
    })
  });
  const custWriteJson = await custWriteRes.json();
  if (custWriteRes.status !== 403) {
    throw new Error(`Expected 403 for customer POST, got ${custWriteRes.status}: ${JSON.stringify(custWriteJson)}`);
  }
  console.log(`  ✅ Customer POST /api/products strictly rejected with 403 Forbidden: "${custWriteJson.message}"`);

  // 5b. Customer attempt to PUT /api/products/:slug -> Expect 403 Forbidden
  const custPutRes = await fetch(`${BASE_URL}/api/products/${sampleProduct.slug}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({ price: 999 })
  });
  if (custPutRes.status !== 403) {
    throw new Error(`Expected 403 for customer PUT, got ${custPutRes.status}`);
  }
  console.log('  ✅ Customer PUT /api/products/:slug strictly rejected with 403 Forbidden');

  // 5c. Customer attempt to DELETE /api/products/:slug -> Expect 403 Forbidden
  const custDeleteRes = await fetch(`${BASE_URL}/api/products/${sampleProduct.slug}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${customerToken}` }
  });
  if (custDeleteRes.status !== 403) {
    throw new Error(`Expected 403 for customer DELETE, got ${custDeleteRes.status}`);
  }
  console.log('  ✅ Customer DELETE /api/products/:slug strictly rejected with 403 Forbidden');

  // 5d. Create Admin User directly in MongoDB & generate JWT
  const adminUser = await User.create({
    name: 'Kirana Admin',
    email: adminEmail,
    phone: testPhoneAdmin,
    passwordHash: 'dummy',
    role: 'admin'
  });
  const adminToken = adminUser.generateAccessToken();

  // 5e. Admin POST /api/products -> Expect 201 Created
  console.log('\n  Testing Admin authorized write operations...');
  const newProductSlug = `test-admin-item-${testSuffix}`;
  const adminPostRes = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      name: 'Admin Added Organic Honey',
      slug: newProductSlug,
      category: 'dairy-eggs-bread',
      unit: '500 g',
      price: 250,
      mrp: 300,
      stock: 45,
      brand: 'Organic Kirana',
      shortDescription: 'Pure raw honey'
    })
  });
  const adminPostJson = await adminPostRes.json();
  if (adminPostRes.status !== 201 || adminPostJson.data.slug !== newProductSlug) {
    throw new Error(`Admin POST failed: ${adminPostRes.status} - ${JSON.stringify(adminPostJson)}`);
  }
  console.log(`  ✅ Admin POST /api/products: 201 Created — "${adminPostJson.data.name}"`);

  // 5f. Admin PUT /api/products/:slug -> Expect 200 OK
  const adminPutRes = await fetch(`${BASE_URL}/api/products/${newProductSlug}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      price: 240,
      stock: 50
    })
  });
  const adminPutJson = await adminPutRes.json();
  if (adminPutRes.status !== 200 || adminPutJson.data.price !== 240) {
    throw new Error(`Admin PUT failed: ${adminPutRes.status}`);
  }
  console.log(`  ✅ Admin PUT /api/products/${newProductSlug}: 200 OK — Price updated to ₹${adminPutJson.data.price}`);

  // 5g. Admin DELETE /api/products/:slug -> Expect 200 OK
  const adminDeleteRes = await fetch(`${BASE_URL}/api/products/${newProductSlug}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  if (adminDeleteRes.status !== 200) {
    throw new Error(`Admin DELETE failed: ${adminDeleteRes.status}`);
  }
  console.log(`  ✅ Admin DELETE /api/products/${newProductSlug}: 200 OK — Product deactivated`);

  // Cleanup test users and test product
  await Product.deleteOne({ slug: newProductSlug });
  await User.deleteOne({ email: customerEmail });
  await User.deleteOne({ email: adminEmail });
  console.log('\n🧹 Cleaned up temporary test users & product.');

  await mongoose.disconnect();
  console.log('\n🎉 ALL PHASE 5 VERIFICATION TESTS PASSED WITH 100% SUCCESS!');
}

runPhase5Audit().catch(err => {
  console.error('\n❌ Phase 5 Audit Failed:', err);
  process.exit(1);
});
