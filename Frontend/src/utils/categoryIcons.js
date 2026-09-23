export const CATEGORY_KEYWORD_3D_MAP = [
  // Toys & Games
  {
    keywords: ['toy', 'game', 'kids', 'doll', 'action figure', 'teddy', 'puzzle', 'play'],
    icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Teddy%20bear/3D/teddy_bear_3d.png',
  },
  // Vegetables, Fruits & Farm Grocery
  {
    keywords: ['vegetable', 'fruit', 'sabzi', 'grocery', 'farm', 'fresh produce', 'produce', 'greens', 'salad'],
    icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Green%20salad/3D/green_salad_3d.png',
  },
  // Dairy, Milk, Eggs & Bread
  {
    keywords: ['dairy', 'milk', 'egg', 'bread', 'butter', 'cheese', 'paneer', 'dahi', 'curd', 'yogurt'],
    icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Glass%20of%20milk/3D/glass_of_milk_3d.png',
  },
  // Atta, Rice, Dal & Grains
  {
    keywords: ['atta', 'rice', 'dal', 'flour', 'grain', 'wheat', 'chawal', 'pulses', 'staple'],
    icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Sheaf%20of%20rice/3D/sheaf_of_rice_3d.png',
  },
  // Spices & Masalas
  {
    keywords: ['masala', 'spice', 'oil', 'ghee', 'mirch', 'haldi', 'seasoning', 'salt'],
    icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Hot%20pepper/3D/hot_pepper_3d.png',
  },
  // Snacks, Chips & Munchies
  {
    keywords: ['snack', 'chips', 'munchies', 'namkeen', 'popcorn', 'crisps', 'kurkure'],
    icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Popcorn/3D/popcorn_3d.png',
  },
  // Cold Drinks & Juices
  {
    keywords: ['drink', 'juice', 'beverage', 'soda', 'cola', 'cold drink', 'bottle', 'water'],
    icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Beverage%20box/3D/beverage_box_3d.png',
  },
  // Breakfast, Noodles & Instant
  {
    keywords: ['noodle', 'instant', 'maggi', 'breakfast', 'cereal', 'oats', 'pasta', 'soup'],
    icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Steaming%20bowl/3D/steaming_bowl_3d.png',
  },
  // Bakery, Biscuits & Sweets
  {
    keywords: ['sweet', 'bakery', 'biscuit', 'cookie', 'cake', 'mithai', 'chocolate', 'candy'],
    icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cookie/3D/cookie_3d.png',
  },
  // Personal Care & Beauty
  {
    keywords: ['personal', 'care', 'beauty', 'skin', 'soap', 'shampoo', 'lotion', 'cosmetic', 'cream', 'face'],
    icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Lotion%20bottle/3D/lotion_bottle_3d.png',
  },
  // Cleaning & Home Essentials
  {
    keywords: ['clean', 'cleaning', 'wash', 'detergent', 'household', 'home care', 'spray', 'mop'],
    icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Sponge/3D/sponge_3d.png',
  },
  // Baby Care
  {
    keywords: ['baby', 'diaper', 'infant', 'toddler', 'feeder', 'wipes'],
    icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Baby%20bottle/3D/baby_bottle_3d.png',
  },
  // Pharma & Wellness
  {
    keywords: ['pharma', 'medicine', 'wellness', 'health', 'first aid', 'pill', 'tablet', 'cure'],
    icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pill/3D/pill_3d.png',
  },
  // Pet Care
  {
    keywords: ['pet', 'dog', 'cat', 'puppy', 'kitten', 'animal'],
    icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Dog%20face/3D/dog_face_3d.png',
  },
  // Meat, Chicken & Fish
  {
    keywords: ['meat', 'chicken', 'fish', 'seafood', 'egg', 'mutton', 'non-veg'],
    icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Poultry%20leg/3D/poultry_leg_3d.png',
  },
  // Paan Corner
  {
    keywords: ['paan', 'mouth freshener', 'mint', 'supari'],
    icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Herb/3D/herb_3d.png',
  },
];

export const resolveCategory3DIcon = (name = '', slug = '', fallbackIcon = null) => {
  // If the user entered an actual custom image URL starting with http, use it
  if (fallbackIcon && (fallbackIcon.startsWith('http://') || fallbackIcon.startsWith('https://')) && !fallbackIcon.includes('plasticine')) {
    return fallbackIcon;
  }

  // Multi-keyword tokenization: handles "Vegetables & Grocery", "Baby Diapers", "Toys", etc.
  const target = `${name} ${slug}`.toLowerCase().replace(/[^a-z0-9]+/g, ' ');
  const tokens = target.split(' ').filter(Boolean);

  for (const rule of CATEGORY_KEYWORD_3D_MAP) {
    const matched = rule.keywords.some((kw) => {
      if (kw.includes(' ')) {
        return target.includes(kw);
      }
      return tokens.includes(kw) || tokens.some((t) => t.startsWith(kw));
    });
    if (matched) return rule.icon;
  }

  // Default fallback 3D shopping bag
  return 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Shopping%20bags/3D/shopping_bags_3d.png';
};

export default {
  CATEGORY_KEYWORD_3D_MAP,
  resolveCategory3DIcon,
};
