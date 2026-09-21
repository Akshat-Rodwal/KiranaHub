// test-phase7-complete.js
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';
import config from '../src/config/env.js';

const BASE_URL = 'http://localhost:5000';

async function runPhase7Audit() {
  console.log('🚀 Running Complete Phase 7 Admin Operations & Inventory Verification Suite...\n');

  await mongoose.connect(config.mongoUri);
  console.log('📦 Connected to MongoDB Atlas.');

  const testSuffix = Math.floor(Math.random() * 1000000);
  const customerEmail = `cust_p7_${testSuffix}@kirana.test`;
  const adminEmail = `admin_p7_${testSuffix}@kirana.test`;
  const customerPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const adminPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;

  let customerId;
  let adminId;
  let customerToken;
  let adminToken;
  let sampleProduct;
  let originalStock;
  let testOrder1Id;
  let testOrder2Id;

  try {
    // 1. SETUP USERS
    console.log('\n--- SETUP: Creating Customer & Admin Users ---');
    // Register customer
    const regCust = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Normal Customer',
        email: customerEmail,
        phone: customerPhone,
        password: 'Password!123',
        role: 'customer',
      }),
    });
    const custJson = await regCust.json();
    if (regCust.status !== 201) throw new Error(`Customer registration failed: ${JSON.stringify(custJson)}`);
    customerToken = custJson.data.accessToken;
    customerId = custJson.data.user._id || custJson.data.user.id;

    // Register admin
    const regAdmin = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Store Administrator',
        email: adminEmail,
        phone: adminPhone,
        password: 'Password!123',
        role: 'admin',
      }),
    });
    const adminJson = await regAdmin.json();
    if (regAdmin.status !== 201) throw new Error(`Admin registration failed: ${JSON.stringify(adminJson)}`);
    adminToken = adminJson.data.accessToken;
    adminId = adminJson.data.user._id || adminJson.data.user.id;

    console.log('  ✅ Customer & Admin test accounts created successfully.');

    // Pick a test product
    sampleProduct = await Product.findOne({ stock: { $gte: 15 } });
    if (!sampleProduct) throw new Error('No product with stock >= 15 found in Atlas');
    originalStock = sampleProduct.stock;
    console.log(`  📦 Selected sample product: "${sampleProduct.name}" (Stock: ${originalStock})`);

    // TEST 1: Access Control (Customer must receive 403 Forbidden)
    console.log('\n--- TEST 1: Role-Based Access Control (RBAC) ---');
    const custAnalyticsRes = await fetch(`${BASE_URL}/api/v1/admin/analytics/overview`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (custAnalyticsRes.status !== 403) {
      throw new Error(`Customer was NOT rejected with 403 on admin analytics! Received: ${custAnalyticsRes.status}`);
    }
    console.log('  ✅ Customer denied access to /api/v1/admin/analytics/overview with 403 Forbidden.');

    const custOrdersRes = await fetch(`${BASE_URL}/api/v1/admin/orders`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (custOrdersRes.status !== 403) {
      throw new Error(`Customer was NOT rejected with 403 on admin orders! Received: ${custOrdersRes.status}`);
    }
    console.log('  ✅ Customer denied access to /api/v1/admin/orders with 403 Forbidden.');

    // TEST 2: Admin Overview Analytics (GET /api/v1/admin/analytics/overview)
    console.log('\n--- TEST 2: Admin Overview Analytics ---');
    const adminAnalyticsRes = await fetch(`${BASE_URL}/api/v1/admin/analytics/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminAnalyticsJson = await adminAnalyticsRes.json();
    if (adminAnalyticsRes.status !== 200) {
      throw new Error(`Admin analytics request failed: ${JSON.stringify(adminAnalyticsJson)}`);
    }

    const analytics = adminAnalyticsJson.data;
    console.log('  ✅ Admin analytics retrieved successfully (200 OK):');
    console.log(`     Today Sales: ₹${analytics.todaySales}`);
    console.log(`     Total Orders: ${analytics.totalOrders}`);
    console.log(`     Active Orders: ${analytics.activeOrders}`);
    console.log(`     Low Stock Items (<10): ${analytics.lowStockCount}`);
    console.log(`     Total Catalog Products: ${analytics.totalProducts}`);
    console.log(`     Payment Breakdown (COD/UPI):`, Object.keys(analytics.paymentBreakdown || {}));

    if (
      analytics.todaySales === undefined ||
      analytics.totalOrders === undefined ||
      analytics.activeOrders === undefined ||
      analytics.lowStockCount === undefined ||
      analytics.totalProducts === undefined
    ) {
      throw new Error('Analytics response missing required metric fields!');
    }

    // TEST 3: Admin Orders Listing & Pagination
    console.log('\n--- TEST 3: Admin Orders Listing & Pagination ---');
    const adminOrdersRes = await fetch(`${BASE_URL}/api/v1/admin/orders?page=1&limit=5&status=ALL`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminOrdersJson = await adminOrdersRes.json();
    if (adminOrdersRes.status !== 200) {
      throw new Error(`Admin orders list failed: ${JSON.stringify(adminOrdersJson)}`);
    }

    const { orders: adminOrderList, pagination } = adminOrdersJson.data;
    console.log(`  ✅ Retrieved ${adminOrderList.length} orders on page ${pagination.page} (Total: ${pagination.total})`);

    // TEST 4: Order Status State Transitions & Finalized Guard
    console.log('\n--- TEST 4: Order Status State Transitions & Finalized Guard ---');
    // Place a customer order
    const placeOrderRes = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [{ product: sampleProduct._id.toString(), quantity: 1 }],
        deliveryAddress: {
          type: 'HOME',
          receiverName: 'Test Customer',
          receiverPhone: customerPhone,
          addressLine1: '402 High Street',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
        },
        paymentMethod: 'COD',
      }),
    });
    const placeOrderJson = await placeOrderRes.json();
    if (placeOrderRes.status !== 201) throw new Error(`Failed to place test order: ${JSON.stringify(placeOrderJson)}`);
    testOrder1Id = placeOrderJson.data._id;
    console.log(`  Order #1 created: ID #${testOrder1Id} (Status: ${placeOrderJson.data.orderStatus})`);

    // 4a. Transition PENDING -> CONFIRMED -> PREPARING (Valid)
    const tConfirm = await fetch(`${BASE_URL}/api/v1/admin/orders/${testOrder1Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ orderStatus: 'CONFIRMED' }),
    });
    if (tConfirm.status !== 200) throw new Error(`Transition PENDING -> CONFIRMED failed with status ${tConfirm.status}`);
    console.log('  ✅ Transition PENDING -> CONFIRMED: 200 OK');

    const t1 = await fetch(`${BASE_URL}/api/v1/admin/orders/${testOrder1Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ orderStatus: 'PREPARING' }),
    });
    if (t1.status !== 200) throw new Error(`Transition CONFIRMED -> PREPARING failed with status ${t1.status}`);
    console.log('  ✅ Transition CONFIRMED -> PREPARING: 200 OK');

    // 4b. Transition PREPARING -> PENDING (Invalid backward transition -> expect 400)
    const tInvalid = await fetch(`${BASE_URL}/api/v1/admin/orders/${testOrder1Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ orderStatus: 'PENDING' }),
    });
    if (tInvalid.status !== 400) {
      throw new Error(`Backward transition PREPARING -> PENDING was NOT rejected with 400! Received: ${tInvalid.status}`);
    }
    console.log('  ✅ Backward transition PREPARING -> PENDING correctly rejected with 400 Bad Request!');

    // 4c. Transition PREPARING -> OUT_FOR_DELIVERY -> DELIVERED (Valid)
    const t2 = await fetch(`${BASE_URL}/api/v1/admin/orders/${testOrder1Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ orderStatus: 'OUT_FOR_DELIVERY' }),
    });
    if (t2.status !== 200) throw new Error(`Transition to OUT_FOR_DELIVERY failed: ${t2.status}`);

    const t3 = await fetch(`${BASE_URL}/api/v1/admin/orders/${testOrder1Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ orderStatus: 'DELIVERED' }),
    });
    const t3Json = await t3.json();
    if (t3.status !== 200) throw new Error(`Transition to DELIVERED failed: ${t3.status}`);
    console.log(`  ✅ Transition OUT_FOR_DELIVERY -> DELIVERED: 200 OK. Payment marked as: ${t3Json.data.paymentStatus}`);

    // 4d. Transition on finalized DELIVERED order -> PENDING (Must fail with 400)
    const tFinalDelivered = await fetch(`${BASE_URL}/api/v1/admin/orders/${testOrder1Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ orderStatus: 'PENDING' }),
    });
    if (tFinalDelivered.status !== 400) {
      throw new Error(`Modification of finalized DELIVERED order was NOT rejected with 400! Received: ${tFinalDelivered.status}`);
    }
    console.log('  ✅ Attempt to modify finalized DELIVERED order correctly rejected with 400 Bad Request!');

    // TEST 5: Order Cancellation & Automatic Stock Replenishment
    console.log('\n--- TEST 5: Order Cancellation & Inventory Restocking ---');
    const stockBeforeOrder2 = (await Product.findById(sampleProduct._id)).stock;

    // Place Order #2 with 2 units
    const placeOrder2Res = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [{ product: sampleProduct._id.toString(), quantity: 2 }],
        deliveryAddress: {
          type: 'HOME',
          receiverName: 'Test Customer Two',
          receiverPhone: customerPhone,
          addressLine1: 'Flat 101 Lake View',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
        },
        paymentMethod: 'COD',
      }),
    });
    const placeOrder2Json = await placeOrder2Res.json();
    testOrder2Id = placeOrder2Json.data._id;

    const stockAfterOrder2 = (await Product.findById(sampleProduct._id)).stock;
    if (stockAfterOrder2 !== stockBeforeOrder2 - 2) {
      throw new Error(`Stock deduction failed for order 2! Expected: ${stockBeforeOrder2 - 2}, got: ${stockAfterOrder2}`);
    }
    console.log(`  Order #2 placed for 2 units. Stock decreased from ${stockBeforeOrder2} to ${stockAfterOrder2}.`);

    // Admin cancels Order #2
    const cancelRes = await fetch(`${BASE_URL}/api/v1/admin/orders/${testOrder2Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ orderStatus: 'CANCELLED' }),
    });
    if (cancelRes.status !== 200) {
      throw new Error(`Cancellation failed: HTTP ${cancelRes.status}`);
    }

    // Verify stock is replenished in MongoDB Atlas
    const stockAfterCancel = (await Product.findById(sampleProduct._id)).stock;
    console.log(`  Stock after cancellation: ${stockAfterCancel} (Expected: ${stockBeforeOrder2})`);
    if (stockAfterCancel !== stockBeforeOrder2) {
      throw new Error(`Restocking failed! Expected: ${stockBeforeOrder2}, got: ${stockAfterCancel}`);
    }
    console.log('  ✅ Product stock automatically replenished in Atlas upon cancellation!');

    // 5b. Attempt to modify finalized CANCELLED order -> Must fail with 400
    const tFinalCancelled = await fetch(`${BASE_URL}/api/v1/admin/orders/${testOrder2Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ orderStatus: 'CONFIRMED' }),
    });
    if (tFinalCancelled.status !== 400) {
      throw new Error(`Modification of finalized CANCELLED order was NOT rejected with 400! Received: ${tFinalCancelled.status}`);
    }
    console.log('  ✅ Attempt to modify finalized CANCELLED order correctly rejected with 400 Bad Request!');

    // TEST 6: Inline Stock Updater & Negative Stock Prevention
    console.log('\n--- TEST 6: Inline Stock Updater & Negative Stock Prevention ---');
    // 6a. Attempt negative stock -> Expect 400 Bad Request
    const negStockRes = await fetch(`${BASE_URL}/api/v1/admin/products/${sampleProduct._id}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ stock: -10 }),
    });
    if (negStockRes.status !== 400) {
      throw new Error(`Negative stock was NOT rejected with 400! Received: ${negStockRes.status}`);
    }
    console.log('  ✅ Negative stock value (-10) correctly rejected with 400 Bad Request!');

    // 6b. Valid stock update
    const validStockRes = await fetch(`${BASE_URL}/api/v1/admin/products/${sampleProduct._id}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ stock: 55 }),
    });
    const validStockJson = await validStockRes.json();
    if (validStockRes.status !== 200) {
      throw new Error(`Stock update failed: HTTP ${validStockRes.status}`);
    }

    const updatedProduct = await Product.findById(sampleProduct._id);
    if (updatedProduct.stock !== 55) {
      throw new Error(`Stock mismatch in DB! Expected 55, found ${updatedProduct.stock}`);
    }
    console.log('  ✅ Inline stock updater updated stock to 55 units in Atlas (200 OK)!');

    // TEST 7: Dual-Mounted Admin Endpoints (/api/admin/*)
    console.log('\n--- TEST 7: Dual-Mounted Endpoints Verification (/api/admin/*) ---');
    const rootAnalytics = await fetch(`${BASE_URL}/api/admin/analytics/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (rootAnalytics.status !== 200) {
      throw new Error(`Dual-mounted /api/admin/analytics/overview failed: ${rootAnalytics.status}`);
    }
    console.log('  ✅ Dual-mounted GET /api/admin/analytics/overview: 200 OK');

    const rootOrders = await fetch(`${BASE_URL}/api/admin/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (rootOrders.status !== 200) {
      throw new Error(`Dual-mounted /api/admin/orders failed: ${rootOrders.status}`);
    }
    console.log('  ✅ Dual-mounted GET /api/admin/orders: 200 OK');

    console.log('\n🎉 ALL PHASE 7 AUTOMATED TESTS PASSED SUCCESSFULLY!\n');
  } finally {
    // CLEANUP
    console.log('--- CLEANUP: Restoring Database State ---');
    if (sampleProduct && originalStock !== undefined) {
      await Product.findByIdAndUpdate(sampleProduct._id, { stock: originalStock });
      console.log(`  ✅ Restored product stock to ${originalStock}`);
    }
    if (testOrder1Id) {
      await Order.findByIdAndDelete(testOrder1Id);
      console.log(`  ✅ Deleted test order #1 (#${testOrder1Id})`);
    }
    if (testOrder2Id) {
      await Order.findByIdAndDelete(testOrder2Id);
      console.log(`  ✅ Deleted test order #2 (#${testOrder2Id})`);
    }
    if (customerId) {
      await User.findByIdAndDelete(customerId);
      console.log(`  ✅ Cleaned up customer account (${customerEmail})`);
    }
    if (adminId) {
      await User.findByIdAndDelete(adminId);
      console.log(`  ✅ Cleaned up admin account (${adminEmail})`);
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas.\n');
  }
}

runPhase7Audit().catch((err) => {
  console.error('\n❌ Phase 7 Verification Failed:\n', err);
  process.exit(1);
});
