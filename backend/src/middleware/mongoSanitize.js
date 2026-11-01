const MAX_DEPTH = 20;

/**
 * Recursively inspects whether an object or array contains keys with
 * prohibited MongoDB query/update operators (keys beginning with '$' or containing '.').
 *
 * Does not reject or inspect string values, numbers, booleans, or other primitives.
 *
 * @param {*} target - Value to inspect
 * @param {number} [depth=0] - Current recursion depth
 * @param {WeakSet} [seen=new WeakSet()] - Visited object tracker to guard against circular references
 * @returns {boolean} - True if any key is prohibited
 */
export const hasMongoOperators = (target, depth = 0, seen = new WeakSet()) => {
  if (depth > MAX_DEPTH) {
    // Treat excessive recursion depth as a malformed or suspicious payload
    return true;
  }

  if (!target || typeof target !== 'object') {
    return false;
  }

  if (seen.has(target)) {
    return false;
  }
  seen.add(target);

  if (Array.isArray(target)) {
    for (let i = 0; i < target.length; i++) {
      const item = target[i];
      if (typeof item === 'object' && item !== null) {
        if (hasMongoOperators(item, depth + 1, seen)) {
          return true;
        }
      }
    }
    return false;
  }

  const keys = Object.keys(target);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key.includes('$') || key.includes('.')) {
      return true;
    }
    const val = target[key];
    if (typeof val === 'object' && val !== null) {
      if (hasMongoOperators(val, depth + 1, seen)) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Centralized Express middleware to guard against MongoDB operator injection.
 * Inspects incoming request data (req.body, req.query, and req.params if populated)
 * for prohibited operator keys (keys containing '$' or '.') without mutating request data.
 *
 * Execution lifecycle notice:
 * When mounted globally at the application level (before route matching), this middleware
 * guards parsed req.body and req.query. Route parameters (req.params) are not populated
 * until Express matches a specific route pattern, and are validated at route level by
 * dedicated validators (e.g. validateObjectId, validateSlugParam). If mongoSanitize is
 * mounted at the router/route level, req.params is also inspected.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const mongoSanitize = (req, res, next) => {
  if (
    hasMongoOperators(req.body) ||
    hasMongoOperators(req.query) ||
    hasMongoOperators(req.params)
  ) {
    return res.status(400).json({
      success: false,
      message: 'Prohibited operator character in request data',
      data: null,
    });
  }

  next();
};

export default mongoSanitize;
