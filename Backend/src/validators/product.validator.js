import validate from './validate.js';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const allowedSorts = [
  'name-asc',
  'name-desc',
  'price-asc',
  'price-desc',
  'rating-desc',
  'newest',
  'popular',
];

export const validateProductSlugParam = (req, _res, next) => {
  try {
    const { slug } = validate(req.params, {
      slug: {
        type: 'string',
        required: true,
        pattern: slugPattern,
        patternMessage: 'slug must be kebab-case',
      },
    });
    req.validatedParams = { ...(req.validatedParams || {}), slug };
    next();
  } catch (err) {
    next(err);
  }
};

export const validateProductQuery = (req, _res, next) => {
  try {
    req.validatedQuery = validate(req.query, {
      page: { type: 'number', min: 1, integer: true, default: 1 },
      limit: { type: 'number', min: 1, max: 60, integer: true, default: 12 },
      search: { type: 'string', max: 120, default: '' },
      category: { type: 'string', max: 80, default: '' },
      brand: { type: 'string', max: 80, default: '' },
      minPrice: { type: 'number', min: 0 },
      maxPrice: { type: 'number', min: 0 },
      inStock: { type: 'boolean' },
      sort: {
        type: 'string',
        enum: allowedSorts,
        default: 'popular',
      },
      featured: { type: 'boolean', default: false },
      bestSeller: { type: 'boolean', default: false },
      newArrival: { type: 'boolean', default: false },
      flashDeal: { type: 'boolean', default: false },
      popular: { type: 'boolean', default: false },
    });
    next();
  } catch (err) {
    next(err);
  }
};

export const validateProductCreate = (req, _res, next) => {
  try {
    req.validatedBody = validate(req.body, {
      name: { type: 'string', required: true, min: 2, max: 160 },
      slug: {
        type: 'string',
        required: true,
        pattern: slugPattern,
        patternMessage: 'slug must be kebab-case',
      },
      shortDescription: { type: 'string', max: 300, default: '' },
      description: { type: 'string', max: 2000, default: '' },
      category: { type: 'string', required: true },
      unit: { type: 'string', required: true, max: 40 },
      price: { type: 'number', required: true, min: 0 },
      mrp: { type: 'number', required: true, min: 0 },
      stock: { type: 'number', integer: true, min: 0, default: 0 },
      brand: { type: 'string', max: 80, default: '' },
      tags: { type: 'array', itemType: 'string', default: [] },
      images: { type: 'array', default: [] },
      isActive: { type: 'boolean', default: true },
      featured: { type: 'boolean', default: false },
      isBestSeller: { type: 'boolean', default: false },
      isNewArrival: { type: 'boolean', default: false },
      isFlashDeal: { type: 'boolean', default: false },
      isPopular: { type: 'boolean', default: false },
    });
    next();
  } catch (err) {
    next(err);
  }
};

export const validateProductUpdate = (req, _res, next) => {
  try {
    req.validatedBody = validate(req.body, {
      name: { type: 'string', min: 2, max: 160 },
      slug: {
        type: 'string',
        pattern: slugPattern,
        patternMessage: 'slug must be kebab-case',
      },
      shortDescription: { type: 'string', max: 300 },
      description: { type: 'string', max: 2000 },
      category: { type: 'string' },
      unit: { type: 'string', max: 40 },
      price: { type: 'number', min: 0 },
      mrp: { type: 'number', min: 0 },
      stock: { type: 'number', integer: true, min: 0 },
      brand: { type: 'string', max: 80 },
      tags: { type: 'array', itemType: 'string' },
      images: { type: 'array' },
      isActive: { type: 'boolean' },
      featured: { type: 'boolean' },
      isBestSeller: { type: 'boolean' },
      isNewArrival: { type: 'boolean' },
      isFlashDeal: { type: 'boolean' },
      isPopular: { type: 'boolean' },
    });
    next();
  } catch (err) {
    next(err);
  }
};
