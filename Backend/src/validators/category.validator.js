import validate from './validate.js';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const validateCategorySlugParam = (req, _res, next) => {
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

export const validateCategoryQuery = (req, _res, next) => {
  try {
    req.validatedQuery = validate(req.query, {
      includeInactive: { type: 'boolean', default: false },
    });
    next();
  } catch (err) {
    next(err);
  }
};

export const validateCategoryCreate = (req, _res, next) => {
  try {
    req.validatedBody = validate(req.body, {
      name: { type: 'string', required: true, min: 2, max: 80 },
      slug: {
        type: 'string',
        required: true,
        pattern: slugPattern,
        patternMessage: 'slug must be kebab-case',
      },
      description: { type: 'string', max: 500, default: '' },
      image: { type: 'string', default: '' },
      icon: { type: 'string', default: '' },
      isActive: { type: 'boolean', default: true },
      sortOrder: { type: 'number', integer: true, default: 0 },
    });
    next();
  } catch (err) {
    next(err);
  }
};

export const validateCategoryUpdate = (req, _res, next) => {
  try {
    req.validatedBody = validate(req.body, {
      name: { type: 'string', min: 2, max: 80 },
      slug: {
        type: 'string',
        pattern: slugPattern,
        patternMessage: 'slug must be kebab-case',
      },
      description: { type: 'string', max: 500 },
      image: { type: 'string' },
      icon: { type: 'string' },
      isActive: { type: 'boolean' },
      sortOrder: { type: 'number', integer: true },
    });
    next();
  } catch (err) {
    next(err);
  }
};
