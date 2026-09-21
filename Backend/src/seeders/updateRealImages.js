import mongoose from 'mongoose';
import config from '../config/env.js';
import Product from '../models/Product.js';

// Realistic product pack images mapped by product slug
const REAL_PRODUCT_IMAGES = {
  // Fruits & Vegetables
  'alphonso-mangoes': 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=500&q=80',
  'banana-robusta': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=500&q=80',
  'tomato-hybrid': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80',
  'potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=500&q=80',
  'onion': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=500&q=80',
  'spinach-bunch': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=500&q=80',
  'apple-shimla': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=500&q=80',

  // Dairy, Eggs & Bread
  'amul-taaza-milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=500&q=80',
  'amul-butter': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=500&q=80',
  'amul-paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=500&q=80',
  'curd-cup': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=500&q=80',
  'farm-eggs': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=500&q=80',
  'whole-wheat-bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80',

  // Staples
  'aashirvaad-atta': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=500&q=80',
  'india-gate-basmati-rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80',
  'tata-sampann-toor-dal': 'https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&w=500&q=80',
  'fortune-sunflower-oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80',
  'tata-salt': 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&w=500&q=80',
  'poha-thick': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=500&q=80',

  // Spices & Masala
  'turmeric-powder': 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=500&q=80',
  'red-chilli-powder': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=500&q=80',
  'garam-masala': 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=500&q=80',
  'cumin-seeds': 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=500&q=80',
  'mustard-seeds': 'https://images.unsplash.com/photo-1608797178974-15b35a61dd73?auto=format&fit=crop&w=500&q=80',

  // Snacks
  'lay-s-magic-masala': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=500&q=80',
  'maggi-noodles': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=500&q=80',
  'parle-g-gold': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=500&q=80',
  'samosa-singh-bhujia': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80',
  'dark-fantasy-choco-fills': 'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?auto=format&fit=crop&w=500&q=80',
  'roasted-chana': 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=500&q=80',

  // Beverages
  'tata-tea-gold': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=500&q=80',
  'nescafe-classic': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80',
  'frooti-mango-drink': 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=500&q=80',
  'coca-cola': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80',
  'bournvita': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=500&q=80',

  // Breakfast & Instant
  'kelloggs-corn-flakes': 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=500&q=80',
  'quaker-oats': 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=500&q=80',
  'mtr-rava-idli-mix': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80',
  'knorr-tomato-soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=500&q=80',
  'muesli-fruit-and-nut': 'https://images.unsplash.com/photo-1517093700054-9449fdfc4155?auto=format&fit=crop&w=500&q=80',

  // Personal Care
  'dove-cream-soap': 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=500&q=80',
  'colgate-maxfresh': 'https://images.unsplash.com/photo-1559591937-e1032b4f9958?auto=format&fit=crop&w=500&q=80',
  'dove-shampoo': 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=500&q=80',
  'dettol-handwash': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80',
  'nivea-body-lotion': 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=500&q=80',

  // Home Care
  'surf-excel-matic': 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=500&q=80',
  'vim-dish-gel': 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=500&q=80',
  'lizol-citrus': 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&w=500&q=80',
  'harpic-power-plus': 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&w=500&q=80',
  'all-out-refill': 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&w=500&q=80',

  // Baby Care
  'pampers-diapers-s': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=500&q=80',
  'cerelac-wheat': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=500&q=80',
  'johnson-baby-soap': 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=500&q=80',
  'himalaya-baby-wipes': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=500&q=80',
};

async function updateRealImages() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB Atlas for Product Image Update.');

    const products = await Product.find({});
    console.log(`Found ${products.length} products to check and update.`);

    let updatedCount = 0;
    for (const product of products) {
      const matchUrl = REAL_PRODUCT_IMAGES[product.slug];
      if (matchUrl) {
        product.images = [{ url: matchUrl, alt: product.name }];
        await product.save();
        updatedCount++;
      } else if (
        !product.images ||
        product.images.length === 0 ||
        product.images[0]?.url?.startsWith('data:image/svg')
      ) {
        // Fallback to high-quality grocery pack image
        const genericUrl = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80';
        product.images = [{ url: genericUrl, alt: product.name }];
        await product.save();
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} products with real pack images.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

updateRealImages();
