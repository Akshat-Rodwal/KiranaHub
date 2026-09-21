import makeImage from './makeImage.js';

const categories = [
  {
    name: 'Fruits & Vegetables',
    slug: 'fruits-vegetables',
    description: 'Farm-fresh fruits and vegetables delivered daily.',
    color: ['#16a34a', '#4ade80'],
    sortOrder: 1,
  },
  {
    name: 'Dairy, Eggs & Bread',
    slug: 'dairy-eggs-bread',
    description: 'Milk, curd, paneer, eggs, bread and bakery essentials.',
    color: ['#0891b2', '#67e8f9'],
    sortOrder: 2,
  },
  {
    name: 'Atta, Rice & Dal',
    slug: 'staples',
    description: 'Staples like atta, rice, dal, poha and sooji.',
    color: ['#d97706', '#fbbf24'],
    sortOrder: 3,
  },
  {
    name: 'Spices & Masala',
    slug: 'spices-masala',
    description: 'Whole spices, ground masalas and ready mixes.',
    color: ['#dc2626', '#f87171'],
    sortOrder: 4,
  },
  {
    name: 'Snacks & Munchies',
    slug: 'snacks',
    description: 'Chips, namkeen, biscuits and evening snack favourites.',
    color: ['#ea580c', '#fdba74'],
    sortOrder: 5,
  },
  {
    name: 'Beverages',
    slug: 'beverages',
    description: 'Tea, coffee, juices, soft drinks and energy drinks.',
    color: ['#7c3aed', '#c4b5fd'],
    sortOrder: 6,
  },
  {
    name: 'Breakfast & Instant Food',
    slug: 'breakfast-instant',
    description: 'Cereals, oats, noodles, soups and instant mixes.',
    color: ['#0d9488', '#5eead4'],
    sortOrder: 7,
  },
  {
    name: 'Personal Care',
    slug: 'personal-care',
    description: 'Bathing, skin, hair and oral care products.',
    color: ['#db2777', '#f9a8d4'],
    sortOrder: 8,
  },
  {
    name: 'Home Care',
    slug: 'home-care',
    description: 'Detergents, cleaners, repellents and dish care.',
    color: ['#2563eb', '#93c5fd'],
    sortOrder: 9,
  },
  {
    name: 'Baby Care',
    slug: 'baby-care',
    description: 'Diapers, baby food, wipes and gentle care products.',
    color: ['#059669', '#6ee7b7'],
    sortOrder: 10,
  },
];

const categorySeedData = categories.map((category) => ({
  name: category.name,
  slug: category.slug,
  description: category.description,
  image: makeImage(category.name, category.color[0], category.color[1]),
  icon: '',
  isActive: true,
  sortOrder: category.sortOrder,
}));

export default categorySeedData;
