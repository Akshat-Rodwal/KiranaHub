export const CATEGORY_KEYWORD_3D_MAP = [
  { keywords: ['snack', 'chips', 'munchies', 'namkeen', 'biscuit', 'cookie', 'kurkure', 'popcorn', 'crisps', 'wafer', 'bhujia'], icon: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png' },
  { keywords: ['sweet', 'chocolat', 'chocolate', 'mithai', 'bakery', 'cake', 'pastry', 'dessert', 'candy', 'ice cream', 'toffee'], icon: 'https://img.icons8.com/plasticine/200/cookie.png' },
  { keywords: ['drink', 'juice', 'beverage', 'soda', 'cola', 'cold drink', 'water', 'energy drink', 'pepsi', 'coke', 'tea', 'coffee'], icon: 'https://img.icons8.com/plasticine/200/soda-cup.png' },
  { keywords: ['fruit', 'vegetable', 'sabzi', 'fresh', 'farm', 'produce', 'apple', 'mango', 'banana', 'tomato', 'potato', 'onion'], icon: 'https://img.icons8.com/plasticine/200/vegetarian-food.png' },
  { keywords: ['milk', 'dairy', 'egg', 'bread', 'butter', 'cheese', 'paneer', 'curd', 'dahi', 'yogurt', 'yoghurt', 'cream', 'lassi'], icon: 'https://img.icons8.com/plasticine/200/milk-bottle.png' },
  { keywords: ['atta', 'rice', 'dal', 'flour', 'staple', 'grain', 'wheat', 'oil', 'ghee', 'pulse', 'sooji', 'maida', 'besan'], icon: 'https://img.icons8.com/plasticine/200/wheat.png' },
  { keywords: ['masala', 'spice', 'mirch', 'haldi', 'salt', 'sugar', 'seasoning', 'jeera', 'coriander', 'clove', 'cardamom'], icon: 'https://img.icons8.com/plasticine/200/ingredients.png' },
  { keywords: ['noodle', 'maggi', 'instant', 'breakfast', 'cereal', 'oats', 'pasta', 'soup', 'muesli', 'cornflakes'], icon: 'https://img.icons8.com/plasticine/200/noodles.png' },
  { keywords: ['pharma', 'medicine', 'health', 'wellness', 'first aid', 'pill', 'tablet', 'bandage', 'vitamin', 'balm'], icon: 'https://img.icons8.com/plasticine/200/pill.png' },
  { keywords: ['clean', 'wash', 'detergent', 'household', 'soap', 'spray', 'mop', 'wipe', 'dishwash', 'harpic', 'surf'], icon: 'https://img.icons8.com/plasticine/200/soap.png' },
  { keywords: ['personal', 'skin', 'beauty', 'hair', 'shampoo', 'cream', 'face', 'cosmetic', 'lotion', 'body wash', 'deodorant'], icon: 'https://img.icons8.com/plasticine/200/makeup.png' },
  { keywords: ['baby', 'diaper', 'infant', 'child', 'feeder', 'cerelac', 'pampers'], icon: 'https://img.icons8.com/plasticine/200/baby-bottle.png' },
  { keywords: ['pet', 'dog', 'cat', 'puppy', 'kitten', 'pedigree', 'whiskas', 'pet food'], icon: 'https://img.icons8.com/plasticine/200/dog.png' },
  { keywords: ['meat', 'chicken', 'fish', 'mutton', 'seafood', 'prawn', 'poultry'], icon: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png' },
  { keywords: ['paan', 'mouth', 'supari', 'freshener', 'gutkha', 'elaichi', 'churan'], icon: 'https://cdn-icons-png.flaticon.com/512/2909/2909894.png' },
];

export const resolveCategory3DIcon = (name = '', slug = '', fallbackIcon = null) => {
  if (fallbackIcon && typeof fallbackIcon === 'string' && (fallbackIcon.startsWith('http') || fallbackIcon.startsWith('/uploads'))) {
    return fallbackIcon;
  }
  const cleanTarget = ' ' + `${name || ''} ${slug || ''}`.toLowerCase().replace(/[^a-z0-9]+/g, ' ') + ' ';
  for (const rule of CATEGORY_KEYWORD_3D_MAP) {
    if (
      rule.keywords.some((kw) => {
        const cleanKw = kw.toLowerCase().trim();
        return (
          cleanTarget.includes(' ' + cleanKw + ' ') ||
          cleanTarget.includes(' ' + cleanKw + 's ') ||
          cleanTarget.includes(' ' + cleanKw + 'es ') ||
          cleanTarget.includes(cleanKw)
        );
      })
    ) {
      return rule.icon;
    }
  }
  return 'https://img.icons8.com/plasticine/200/shopping-basket-2.png';
};

export default {
  CATEGORY_KEYWORD_3D_MAP,
  resolveCategory3DIcon,
};
