export const defaultBanners = [
  // 1. Top Single Banner (Full Graphical Hero with optional overlay text)
  {
    bannerType: 'top_single',
    title: 'Groceries delivered in 10 minutes',
    subtitle: 'Fresh vegetables, dairy, farm eggs & daily pantry essentials rushed directly to your doorstep.',
    badge: '⚡ 10-Minute Hyperlocal Delivery',
    ctaText: 'Order Now →',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
    link: '/products?flashDeal=true',
    targetType: 'custom',
    targetId: '/products?flashDeal=true',
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
    bgColor: '#BA1A1A', // Rich Nescafe crimson
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
    bgColor: '#FDF8EE', // Warm rice cream/beige
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
    bgColor: '#E6F4EA', // Fresh mint
    textColor: 'dark',
    targetType: 'category',
    targetId: 'fruits-vegetables',
    link: '/products?category=fruits-vegetables',
    order: 3,
    isActive: true,
  },
  // 5. Instamart Promo Card 4: Dairy & Breakfast
  {
    bannerType: 'instamart_card',
    title: 'Morning Essentials',
    subtitle: 'Farm fresh milk, country butter, organic brown eggs & bread',
    ctaText: 'SHOP NOW',
    brandTag: 'Daily Fresh Express',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=500&q=80',
    bgColor: '#EFF6FF', // Soft sky blue
    textColor: 'dark',
    targetType: 'category',
    targetId: 'dairy-bread-eggs',
    link: '/products?category=dairy-bread-eggs',
    order: 4,
    isActive: true,
  },
  // 6. Instamart Promo Card 5: Snacks & Munchies
  {
    bannerType: 'instamart_card',
    title: 'Late Night Cravings?',
    subtitle: 'Gourmet chips, roasted nuts, chocolates & chilled colas',
    ctaText: 'ORDER NOW',
    brandTag: 'Party Essentials',
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=500&q=80',
    bgColor: '#FFFBEB', // Warm butter yellow
    textColor: 'dark',
    targetType: 'category',
    targetId: 'snacks-munchies',
    link: '/products?category=snacks-munchies',
    order: 5,
    isActive: true,
  },
  // 7. Instamart Promo Card 6: Pharma & Wellness
  {
    bannerType: 'instamart_card',
    title: 'First-Aid & Care',
    subtitle: 'Pain relief, wellness supplements & emergency care in 10 mins',
    ctaText: 'EXPLORE',
    brandTag: '10-Min Pharmacy',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80',
    bgColor: '#F5F3FF', // Soft lavender
    textColor: 'dark',
    targetType: 'category',
    targetId: 'pharma-wellness',
    link: '/products?category=pharma-wellness',
    order: 6,
    isActive: true,
  },
];
