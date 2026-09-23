import mongoose from 'mongoose';
import config from '../config/env.js';
import Category from '../models/Category.js';
import categorySeedData from './data/categories.js';

const SLUG_MIGRATION_MAP = {
  'dairy-eggs-bread': 'dairy-bread-eggs',
  staples: 'atta-rice-dal',
  'spices-masala': 'masala-oil-more',
  snacks: 'snacks-munchies',
  beverages: 'cold-drinks-juices',
  'breakfast-instant': 'instant-frozen-food',
  'sweet-tooth': 'bakery-biscuits',
  'home-care': 'cleaning-essentials',
};

export const seedCategories = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.mongoUri);
    }
    console.log(`[CategorySeeder] Connected to MongoDB: ${mongoose.connection.name}`);

    for (const seed of categorySeedData) {
      // Find by current slug, seed slug, or previous alias slug
      const oldSlug = Object.keys(SLUG_MIGRATION_MAP).find(
        (key) => SLUG_MIGRATION_MAP[key] === seed.slug
      );

      const query = {
        $or: [
          { slug: seed.slug },
          { name: seed.name },
          ...(oldSlug ? [{ slug: oldSlug }] : []),
        ],
      };

      const existing = await Category.findOne(query);

      if (existing) {
        existing.name = seed.name;
        existing.slug = seed.slug;
        existing.icon = seed.icon;
        existing.description = seed.description || existing.description;
        existing.sortOrder = seed.sortOrder;
        existing.isActive = true;
        await existing.save();
        console.log(`[CategorySeeder] Synced: ${seed.name} (${seed.slug})`);
      } else {
        await Category.create(seed);
        console.log(`[CategorySeeder] Created: ${seed.name} (${seed.slug})`);
      }
    }

    const total = await Category.countDocuments();
    console.log(`[CategorySeeder] Finished. Total categories in DB: ${total}`);
    return total;
  } catch (error) {
    console.error('[CategorySeeder] Error seeding categories:', error);
    throw error;
  }
};

// If run directly via node
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('seedCategories.js')) {
  seedCategories()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export default seedCategories;
