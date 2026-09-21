#!/usr/bin/env node
// create-admin.js
// CLI script to create or update an admin user in MongoDB Atlas
// Usage: node scripts/create-admin.js <email> <phone> <password> <name>

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import config from '../src/config/env.js';

const SALT_ROUNDS = 10;

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 4) {
    console.error(`
❌ Invalid arguments.
Usage: node scripts/create-admin.js <email> <phone> <password> <name>
Example: node scripts/create-admin.js admin@kirana.test 9876543210 AdminPass!123 "Store Admin"
`);
    process.exit(1);
  }

  const [email, phone, password, ...nameParts] = args;
  const name = nameParts.join(' ').trim();
  const cleanEmail = email.toLowerCase().trim();

  // Basic validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    console.error(`❌ Error: Invalid email format "${email}"`);
    process.exit(1);
  }

  // Normalize 10-digit phone
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
    cleanPhone = cleanPhone.slice(2);
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.slice(1);
  }

  if (cleanPhone.length < 10) {
    console.error(`❌ Error: Phone number must be at least 10 digits. Got "${phone}"`);
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('❌ Error: Password must be at least 6 characters long');
    process.exit(1);
  }

  if (!name) {
    console.error('❌ Error: Admin name cannot be empty');
    process.exit(1);
  }

  console.log('📦 Connecting to MongoDB Atlas...');
  await mongoose.connect(config.mongoUri);
  console.log('✅ Connected to MongoDB Atlas.');

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    let user = await User.findOne({
      $or: [{ email: cleanEmail }, { phone: cleanPhone }],
    });

    if (user) {
      console.log(`ℹ️ User already exists (ID: ${user._id}). Updating to Admin role...`);
      user = await User.findByIdAndUpdate(
        user._id,
        {
          $set: {
            name,
            email: cleanEmail,
            phone: cleanPhone,
            passwordHash,
            role: 'admin',
            isActive: true,
          },
        },
        { new: true, runValidators: true }
      );
      console.log(`🎉 Admin user updated successfully!`);
    } else {
      user = await User.create({
        name,
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        role: 'admin',
        isActive: true,
      });
      console.log(`🎉 Admin user created successfully!`);
    }

    // Verify hash match immediately
    const isMatch = await bcrypt.compare(password, passwordHash);
    if (!isMatch) {
      throw new Error('Self-check assertion failed: password does not match generated hash.');
    }

    console.log(`
-------------------------------------------
  ID    : ${user._id}
  Name  : ${user.name}
  Email : ${user.email}
  Phone : ${user.phone}
  Role  : ${user.role}
  Active: ${user.isActive}
  Auth  : Verified with comparePassword
-------------------------------------------
`);
  } catch (err) {
    console.error('❌ Failed to create/update admin user:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas.');
  }
}

main();
