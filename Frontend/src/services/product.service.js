import apiClient from './apiClient.js';

const deriveBadges = (product) => {
  const badges = [];

  if (product.isFlashDeal) {
    badges.push({ variant: 'sale-soft', size: 'sm', children: 'Flash Deal' });
  }
  if (product.isBestSeller) {
    badges.push({ variant: 'stock-soft', size: 'sm', children: 'Bestseller' });
  }
  if (badges.length < 2 && product.featured) {
    badges.push({ variant: 'combo', size: 'sm', children: 'Featured' });
  }
  if (badges.length < 2 && product.isPopular) {
    badges.push({ variant: 'info-soft', size: 'sm', children: 'Popular' });
  }

  return badges;
};

const toProductCardModel = (product) => ({
  ...product,
  badges: deriveBadges(product),
});

export const productApi = {
  getProducts: (params = {}) =>
    apiClient
      .get('/products', { params })
      .then((body) => ({
        ...body.data,
        items: body.data.items.map(toProductCardModel),
      })),
  getProductBySlug: (slug) =>
    apiClient.get(`/products/${slug}`).then((body) => toProductCardModel(body.data)),
  getRelatedProducts: (slug, limit = 8) =>
    apiClient
      .get(`/products/${slug}/related`, { params: { limit } })
      .then((body) => (body.data?.items ?? []).map(toProductCardModel)),
};

export default productApi;
