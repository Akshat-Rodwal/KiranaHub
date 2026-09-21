import makeImage from './makeImage.js';

const p = (
  category,
  name,
  brand,
  unit,
  price,
  mrp,
  stock,
  rating,
  reviewCount,
  tags,
  flags = {},
  colors = ['#0d9488', '#5eead4'],
) => ({
  categorySlug: category,
  name,
  slug: name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, ''),
  shortDescription: `${name} — ${unit}.`,
  description: `${name} by ${brand} (${unit}). Quality-checked stock from your trusted KiranaHub store, delivered fresh to your doorstep.`,
  brand,
  unit,
  price,
  mrp,
  stock,
  rating,
  reviewCount,
  tags,
  image: makeImage(brand, colors[0], colors[1]),
  isActive: true,
  featured: false,
  isBestSeller: false,
  isNewArrival: false,
  isFlashDeal: false,
  isPopular: false,
  ...flags,
});

const products = [
  // Fruits & Vegetables
  p('fruits-vegetables', 'Alphonso Mangoes', 'Farm Fresh', '1 dozen', 349, 420, 24, 4.7, 214, ['mango', 'fruit', 'seasonal', 'alphonso'], { isBestSeller: true, isPopular: true, isFlashDeal: true }, ['#f59e0b', '#fbbf24']),
  p('fruits-vegetables', 'Banana Robusta', 'Farm Fresh', '6 pieces', 28, 32, 80, 4.4, 512, ['banana', 'fruit'], { isPopular: true }, ['#eab308', '#fde047']),
  p('fruits-vegetables', 'Tomato Hybrid', 'Local Farm', '500 g', 22, 28, 120, 4.3, 341, ['vegetable', 'tomato'], {}, ['#dc2626', '#f87171']),
  p('fruits-vegetables', 'Potato', 'Local Farm', '1 kg', 32, 40, 150, 4.5, 428, ['vegetable', 'potato', 'aloo'], { isBestSeller: true }, ['#ca8a04', '#eab308']),
  p('fruits-vegetables', 'Onion', 'Local Farm', '1 kg', 42, 55, 140, 4.4, 389, ['vegetable', 'onion', 'pyaaz'], {}, ['#a16207', '#d97706']),
  p('fruits-vegetables', 'Spinach Bunch', 'Organic Valley', '250 g', 20, 25, 60, 4.6, 156, ['vegetable', 'greens', 'palak', 'organic'], { isNewArrival: true }, ['#16a34a', '#4ade80']),
  p('fruits-vegetables', 'Apple Shimla', 'Farm Fresh', '4 pieces', 89, 110, 45, 4.5, 267, ['apple', 'fruit'], { featured: true }, ['#dc2626', '#fca5a5']),

  // Dairy, Eggs & Bread
  p('dairy-eggs-bread', 'Amul Taaza Milk', 'Amul', '500 ml pouch', 27, 28, 200, 4.8, 1024, ['milk', 'dairy', 'amul', 'taaza'], { isBestSeller: true, isPopular: true, featured: true }, ['#0ea5e9', '#7dd3fc']),
  p('dairy-eggs-bread', 'Amul Butter', 'Amul', '100 g', 58, 60, 90, 4.9, 876, ['butter', 'dairy', 'amul'], { isBestSeller: true, featured: true }, ['#f59e0b', '#fcd34d']),
  p('dairy-eggs-bread', 'Amul Paneer', 'Amul', '200 g', 82, 90, 40, 4.7, 445, ['paneer', 'dairy', 'amul'], { isPopular: true }, ['#facc15', '#fef08a']),
  p('dairy-eggs-bread', 'Curd Cup', 'Amul', '400 g cup', 35, 40, 75, 4.6, 298, ['curd', 'dahi', 'dairy'], {}, ['#fef3c7', '#fde68a']),
  p('dairy-eggs-bread', 'Farm Eggs', 'Keggs', '6 pieces', 54, 60, 85, 4.5, 233, ['eggs', 'protein'], { isFlashDeal: true }, ['#f97316', '#fdba74']),
  p('dairy-eggs-bread', 'Whole Wheat Bread', 'Britannia', '400 g', 45, 50, 55, 4.4, 187, ['bread', 'bakery', 'wheat'], {}, ['#d97706', '#fbbf24']),

  // Staples
  p('staples', 'Aashirvaad Atta', 'Aashirvaad', '5 kg', 285, 320, 35, 4.7, 689, ['atta', 'wheat', 'flour', 'staple'], { isBestSeller: true, isPopular: true, featured: true }, ['#f59e0b', '#fbbf24']),
  p('staples', 'India Gate Basmati Rice', 'India Gate', '1 kg', 145, 175, 50, 4.6, 402, ['rice', 'basmati', 'staple'], { featured: true }, ['#e2e8f0', '#cbd5e1']),
  p('staples', 'Tata Sampann Toor Dal', 'Tata Sampann', '1 kg', 165, 190, 42, 4.5, 356, ['dal', 'toor', 'pigeon pea', 'protein'], { isPopular: true }, ['#f97316', '#fdba74']),
  p('staples', 'Fortune Sunflower Oil', 'Fortune', '1 L', 132, 145, 48, 4.4, 289, ['oil', 'sunflower', 'cooking'], { isFlashDeal: true }, ['#facc15', '#fde047']),
  p('staples', 'Tata Salt', 'Tata', '1 kg', 28, 30, 160, 4.8, 734, ['salt', 'iodized'], { isBestSeller: true }, ['#f8fafc', '#e2e8f0']),
  p('staples', 'Poha Thick', '24 Mantra', '500 g', 42, 48, 70, 4.3, 145, ['poha', 'flattened rice', 'breakfast'], { isNewArrival: true }, ['#fde68a', '#fef3c7']),

  // Spices & Masala
  p('spices-masala', 'Turmeric Powder', 'Everest', '200 g', 62, 72, 65, 4.6, 278, ['haldi', 'turmeric', 'spice'], { isPopular: true }, ['#f59e0b', '#fbbf24']),
  p('spices-masala', 'Red Chilli Powder', 'Everest', '200 g', 78, 90, 60, 4.5, 231, ['chilli', 'mirchi', 'spice'], {}, ['#dc2626', '#f87171']),
  p('spices-masala', 'Garam Masala', 'MDH', '100 g', 95, 110, 45, 4.7, 312, ['garam masala', 'spice blend'], { isBestSeller: true, featured: true }, ['#b45309', '#d97706']),
  p('spices-masala', 'Cumin Seeds', 'Tata Sampann', '100 g', 52, 60, 58, 4.5, 198, ['jeera', 'cumin', 'spice'], {}, ['#a16207', '#ca8a04']),
  p('spices-masala', 'Mustard Seeds', '24 Mantra', '100 g', 38, 45, 62, 4.4, 167, ['mustard', 'rai', 'spice'], { isNewArrival: true }, ['#ca8a04', '#eab308']),

  // Snacks
  p('snacks', "Lay's Magic Masala", "Lay's", '73 g', 20, 20, 180, 4.6, 542, ['chips', 'snack', 'lays'], { isBestSeller: true, isPopular: true, isFlashDeal: true }, ['#facc15', '#fde047']),
  p('snacks', 'Maggi Noodles', 'Maggi', '4 pack', 56, 60, 140, 4.8, 913, ['noodles', 'instant', 'maggi'], { isBestSeller: true, featured: true }, ['#fbbf24', '#fcd34d']),
  p('snacks', 'Parle-G Gold', 'Parle', '200 g', 25, 30, 170, 4.7, 645, ['biscuit', 'parle', 'tea snack'], { isPopular: true }, ['#f97316', '#fdba74']),
  p('snacks', 'Samosa Singh Bhujia', 'Samosa Singh', '400 g', 68, 80, 52, 4.5, 214, ['namkeen', 'bhujia', 'snack'], {}, ['#ea580c', '#fdba74']),
  p('snacks', 'Dark Fantasy Choco Fills', 'Sunfeast', '300 g', 40, 45, 90, 4.6, 378, ['biscuit', 'chocolate', 'snack'], { isFlashDeal: true }, ['#78350f', '#a16207']),
  p('snacks', 'Roasted Chana', 'Tata Sampann', '200 g', 45, 52, 66, 4.4, 156, ['chana', 'healthy snack', 'protein'], { isNewArrival: true }, ['#d97706', '#fbbf24']),

  // Beverages
  p('beverages', 'Tata Tea Gold', 'Tata Tea', '250 g', 145, 160, 55, 4.7, 486, ['tea', 'chai', 'tata'], { isBestSeller: true, featured: true }, ['#b45309', '#92400e']),
  p('beverages', 'Nescafe Classic', 'Nescafe', '50 g jar', 165, 185, 40, 4.6, 352, ['coffee', 'instant coffee'], { isPopular: true }, ['#78350f', '#a16207']),
  p('beverages', 'Frooti Mango Drink', 'Frooti', '1 L', 65, 70, 75, 4.4, 264, ['juice', 'mango', 'drink'], { isFlashDeal: true }, ['#f59e0b', '#fbbf24']),
  p('beverages', 'Coca-Cola', 'Coca-Cola', '750 ml', 40, 45, 95, 4.5, 421, ['soft drink', 'cola'], {}, ['#dc2626', '#ef4444']),
  p('beverages', 'Bournvita', 'Cadbury', '500 g', 235, 260, 30, 4.6, 289, ['health drink', 'malt', 'bournvita'], { isNewArrival: true }, ['#7c2d12', '#9a3412']),

  // Breakfast & Instant
  p('breakfast-instant', 'Kelloggs Corn Flakes', "Kellogg's", '475 g', 189, 215, 35, 4.5, 298, ['cereal', 'corn flakes', 'breakfast'], { featured: true }, ['#fbbf24', '#fde68a']),
  p('breakfast-instant', 'Quaker Oats', 'Quaker', '1 kg', 189, 220, 38, 4.6, 334, ['oats', 'healthy', 'breakfast'], { isPopular: true }, ['#d97706', '#fbbf24']),
  p('breakfast-instant', 'MTR Rava Idli Mix', 'MTR', '500 g', 82, 95, 44, 4.4, 187, ['idli', 'instant mix', 'south indian'], { isNewArrival: true }, ['#f8fafc', '#e2e8f0']),
  p('breakfast-instant', 'Knorr Tomato Soup', 'Knorr', '52 g', 45, 50, 70, 4.3, 176, ['soup', 'instant', 'snack'], {}, ['#dc2626', '#f87171']),
  p('breakfast-instant', 'Muesli Fruit & Nut', 'Bagrrys', '1 kg', 299, 340, 25, 4.5, 212, ['muesli', 'breakfast', 'healthy'], { featured: true }, ['#a16207', '#ca8a04']),

  // Personal Care
  p('personal-care', 'Dove Cream Soap', 'Dove', '100 g', 42, 48, 88, 4.6, 367, ['soap', 'bathing', 'skincare'], { isPopular: true }, ['#f8fafc', '#e2e8f0']),
  p('personal-care', 'Colgate MaxFresh', 'Colgate', '150 g', 55, 62, 92, 4.5, 402, ['toothpaste', 'oral care'], { isBestSeller: true }, ['#0ea5e9', '#38bdf8']),
  p('personal-care', 'Dove Shampoo', 'Dove', '340 ml', 199, 225, 32, 4.4, 256, ['shampoo', 'hair care'], { featured: true }, ['#f1f5f9', '#cbd5e1']),
  p('personal-care', 'Dettol Handwash', 'Dettol', '175 ml', 89, 99, 60, 4.7, 312, ['handwash', 'hygiene'], {}, ['#dc2626', '#f87171']),
  p('personal-care', 'Nivea Body Lotion', 'Nivea', '200 ml', 175, 199, 28, 4.5, 198, ['lotion', 'skincare', 'moisturizer'], { isNewArrival: true }, ['#1d4ed8', '#3b82f6']),

  // Home Care
  p('home-care', 'Surf Excel Matic', 'Surf Excel', '1 kg', 118, 135, 48, 4.6, 423, ['detergent', 'laundry'], { isBestSeller: true, featured: true }, ['#2563eb', '#60a5fa']),
  p('home-care', 'Vim Dish Gel', 'Vim', '500 ml', 99, 115, 55, 4.5, 287, ['dishwash', 'kitchen'], { isPopular: true }, ['#eab308', '#fde047']),
  p('home-care', 'Lizol Citrus', 'Lizol', '500 ml', 108, 122, 42, 4.4, 234, ['floor cleaner', 'disinfectant'], {}, ['#ca8a04', '#facc15']),
  p('home-care', 'Harpic Power Plus', 'Harpic', '500 ml', 92, 103, 50, 4.5, 276, ['toilet cleaner', 'bathroom'], { isFlashDeal: true }, ['#16a34a', '#4ade80']),
  p('home-care', 'All Out Refill', 'All Out', '45 ml', 85, 95, 46, 4.4, 208, ['mosquito', 'repellent'], { isNewArrival: true }, ['#7c3aed', '#a78bfa']),

  // Baby Care
  p('baby-care', 'Pampers Diapers S', 'Pampers', '42 count', 549, 649, 22, 4.7, 312, ['diaper', 'baby', 'pampers'], { isBestSeller: true, featured: true }, ['#0ea5e9', '#7dd3fc']),
  p('baby-care', 'Cerelac Wheat', 'Cerelac', '300 g', 265, 290, 26, 4.6, 245, ['baby food', 'cerelac', 'cereal'], { isPopular: true }, ['#f59e0b', '#fbbf24']),
  p('baby-care', 'Johnson Baby Soap', "Johnson's", '100 g', 38, 42, 64, 4.5, 187, ['baby soap', 'gentle'], {}, ['#f8fafc', '#e2e8f0']),
  p('baby-care', 'Himalaya Baby Wipes', 'Himalaya', '72 count', 165, 185, 30, 4.6, 223, ['wipes', 'baby care'], { isNewArrival: true }, ['#16a34a', '#86efac']),
];

export default products;
