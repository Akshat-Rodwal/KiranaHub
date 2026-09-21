// test-phase6-complete.js
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';
import config from '../src/config/env.js';

const BASE_URL = 'http://localhost:5000';

async function runPhase6Audit() {
  console.log('🚀 Running Complete Phase 6 Cart, Wishlist & Checkout Engine Verification Suite...\n');

  // Connect to DB
  await mongoose.connect(config.mongoUri);
  console.log('📦 Connected to MongoDB Atlas.');

  const testSuffix = Math.floor(Math.random() * 1000000);
  const customerEmail1 = `cust1_p6_${testSuffix}@kirana.test`;
  const customerEmail2 = `cust2_p6_${testSuffix}@kirana.test`;
  const testPhone1 = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const testPhone2 = `98${Math.floor(10000000 + Math.random() * 90000000)}`;

  let testUser1Id;
  let testUser2Id;
  let token1;
  let token2;
  let sampleProduct;
  let originalStock;
  let createdOrderId;

  try {
    // 1. Create Test Customers
    console.log('\n--- SETUP: Creating Test Customers ---');
    const regRes1 = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Phase6 Tester One',
        email: customerEmail1,
        phone: testPhone1,
        password: 'Password!123',
        role: 'customer',
      }),
    });
    const regJson1 = await regRes1.json();
    if (regRes1.status !== 201) throw new Error(`User 1 registration failed: ${JSON.stringify(regJson1)}`);
    token1 = regJson1.data.accessToken;
    testUser1Id = regJson1.data.user._id || regJson1.data.user.id;

    const regRes2 = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Phase6 Tester Two',
        email: customerEmail2,
        phone: testPhone2,
        password: 'Password!123',
        role: 'customer',
      }),
    });
    const regJson2 = await regRes2.json();
    if (regRes2.status !== 201) throw new Error(`User 2 registration failed: ${JSON.stringify(regJson2)}`);
    token2 = regJson2.data.accessToken;
    testUser2Id = regJson2.data.user._id || regJson2.data.user.id;

    console.log('  ✅ Test customers created successfully.');

    // 2. Select Sample Product & Verify Initial Stock
    sampleProduct = await Product.findOne({ stock: { $gte: 10 } });
    if (!sampleProduct) {
      throw new Error('No product with stock >= 10 found in Atlas for testing');
    }
    originalStock = sampleProduct.stock;
    console.log(`\n📦 Sample Product Selected: "${sampleProduct.name}" (ID: ${sampleProduct._id})`);
    console.log(`   Initial Stock: ${originalStock}, Price: ₹${sampleProduct.price}`);

    // TEST 1: Dual Mounting - Checkout Order Placement on /api/v1/orders
    console.log('\n--- TEST 1: Place Order via POST /api/v1/orders ---');
    const orderPayload = {
      items: [
        {
          product: sampleProduct._id.toString(),
          quantity: 2,
        },
      ],
      deliveryAddress: {
        type: 'HOME',
        receiverName: 'Phase6 Tester One',
        receiverPhone: testPhone1,
        addressLine1: 'Flat 402, Green Meadows',
        addressLine2: 'Near City Park',
        landmark: 'Near Water Tank',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
      },
      paymentMethod: 'COD',
    };

    const orderRes = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify(orderPayload),
    });

    const orderJson = await orderRes.json();
    if (orderRes.status !== 201) {
      throw new Error(`Order placement failed: HTTP ${orderRes.status} — ${JSON.stringify(orderJson)}`);
    }

    const createdOrder = orderJson.data;
    createdOrderId = createdOrder._id;
    console.log(`  ✅ Order created successfully: ID #${createdOrderId}`);
    console.log(`     Status: ${createdOrder.orderStatus}, Payment: ${createdOrder.paymentMethod} (${createdOrder.paymentStatus})`);
    console.log(`     ETA: ${createdOrder.expectedDeliveryTime}`);

    // TEST 2: Pricing Logic Validation (Subtotal, Delivery Fee ₹25 / FREE >= 499, Handling Fee ₹2, Grand Total)
    console.log('\n--- TEST 2: Server-Side Pricing Calculation Verification ---');
    const expectedSubtotal = sampleProduct.price * 2;
    const expectedDeliveryFee = expectedSubtotal >= 499 ? 0 : 25;
    const expectedHandlingFee = 2;
    const expectedGrandTotal = expectedSubtotal + expectedDeliveryFee + expectedHandlingFee;

    console.log(`  Expected Pricing: Subtotal: ₹${expectedSubtotal}, Delivery: ₹${expectedDeliveryFee}, Handling: ₹${expectedHandlingFee}, GrandTotal: ₹${expectedGrandTotal}`);
    console.log(`  Actual Pricing:   Subtotal: ₹${createdOrder.pricing.subtotal}, Delivery: ₹${createdOrder.pricing.deliveryFee}, Handling: ₹${createdOrder.pricing.handlingFee}, GrandTotal: ₹${createdOrder.pricing.grandTotal}`);

    if (
      createdOrder.pricing.subtotal !== expectedSubtotal ||
      createdOrder.pricing.deliveryFee !== expectedDeliveryFee ||
      createdOrder.pricing.handlingFee !== expectedHandlingFee ||
      createdOrder.pricing.grandTotal !== expectedGrandTotal
    ) {
      throw new Error('Pricing mismatch between server calculation and expected formula!');
    }
    console.log('  ✅ Pricing calculation accurately computed on server!');

    // TEST 3: Inventory Stock Deduction Verification
    console.log('\n--- TEST 3: Inventory Stock Deduction ---');
    const updatedProduct = await Product.findById(sampleProduct._id);
    const expectedStock = originalStock - 2;
    console.log(`  Stock after order: ${updatedProduct.stock} (Expected: ${expectedStock})`);
    if (updatedProduct.stock !== expectedStock) {
      throw new Error(`Stock deduction failed! Expected ${expectedStock}, found ${updatedProduct.stock}`);
    }
    console.log('  ✅ Atomic stock deduction verified in MongoDB Atlas!');

    // TEST 4: Out of Stock Protection & Zero Partial Deduction
    console.log('\n--- TEST 4: Out-Of-Stock Guard & Atomic Rollback ---');
    const stockBeforeAttempt = updatedProduct.stock;
    const excessOrderPayload = {
      items: [
        {
          product: sampleProduct._id.toString(),
          quantity: stockBeforeAttempt + 50, // Exceeds available stock
        },
      ],
      deliveryAddress: orderPayload.deliveryAddress,
      paymentMethod: 'COD',
    };

    const excessRes = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify(excessOrderPayload),
    });

    const excessJson = await excessRes.json();
    console.log(`  Attempt with quantity ${stockBeforeAttempt + 50} (Stock: ${stockBeforeAttempt}): Status ${excessRes.status}`);
    console.log(`  Error response message: "${excessJson.message}"`);

    if (excessRes.status !== 400) {
      throw new Error(`Expected 400 Bad Request for out of stock, received: ${excessRes.status}`);
    }

    const stockAfterFailedAttempt = (await Product.findById(sampleProduct._id)).stock;
    if (stockAfterFailedAttempt !== stockBeforeAttempt) {
      throw new Error(`Stock was mutated despite out of stock failure! Before: ${stockBeforeAttempt}, After: ${stockAfterFailedAttempt}`);
    }
    console.log('  ✅ Out-of-stock rejected with 400 Bad Request without partial deduction!');

    // TEST 5: Get Order History (GET /api/v1/orders/my-orders)
    console.log('\n--- TEST 5: Order History (GET /api/v1/orders/my-orders) ---');
    const myOrdersRes = await fetch(`${BASE_URL}/api/v1/orders/my-orders`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const myOrdersJson = await myOrdersRes.json();
    if (myOrdersRes.status !== 200) {
      throw new Error(`Failed to fetch my orders: HTTP ${myOrdersRes.status}`);
    }

    const customerOrders = myOrdersJson.data.orders;
    const orderFound = customerOrders.find((o) => o._id === createdOrderId);
    if (!orderFound) {
      throw new Error(`Created order #${createdOrderId} not found in user's order history`);
    }
    console.log(`  ✅ Retrieved ${customerOrders.length} order(s) for user 1. Order #${createdOrderId} present.`);
    console.log(`     Pagination: Page ${myOrdersJson.data.pagination.page}, Total: ${myOrdersJson.data.pagination.total}`);

    // TEST 6: User Isolation & Access Control on GET /api/v1/orders/:id
    console.log('\n--- TEST 6: User Isolation on GET /api/v1/orders/:id ---');
    // 6a. Owner access (User 1) -> 200 OK
    const ownerRes = await fetch(`${BASE_URL}/api/v1/orders/${createdOrderId}`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    if (ownerRes.status !== 200) {
      throw new Error(`Owner could not access their own order: HTTP ${ownerRes.status}`);
    }
    console.log(`  ✅ Owner access to order #${createdOrderId}: 200 OK`);

    // 6b. Other user access (User 2) -> 403 Forbidden
    const unauthRes = await fetch(`${BASE_URL}/api/v1/orders/${createdOrderId}`, {
      headers: { Authorization: `Bearer ${token2}` },
    });
    if (unauthRes.status !== 403) {
      throw new Error(`Unauthorized user was NOT rejected with 403: HTTP ${unauthRes.status}`);
    }
    console.log('  ✅ Unauthorized customer rejected with 403 Forbidden!');

    // 6c. Invalid ObjectId format -> 400 Bad Request
    const invalidIdRes = await fetch(`${BASE_URL}/api/v1/orders/invalid-mongo-id`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    if (invalidIdRes.status !== 400) {
      throw new Error(`Invalid order ID was NOT rejected with 400: HTTP ${invalidIdRes.status}`);
    }
    console.log('  ✅ Invalid order ID rejected with 400 Bad Request!');

    // TEST 7: Dual-Mounted Route Verification on Root Mount (/api/orders)
    console.log('\n--- TEST 7: Dual-Mounted Route Verification (/api/orders) ---');
    const rootMyOrdersRes = await fetch(`${BASE_URL}/api/orders/my-orders`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    if (rootMyOrdersRes.status !== 200) {
      throw new Error(`Root mount /api/orders/my-orders failed: HTTP ${rootMyOrdersRes.status}`);
    }
    console.log('  ✅ Dual-mounted route GET /api/orders/my-orders: 200 OK');

    console.log('\n🎉 ALL PHASE 6 AUTOMATED TESTS PASSED SUCCESSFULLY!\n');
  } finally {
    // CLEANUP
    console.log('--- CLEANUP: Restoring Database State ---');
    if (sampleProduct && originalStock !== undefined) {
      await Product.findByIdAndUpdate(sampleProduct._id, { stock: originalStock });
      console.log(`  ✅ Restored product "${sampleProduct.name}" stock to ${originalStock}`);
    }
    if (createdOrderId) {
      await Order.findByIdAndDelete(createdOrderId);
      console.log(`  ✅ Deleted test order #${createdOrderId}`);
    }
    if (testUser1Id) {
      await User.findByIdAndDelete(testUser1Id);
      console.log(`  ✅ Cleaned up test user 1 (${customerEmail1})`);
    }
    if (testUser2Id) {
      await User.findByIdAndDelete(testUser2Id);
      console.log(`  ✅ Cleaned up test user 2 (${customerEmail2})`);
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas.\n');
  }
}

runPhase6Audit().catch((err) => {
  console.error('\n❌ Phase 6 Verification Test Failed:\n', err);
  process.exit(1);
});
