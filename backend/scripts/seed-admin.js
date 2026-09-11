/**
 * Admin Seed Script -- Promote an existing user to the "admin" role.
 *
 * Usage:
 *   node scripts/seed-admin.js --email=you@example.com
 *   ADMIN_EMAIL=you@example.com node scripts/seed-admin.js
 *
 * The user must already be registered in the database.
 * This script never creates passwords or hard-codes credentials.
 * Run it once; re-running is a no-op if the user is already an admin.
 *
 * IMPORTANT: Never commit a .env with a real ADMIN_EMAIL to source control.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import usermodel from '../src/models/user.model.js';

// -- Resolve target email
const emailFromArg = process.argv
  .find((a) => a.startsWith('--email='))
  ?.slice('--email='.length)
  .trim()
  .toLowerCase();

const targetEmail = emailFromArg || process.env.ADMIN_EMAIL?.trim().toLowerCase();

if (!targetEmail) {
  console.error(
    '\n[seed-admin] No email provided.\n' +
      '  Usage: node scripts/seed-admin.js --email=you@example.com\n' +
      '  Or:    ADMIN_EMAIL=you@example.com node scripts/seed-admin.js\n',
  );
  process.exit(1);
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
  console.error('[seed-admin] Invalid email address: "' + targetEmail + '"');
  process.exit(1);
}

// -- Connect to MongoDB
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('[seed-admin] MONGO_URI is not set in your environment.');
  process.exit(1);
}

try {
  await mongoose.connect(mongoUri);
  console.log('[seed-admin] Connected to MongoDB.');
} catch (err) {
  console.error('[seed-admin] MongoDB connection failed:', err.message);
  process.exit(1);
}

// -- Find and promote user
try {
  const user = await usermodel
    .findOne({ email: targetEmail })
    .select('_id username email role isActive');

  if (!user) {
    console.error('[seed-admin] No user found with email: "' + targetEmail + '"');
    console.error('[seed-admin] The user must be registered before they can be promoted to admin.');
    process.exit(1);
  }

  if (!user.isActive) {
    console.error('[seed-admin] User "' + user.username + '" is not active. Activate first.');
    process.exit(1);
  }

  if (user.role === 'admin') {
    console.log('[seed-admin] User "' + user.username + '" is already an admin. No changes made.');
    process.exit(0);
  }

  await usermodel.updateOne({ _id: user._id }, { role: 'admin' });

  console.log('[seed-admin] Successfully promoted "' + user.username + '" (' + targetEmail + ') to admin role.');
  console.log('[seed-admin] The user must log out and log back in for the role to take effect.');
} catch (err) {
  console.error('[seed-admin] Failed to update user role:', err.message);
  process.exit(1);
} finally {
  await mongoose.disconnect();
}
