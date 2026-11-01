let inMemoryCsrfToken = null;
let pendingCsrfPromise = null;

/**
 * Returns the currently held in-memory CSRF token, if any.
 * Never persists to localStorage or sessionStorage.
 *
 * @returns {string|null}
 */
export const getStoredCsrfToken = () => inMemoryCsrfToken;

/**
 * Explicitly updates the in-memory CSRF token (e.g. from login response).
 *
 * @param {string|null} token
 */
export const setCsrfToken = (token) => {
  inMemoryCsrfToken = typeof token === 'string' && token.trim() ? token.trim() : null;
};

/**
 * Clears the in-memory CSRF token and resets any in-flight promises.
 */
export const clearCsrfToken = () => {
  inMemoryCsrfToken = null;
  pendingCsrfPromise = null;
};

/**
 * Retrieves a valid CSRF token, either from memory or by requesting a fresh one
 * from GET /api/v1/auth/csrf-token. In-flight requests are deduplicated.
 *
 * @param {Function} requestFn - Request function to invoke without circular dependency
 * @param {boolean} [forceRefresh=false] - Whether to bypass memory and fetch fresh token
 * @returns {Promise<string>}
 */
export async function getOrFetchCsrfToken(requestFn, forceRefresh = false) {
  if (inMemoryCsrfToken && !forceRefresh) {
    return inMemoryCsrfToken;
  }

  if (pendingCsrfPromise) {
    return pendingCsrfPromise;
  }

  pendingCsrfPromise = (async () => {
    try {
      const response = await requestFn('/api/v1/auth/csrf-token', {
        method: 'GET',
        skipCsrf: true,
      });

      const token = response?.data?.csrfToken;
      if (!token || typeof token !== 'string') {
        throw new Error('Server returned an empty or invalid CSRF token');
      }

      inMemoryCsrfToken = token;
      return token;
    } finally {
      pendingCsrfPromise = null;
    }
  })();

  return pendingCsrfPromise;
}
