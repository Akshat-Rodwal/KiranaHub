import ApiError from '../utils/ApiError.js';
import httpStatus from '../constants/httpStatus.js';

const isPlainObject = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const checkers = {
  string: (value) => typeof value === 'string',
  number: (value) => typeof value === 'number' && Number.isFinite(value),
  boolean: (value) => typeof value === 'boolean',
  array: (value) => Array.isArray(value),
  object: (value) => isPlainObject(value),
};

const coerce = (value, type) => {
  if (value === undefined || value === null) return value;
  if (type === 'number') {
    const num = Number(value);
    return Number.isNaN(num) ? value : num;
  }
  if (type === 'boolean') {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  }
  return value;
};

/**
 * Validates `source` against a field rule map. Unknown fields are ignored.
 * Returns a new object with only declared, coerced fields — never the raw input.
 *
 * @param {object} source - req.body | req.query | req.params
 * @param {object} rules - field: { type, required, min, max, enum, itemType, pattern, trim }
 */
const validate = (source, rules) => {
  const errors = [];
  const out = {};

  for (const [field, rule] of Object.entries(rules)) {
    let value = coerce(source?.[field], rule.type);
    const label = rule.label || field;

    if (typeof value === 'string' && rule.trim !== false) {
      value = value.trim();
    }

    const missing =
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value === '') ||
      (rule.type === 'array' && Array.isArray(value) && value.length === 0);

    if (missing) {
      if (rule.required) errors.push(`${label} is required`);
      else if (rule.default !== undefined) out[field] = rule.default;
      continue;
    }

    const checker = checkers[rule.type];
    if (checker && !checker(value)) {
      errors.push(`${label} must be a ${rule.type}`);
      continue;
    }

    if (rule.type === 'number') {
      if (rule.min !== undefined && value < rule.min)
        errors.push(`${label} must be at least ${rule.min}`);
      if (rule.max !== undefined && value > rule.max)
        errors.push(`${label} must be at most ${rule.max}`);
      if (rule.integer && !Number.isInteger(value))
        errors.push(`${label} must be an integer`);
    }

    if (rule.type === 'string') {
      if (rule.min !== undefined && value.length < rule.min)
        errors.push(`${label} must be at least ${rule.min} characters`);
      if (rule.max !== undefined && value.length > rule.max)
        errors.push(`${label} must be at most ${rule.max} characters`);
      if (rule.pattern && !rule.pattern.test(value))
        errors.push(rule.patternMessage || `${label} has an invalid format`);
      if (rule.enum && !rule.enum.includes(value))
        errors.push(`${label} must be one of: ${rule.enum.join(', ')}`);
    }

    if (rule.type === 'array' && rule.itemType) {
      const itemChecker = checkers[rule.itemType];
      if (itemChecker && !value.every(itemChecker)) {
        errors.push(`Every ${label} entry must be a ${rule.itemType}`);
        continue;
      }
    }

    out[field] = value;
  }

  if (errors.length > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Validation failed', errors);
  }

  return out;
};

export default validate;
