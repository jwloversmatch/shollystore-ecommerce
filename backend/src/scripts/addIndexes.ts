/**
 * Migration: ensure critical indexes exist for Products, Orders, and Users.
 *
 * Run:  npm run migrate:indexes
 * Safe to re-run — createIndex is idempotent (skips existing indexes).
 */
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const INDEXES = {
  products: [
    { key: { isFeatured: 1, isActive: 1, createdAt: -1 }, name: 'featured_active_created' },
    { key: { category: 1, isActive: 1, createdAt: -1 }, name: 'category_active_created' },
    { key: { isActive: 1, stock: 1 }, name: 'active_stock' },
  ],
  orders: [
    { key: { couponCode: 1 }, name: 'couponCode' },
    { key: { status: 1, paymentMethod: 1, createdAt: -1 }, name: 'status_payment_created' },
    { key: { email: 1 }, name: 'order_email', sparse: true },
  ],
  users: [
    { key: { role: 1, isVerified: 1 }, name: 'role_verified' },
    { key: { lockUntil: 1 }, name: 'lockUntil', sparse: true },
  ],
} as const;

async function ensureIndexes(
  collection: mongoose.mongo.Collection,
  indexes: readonly { key: Record<string, 1 | -1>; name: string; sparse?: boolean }[],
): Promise<void> {
  for (const index of indexes) {
    const options: mongoose.mongo.CreateIndexesOptions = { name: index.name, background: true };
    if ('sparse' in index && index.sparse) {
      options.sparse = true;
    }
    await collection.createIndex(index.key, options);
    console.log(`  ✓ ${collection.collectionName}.${index.name}`);
  }
}

async function run(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is required');
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }

  console.log('Creating missing indexes...\n');

  console.log('Products:');
  await ensureIndexes(db.collection('products'), INDEXES.products);

  console.log('\nOrders:');
  await ensureIndexes(db.collection('orders'), INDEXES.orders);

  console.log('\nUsers:');
  await ensureIndexes(db.collection('users'), INDEXES.users);

  console.log('\nDone.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
