export const CATEGORY_KEYWORD_3D_MAP = [
  // Toys & Games
  {
    keywords: ['toy', 'game', 'kids', 'doll', 'action figure', 'puzzle', 'play', 'board game', 'teddy'],
    icon: 'https://cdn-icons-png.flaticon.com/512/3082/3082060.png', // Clean 2D flat colorful toy blocks / car
  },
  // Fruits, Vegetables & Farm Grocery
  {
    keywords: ['vegetable', 'fruit', 'sabzi', 'grocery', 'farm', 'fresh produce', 'greens', 'salad', 'apple', 'banana', 'mango', 'tomato', 'produce'],
    icon: 'https://cdn-icons-png.flaticon.com/512/1625/1625048.png', // Clean 2D fresh vegetable basket
  },
  // Dairy, Milk, Bread & Eggs
  {
    keywords: ['dairy', 'milk', 'egg', 'bread', 'butter', 'cheese', 'paneer', 'dahi', 'curd', 'yogurt'],
    icon: 'https://cdn-icons-png.flaticon.com/512/3050/3050158.png', // Clean 2D milk carton, bread & cheese
  },
  // Atta, Rice, Dal & Staples
  {
    keywords: ['atta', 'rice', 'dal', 'flour', 'grain', 'wheat', 'chawal', 'pulses', 'staple', 'oil', 'ghee'],
    icon: 'https://cdn-icons-png.flaticon.com/512/2821/2821805.png', // Clean 2D sack of grain & wheat
  },
  // Spices & Masala
  {
    keywords: ['masala', 'spice', 'mirch', 'haldi', 'seasoning', 'salt', 'pepper'],
    icon: 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png', // Clean 2D spice bowl & seasoning
  },
  // Snacks, Chips & Munchies
  {
    keywords: ['snack', 'chips', 'munchies', 'namkeen', 'popcorn', 'crisps', 'kurkure', 'wafer'],
    icon: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png', // Clean 2D crisp chips pack
  },
  // Cold Drinks & Juices
  {
    keywords: ['drink', 'juice', 'beverage', 'soda', 'cola', 'cold drink', 'water', 'can', 'bottle'],
    icon: 'https://cdn-icons-png.flaticon.com/512/2405/2405479.png', // Clean 2D refreshing soda / drink can
  },
  // Breakfast, Noodles & Instant Food
  {
    keywords: ['noodle', 'instant', 'maggi', 'breakfast', 'cereal', 'oats', 'pasta', 'soup', 'ramen'],
    icon: 'https://cdn-icons-png.flaticon.com/512/3480/3480823.png', // Clean 2D ramen / instant meal
  },
  // Bakery, Biscuits & Sweets
  {
    keywords: ['sweet', 'bakery', 'biscuit', 'cookie', 'cake', 'mithai', 'chocolate', 'dessert', 'candy'],
    icon: 'https://cdn-icons-png.flaticon.com/512/992/992747.png', // Clean 2D bakery croissant & cookies
  },
  // Personal Care & Beauty
  {
    keywords: ['personal', 'care', 'beauty', 'skin', 'soap', 'shampoo', 'lotion', 'cosmetic', 'cream', 'face'],
    icon: 'https://cdn-icons-png.flaticon.com/512/2965/2965300.png', // Clean 2D cosmetic & personal lotion
  },
  // Cleaning & Home Essentials
  {
    keywords: ['clean', 'cleaning', 'wash', 'detergent', 'household', 'home care', 'spray', 'mop', 'wipe'],
    icon: 'https://cdn-icons-png.flaticon.com/512/995/995053.png', // Clean 2D cleaning spray bottle & sponge
  },
  // Baby Care
  {
    keywords: ['baby', 'diaper', 'infant', 'toddler', 'feeder', 'wipes'],
    icon: 'https://cdn-icons-png.flaticon.com/512/2829/2829824.png', // Clean 2D baby feeding bottle & rattle
  },
  // Pharma & Wellness
  {
    keywords: ['pharma', 'medicine', 'wellness', 'health', 'first aid', 'pill', 'tablet', 'cure'],
    icon: 'https://cdn-icons-png.flaticon.com/512/883/883407.png', // Clean 2D medical health first-aid
  },
  // Pet Care
  {
    keywords: ['pet', 'dog', 'cat', 'puppy', 'kitten', 'animal', 'pet food'],
    icon: 'https://cdn-icons-png.flaticon.com/512/616/616408.png', // Clean 2D pet care dog & bowl
  },
  // Meat, Chicken & Fish
  {
    keywords: ['meat', 'chicken', 'fish', 'seafood', 'mutton', 'non-veg'],
    icon: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png', // Clean 2D poultry & meat
  },
  // Paan Corner
  {
    keywords: ['paan', 'mouth freshener', 'mint', 'supari'],
    icon: 'https://cdn-icons-png.flaticon.com/512/2909/2909894.png', // Clean 2D herbal paan & leaves
  },
];

export const DEFAULT_CATEGORY_ICON =
  'https://cdn-icons-png.flaticon.com/512/3081/3081986.png';

export const resolveCategory3DIcon = (name = '', slug = '', fallbackIcon = null) => {
  // If the user entered an actual custom image URL starting with http, use it
  if (
    fallbackIcon &&
    (fallbackIcon.startsWith('http://') || fallbackIcon.startsWith('https://')) &&
    !fallbackIcon.includes('plasticine') &&
    !fallbackIcon.includes('fluentui-emoji')
  ) {
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

  // Default fallback 2D flat shopping bag
  return DEFAULT_CATEGORY_ICON;
};

export default {
  CATEGORY_KEYWORD_3D_MAP,
  DEFAULT_CATEGORY_ICON,
  resolveCategory3DIcon,
};
