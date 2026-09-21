// test-phase8-complete.js
import mongoose from 'mongoose';
import { execSync } from 'child_process';
import Product from '../src/models/Product.js';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';
import StoreSettings from '../src/models/StoreSettings.js';
import config from '../src/config/env.js';

const BASE_URL = 'http://localhost:5000';

async function runPhase8Audit() {
  console.log('🚀 Starting Complete Phase 8 Verification Test Suite...\n');

  await mongoose.connect(config.mongoUri);
  console.log('📦 Connected to MongoDB Atlas.');

  const testSuffix = Math.floor(Math.random() * 1000000);
  const cliAdminEmail = `cli_admin_${testSuffix}@kirana.test`;
  const cliAdminPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const cliAdminPassword = 'CliAdminPassword!123';
  const cliAdminName = `CLI Super Admin ${testSuffix}`;

  const customerEmail = `cust_p8_${testSuffix}@kirana.test`;
  const customerPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const customer2Email = `cust2_p8_${testSuffix}@kirana.test`;
  const customer2Phone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;

  let cliAdminId;
  let cliAdminToken;
  let customerId;
  let customerToken;
  let customer2Id;
  let customer2Token;
  let sampleProduct;
  let initialStock;
  let order1Id;
  let order2Id;

  try {
    // -------------------------------------------------------------
    // 1. ADMIN CREATION SCRIPT VERIFICATION
    // -------------------------------------------------------------
    console.log('\n--- TEST 1: Admin Creation Script (CLI) ---');
    console.log(`  Executing: node scripts/create-admin.js ${cliAdminEmail} ${cliAdminPhone} ${cliAdminPassword} "${cliAdminName}"`);
    
    const cliOutput = execSync(
      `node scripts/create-admin.js ${cliAdminEmail} ${cliAdminPhone} ${cliAdminPassword} "${cliAdminName}"`,
      { cwd: process.cwd() }
    ).toString();
    console.log('  CLI Output:\n' + cliOutput.trim().split('\n').map(l => '    ' + l).join('\n'));

    // Check user in DB
    const adminUser = await User.findOne({ email: cliAdminEmail.toLowerCase() });
    if (!adminUser) throw new Error('CLI created admin user was not found in MongoDB Atlas');
    if (adminUser.role !== 'admin') throw new Error(`CLI user role is "${adminUser.role}", expected "admin"`);
    cliAdminId = adminUser._id;
    console.log(`  ✅ Admin user verified in Atlas with role "${adminUser.role}".`);

    // Verify login with CLI admin credentials
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cliAdminEmail,
        password: cliAdminPassword,
      }),
    });
    const loginJson = await loginRes.json();
    if (loginRes.status !== 200 || !loginJson.data?.accessToken) {
      throw new Error(`Admin login failed: ${JSON.stringify(loginJson)}`);
    }
    cliAdminToken = loginJson.data.accessToken;
    console.log('  ✅ Admin successfully authenticated via /api/v1/auth/login.');

    // -------------------------------------------------------------
    // 2. SETUP CUSTOMER ACCOUNTS
    // -------------------------------------------------------------
    console.log('\n--- SETUP: Creating Customer Test Accounts ---');
    const regCust1 = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Primary Customer',
        email: customerEmail,
        phone: customerPhone,
        password: 'Password!123',
        role: 'customer',
      }),
    });
    const cust1Json = await regCust1.json();
    if (regCust1.status !== 201) throw new Error(`Customer 1 registration failed: ${JSON.stringify(cust1Json)}`);
    customerToken = cust1Json.data.accessToken;
    customerId = cust1Json.data.user._id || cust1Json.data.user.id;

    const regCust2 = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Secondary Customer',
        email: customer2Email,
        phone: customer2Phone,
        password: 'Password!123',
        role: 'customer',
      }),
    });
    const cust2Json = await regCust2.json();
    if (regCust2.status !== 201) throw new Error(`Customer 2 registration failed: ${JSON.stringify(cust2Json)}`);
    customer2Token = cust2Json.data.accessToken;
    customer2Id = cust2Json.data.user._id || cust2Json.data.user.id;
    console.log('  ✅ Customers created successfully.');

    // -------------------------------------------------------------
    // 3. STORE SETTINGS ENDPOINTS & DUAL-MOUNTING
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Dynamic Store Settings Module ---');
    
    // Test public GET /api/v1/settings
    const publicSettingsRes1 = await fetch(`${BASE_URL}/api/v1/settings`);
    if (publicSettingsRes1.status !== 200) {
      throw new Error(`GET /api/v1/settings failed with status ${publicSettingsRes1.status}`);
    }
    const publicSettingsJson1 = await publicSettingsRes1.json();
    console.log('  ✅ Public GET /api/v1/settings succeeded.');
    console.log(`     Store: "${publicSettingsJson1.data.storeName}", Open: ${publicSettingsJson1.data.isStoreOpen}, Promo: "${publicSettingsJson1.data.promoCode}"`);

    // Test dual mount GET /api/settings
    const publicSettingsRes2 = await fetch(`${BASE_URL}/api/settings`);
    if (publicSettingsRes2.status !== 200) {
      throw new Error(`GET /api/settings (dual-mounted) failed with status ${publicSettingsRes2.status}`);
    }
    console.log('  ✅ Dual-mounted GET /api/settings verified.');

    // RBAC: Customer cannot update settings
    const custUpdateRes = await fetch(`${BASE_URL}/api/v1/admin/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ announcementText: 'Unauthorized Hack!' }),
    });
    if (custUpdateRes.status !== 403) {
      throw new Error(`Customer was NOT rejected with 403 on admin settings! Status: ${custUpdateRes.status}`);
    }
    console.log('  ✅ RBAC: Customer denied PATCH /api/v1/admin/settings with 403 Forbidden.');

    // Admin updates settings via /api/v1/admin/settings
    const updatedAnnouncement = `⚡ Fresh Morning Deals! Orders above ₹299 get free delivery. [Test ${testSuffix}]`;
    const adminUpdateRes = await fetch(`${BASE_URL}/api/v1/admin/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cliAdminToken}`,
      },
      body: JSON.stringify({
        announcementText: updatedAnnouncement,
        promoCode: 'KIRANA50',
        promoBannerText: 'Get flat ₹50 OFF on your first grocery basket!',
        isStoreOpen: true,
        deliveryTimeEstimate: '15-25 mins',
      }),
    });
    if (adminUpdateRes.status !== 200) {
      const errJson = await adminUpdateRes.json();
      throw new Error(`Admin PATCH /api/v1/admin/settings failed: ${JSON.stringify(errJson)}`);
    }
    const updatedAdminJson = await adminUpdateRes.json();
    if (updatedAdminJson.data.announcementText !== updatedAnnouncement) {
      throw new Error('Admin updated announcement text did not match expected value');
    }
    console.log('  ✅ Admin PATCH /api/v1/admin/settings successfully updated announcement & promo code.');

    // Verify public settings reflects updated data immediately
    const verifyPubRes = await fetch(`${BASE_URL}/api/v1/settings`);
    const verifyPubJson = await verifyPubRes.json();
    if (verifyPubJson.data.announcementText !== updatedAnnouncement || verifyPubJson.data.promoCode !== 'KIRANA50') {
      throw new Error('Public settings did not immediately reflect updated admin values');
    }
    console.log('  ✅ Public settings instantly reflected updated announcement and promo.');

    // Verify dual mount /api/admin/settings
    const adminDualRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cliAdminToken}`,
      },
      body: JSON.stringify({
        deliveryTimeEstimate: '10-20 mins',
      }),
    });
    if (adminDualRes.status !== 200) {
      throw new Error(`PATCH /api/admin/settings (dual-mounted) failed with status ${adminDualRes.status}`);
    }
    console.log('  ✅ Dual-mounted PATCH /api/admin/settings verified.');

    // -------------------------------------------------------------
    // 4. ORDER CREATION, STATUS & INVENTORY TRACKING
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Order Creation (Default PENDING Status) & Inventory Deduction ---');
    sampleProduct = await Product.findOne({ stock: { $gte: 20 } });
    if (!sampleProduct) throw new Error('No product with stock >= 20 found');
    initialStock = sampleProduct.stock;
    console.log(`  Selected product: "${sampleProduct.name}" | Initial Stock: ${initialStock}`);

    // Place order 1 with 2 items
    const orderQty = 2;
    const placeOrderRes = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            product: sampleProduct._id.toString(),
            name: sampleProduct.name,
            price: sampleProduct.price,
            mrp: sampleProduct.mrp,
            quantity: orderQty,
            unit: sampleProduct.unit || 'piece',
            image: sampleProduct.images?.[0] || '',
          },
        ],
        deliveryAddress: {
          receiverName: 'Primary Customer',
          receiverPhone: customerPhone,
          addressLine1: 'Flat 101, Phase 8 Tower',
          addressLine2: 'Market Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          type: 'HOME',
        },
        paymentMethod: 'COD',
      }),
    });
    const order1Json = await placeOrderRes.json();
    if (placeOrderRes.status !== 201) {
      throw new Error(`Order placement failed: ${JSON.stringify(order1Json)}`);
    }
    order1Id = order1Json.data._id;
    if (order1Json.data.orderStatus !== 'PENDING') {
      throw new Error(`Expected new order status to be 'PENDING', got '${order1Json.data.orderStatus}'`);
    }
    console.log(`  ✅ Order placed successfully (ID: ${order1Id}) with default status "PENDING".`);

    // Verify stock deduction in Atlas
    const productAfterOrder1 = await Product.findById(sampleProduct._id);
    if (productAfterOrder1.stock !== initialStock - orderQty) {
      throw new Error(`Stock deduction error: expected ${initialStock - orderQty}, got ${productAfterOrder1.stock}`);
    }
    console.log(`  ✅ Stock correctly decremented in Atlas from ${initialStock} to ${productAfterOrder1.stock}.`);

    // -------------------------------------------------------------
    // 5. CUSTOMER ORDER CANCELLATION & AUTO-REPLENISHMENT
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Customer Order Cancellation & Stock Auto-Replenishment ---');

    // Sub-test A: Unauthorized user cannot cancel another user's order
    const unauthorizedCancelRes = await fetch(`${BASE_URL}/api/v1/orders/${order1Id}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer2Token}`, // Customer 2 trying to cancel Customer 1's order
      },
      body: JSON.stringify({ cancellationReason: 'Trying to cancel someone else order' }),
    });
    if (unauthorizedCancelRes.status !== 404 && unauthorizedCancelRes.status !== 403) {
      throw new Error(`Cross-customer cancellation was not rejected! Status: ${unauthorizedCancelRes.status}`);
    }
    console.log(`  ✅ Cross-customer cancellation securely blocked with status ${unauthorizedCancelRes.status}.`);

    // Sub-test B: Legitimate owner cancels PENDING order
    const cancelRes = await fetch(`${BASE_URL}/api/v1/orders/${order1Id}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ cancellationReason: 'Changed delivery address' }),
    });
    const cancelJson = await cancelRes.json();
    if (cancelRes.status !== 200) {
      throw new Error(`Customer cancellation failed: ${JSON.stringify(cancelJson)}`);
    }
    if (cancelJson.data.orderStatus !== 'CANCELLED') {
      throw new Error(`Expected orderStatus to be 'CANCELLED', got '${cancelJson.data.orderStatus}'`);
    }
    console.log(`  ✅ Order #${order1Id} successfully cancelled by customer.`);

    // Sub-test C: Verify inventory auto-replenishment in Atlas
    const productAfterCancel = await Product.findById(sampleProduct._id);
    if (productAfterCancel.stock !== initialStock) {
      throw new Error(`Stock auto-replenishment failed: expected ${initialStock}, got ${productAfterCancel.stock}`);
    }
    console.log(`  ✅ Stock automatically replenished in Atlas: restored from ${productAfterOrder1.stock} back to ${productAfterCancel.stock}.`);

    // Sub-test D: Cancelling already cancelled order should fail
    const doubleCancelRes = await fetch(`${BASE_URL}/api/v1/orders/${order1Id}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ cancellationReason: 'Cancelling again' }),
    });
    if (doubleCancelRes.status !== 400) {
      throw new Error(`Double cancellation did not return 400! Status: ${doubleCancelRes.status}`);
    }
    console.log('  ✅ Double cancellation rejected with 400 Bad Request.');

    // -------------------------------------------------------------
    // 6. CANCEL REJECTION FOR NON-PENDING ORDERS
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Non-Pending Order Cancellation Protection ---');
    
    // Create order 2
    const placeOrder2Res = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            product: sampleProduct._id.toString(),
            name: sampleProduct.name,
            price: sampleProduct.price,
            mrp: sampleProduct.mrp,
            quantity: 1,
            unit: sampleProduct.unit || 'piece',
            image: sampleProduct.images?.[0] || '',
          },
        ],
        deliveryAddress: {
          receiverName: 'Primary Customer',
          receiverPhone: customerPhone,
          addressLine1: 'Flat 101, Phase 8 Tower',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          type: 'HOME',
        },
        paymentMethod: 'COD',
      }),
    });
    const order2Json = await placeOrder2Res.json();
    order2Id = order2Json.data._id;
    console.log(`  Created Order #${order2Id}`);

    // Admin transitions order to 'CONFIRMED'
    const confirmRes = await fetch(`${BASE_URL}/api/v1/admin/orders/${order2Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cliAdminToken}`,
      },
      body: JSON.stringify({ orderStatus: 'CONFIRMED' }),
    });
    if (confirmRes.status !== 200) {
      throw new Error(`Admin status update to CONFIRMED failed: ${confirmRes.status}`);
    }
    console.log('  Admin updated Order #2 status to CONFIRMED.');

    // Customer attempts to cancel CONFIRMED order -> MUST BE REJECTED with 400
    const cancelConfirmedRes = await fetch(`${BASE_URL}/api/v1/orders/${order2Id}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ cancellationReason: 'Want to cancel now' }),
    });
    const cancelConfirmedJson = await cancelConfirmedRes.json();
    if (cancelConfirmedRes.status !== 400) {
      throw new Error(`Cancelling CONFIRMED order did NOT return 400! Received: ${cancelConfirmedRes.status}`);
    }
    console.log(`  ✅ Customer cancellation correctly rejected with 400: "${cancelConfirmedJson.message}".`);

    // Clean up order 2 stock deduction manually for test hygiene
    await Product.findByIdAndUpdate(sampleProduct._id, { stock: initialStock });
    console.log('  Restored sample product stock to initial value.');

    // -------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------
    console.log('\n================================================================');
    console.log('🎉 ALL PHASE 8 VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('================================================================');
    console.log('  1. CLI Admin Script works & created admin user logs in seamlessly.');
    console.log('  2. Dynamic Store Settings APIs & Dual mounting are fully operational.');
    console.log('  3. Customer order cancellation only allowed for PENDING orders.');
    console.log('  4. Automatic stock replenishment in Atlas functions flawlessly without errors.');
    console.log('  5. Non-pending cancellation attempts are strictly blocked with 400 Bad Request.');
    console.log('  6. Cross-customer order access is strictly forbidden.');
    console.log('================================================================\n');

  } catch (error) {
    console.error('\n❌ PHASE 8 AUDIT FAILED:', error);
    process.exitCode = 1;
  } finally {
    console.log('🧹 Cleaning up test artifacts...');
    if (order1Id) await Order.findByIdAndDelete(order1Id);
    if (order2Id) await Order.findByIdAndDelete(order2Id);
    if (sampleProduct) await Product.findByIdAndUpdate(sampleProduct._id, { stock: initialStock });
    if (customerId) await User.findByIdAndDelete(customerId);
    if (customer2Id) await User.findByIdAndDelete(customer2Id);
    if (cliAdminId) await User.findByIdAndDelete(cliAdminId);
    console.log('✅ Cleanup complete. Disconnecting from Atlas...');
    await mongoose.disconnect();
    console.log('👋 Done.');
  }
}

runPhase8Audit();
