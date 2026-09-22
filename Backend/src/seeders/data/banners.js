export const defaultBanners = [
  // 1. Top Single Banner (Full Graphical Hero)
  {
    bannerType: 'top_single',
    title: 'Mega Fresh Deals & Discounts',
    subtitle: 'Up to 50% OFF on fresh vegetables, exotic fruits & dairy essentials',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
    link: '/products?flashDeal=true',
    targetType: 'custom',
    targetId: '/products?flashDeal=true',
    ctaText: 'SHOP DEALS',
    bgColor: '#10B981',
    textColor: 'light',
    order: 0,
    isActive: true,
  },
  // 2. Instamart Promo Card 1: Nescafe Coffee
  {
    bannerType: 'instamart_card',
    title: 'Pick Yours Now',
    subtitle: 'Your kinda coffee, your kinda mug',
    ctaText: 'TRY NOW',
    brandTag: 'Powered by NESCAFE',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80',
    bgColor: '#B91C1C', // Rich Nescafe crimson
    textColor: 'light',
    targetType: 'category',
    targetId: 'tea-coffee-drinks',
    link: '/products?category=tea-coffee-drinks',
    order: 1,
    isActive: true,
  },
  // 3. Instamart Promo Card 2: Daawat Basmati Rice
  {
    bannerType: 'instamart_card',
    title: 'Aged to Perfection',
    subtitle: 'Long grain aromatic basmati for festive royal feasts',
    ctaText: 'SHOP NOW',
    brandTag: 'Powered by DAAWAT',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80',
    bgColor: '#FDF8EC', // Warm rice cream/beige
    textColor: 'dark',
    targetType: 'category',
    targetId: 'atta-rice-dal',
    link: '/products?category=atta-rice-dal',
    order: 2,
    isActive: true,
  },
  // 4. Instamart Promo Card 3: Fresh Farm Harvest
  {
    bannerType: 'instamart_card',
    title: 'Direct from Mandi',
    subtitle: 'Handpicked crisp green veggies and fresh seasonal fruits',
    ctaText: 'EXPLORE',
    brandTag: 'Farm Fresh Guarantee',
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=500&q=80',
    bgColor: '#ECFDF5', // Soft fresh green
    textColor: 'dark',
    targetType: 'category',
    targetId: 'fruits-vegetables',
    link: '/products?category=fruits-vegetables',
    order: 3,
    isActive: true,
  },
];
