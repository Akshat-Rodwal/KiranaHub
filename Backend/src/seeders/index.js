/**
 * KiranaHub database seeder.
 *
 * Usage:
 *   npm run seed          — upserts categories and products by slug (safe,
 *                           keeps any other collections/data untouched).
 *   npm run seed:reset    — drops the Category and Product collections first,
 *                           then reseeds. DESTRUCTIVE for those two
 *                           collections only; everything else is untouched.
 */
import mongoose from 'mongoose';
import config from '../config/env.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import categorySeedData from './data/categories.js';
import productSeedData from './data/products.js';

const RESET_FLAG = '--reset';

const seedCategories = async () => {
  let upserted = 0;
  for (const category of categorySeedData) {
    await Category.updateOne(
      { slug: category.slug },
      { $set: category },
      { upsert: true },
    );
    upserted += 1;
  }
  return upserted;
};

const seedProducts = async () => {
  const categoryBySlug = new Map(
    (await Category.find({}).select('slug _id').lean()).map((c) => [
      c.slug,
      c._id,
    ]),
  );

  let upserted = 0;
  for (const product of productSeedData) {
    const categoryId = categoryBySlug.get(product.categorySlug);
    if (!categoryId) {
      console.warn(
        `[seed] Skipping '${product.slug}' — unknown category '${product.categorySlug}'`,
      );
      continue;
    }

    const { categorySlug, image, ...rest } = product;
    await Product.updateOne(
      { slug: product.slug },
      {
        $set: {
          ...rest,
          category: categoryId,
          images: [{ url: image, alt: product.name }],
        },
      },
      { upsert: true },
    );
    upserted += 1;
  }
  return upserted;
};

const run = async () => {
  const reset = process.argv.includes(RESET_FLAG);

  const primaryUri = config.mongoUri;
  const localFallbackUri = 'mongodb://localhost:27017/kirana-store';

  try {
    await mongoose.connect(primaryUri);
    console.log(`[seed] Connected to MongoDB: ${mongoose.connection.name}`);
  } catch (primaryErr) {
    if (primaryUri !== localFallbackUri) {
      console.warn(`[seed] Primary URI connection failed (${primaryErr.message}). Attempting local MongoDB fallback...`);
      await mongoose.connect(localFallbackUri);
      console.log(`[seed] Connected to local MongoDB: ${mongoose.connection.name}`);
    } else {
      throw primaryErr;
    }
  }

  if (reset) {
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
    ]);
    console.log('[seed] Reset: Category and Product collections cleared');
  }

  const categoryCount = await seedCategories();
  const productCount = await seedProducts();

  console.log(
    `[seed] Done. ${categoryCount} categories, ${productCount} products (${reset ? 'reset' : 'upsert'} mode)`,
  );
};

run()
  .catch((err) => {
    console.error('[seed] Failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
