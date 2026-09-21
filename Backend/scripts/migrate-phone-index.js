import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  const collection = mongoose.connection.collection('users');

  console.log('--- 1. Current Indexes ---');
  let indexes = await collection.indexes();
  console.log(indexes.map(i => ({ name: i.name, key: i.key, sparse: i.sparse, unique: i.unique })));

  // Unset phone on documents where phone is null or empty string
  const unsetResult = await collection.updateMany(
    { $or: [{ phone: null }, { phone: '' }] },
    { $unset: { phone: 1 } }
  );
  console.log('--- 2. Unset null/empty phone fields count:', unsetResult.modifiedCount);

  // Drop old phone_1 index if exists
  try {
    await collection.dropIndex('phone_1');
    console.log('--- 3. Dropped old non-sparse phone_1 index successfully ---');
  } catch (e) {
    console.log('--- 3. dropIndex message:', e.message);
  }

  // Recreate sparse unique index
  const newIdx = await collection.createIndex({ phone: 1 }, { unique: true, sparse: true, background: true });
  console.log('--- 4. Created new sparse unique index:', newIdx);

  console.log('--- 5. Verified Final Indexes ---');
  indexes = await collection.indexes();
  console.log(indexes.map(i => ({ name: i.name, key: i.key, sparse: i.sparse, unique: i.unique })));

  await mongoose.disconnect();
  console.log('✅ MongoDB sparse index migration complete!');
}

migrate().catch(console.error);
