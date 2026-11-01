import { getOrFetchCsrfToken } from './csrf.js';

/**
 * Custom error class representing API failures with HTTP status and backend payload.
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Resolves the API base URL. Defaults to empty string so requests are relative
 * to the origin (allowing the Vite dev proxy to seamlessly handle /api/v1).
 */
export const getApiBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }
  return '';
};

/**
 * Core HTTP request handler using native fetch.
 *
 * @param {string} endpoint - Relative API route (e.g. '/api/v1/health/live')
 * @param {RequestInit & { body?: any, params?: Record<string, any>, skipCsrf?: boolean, _isCsrfRetry?: boolean }} [options]
 * @returns {Promise<any>} Parsed response data
 */
export async function request(endpoint, options = {}) {
  const { body, params, headers = {}, skipCsrf = false, _isCsrfRetry = false, ...customConfig } = options;

  let url = `${getApiBaseUrl()}${endpoint}`;

  if (params && typeof params === 'object') {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    }
    const queryString = query.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const reqHeaders = { ...headers };
  const method = (customConfig.method || 'GET').toUpperCase();
  const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  const requiresCsrf = isMutating && !skipCsrf;

  // Automatically attach CSRF token to mutating requests unless explicitly skipped
  if (requiresCsrf && !reqHeaders['x-csrf-token'] && !reqHeaders['csrf-token']) {
    try {
      const csrfToken = await getOrFetchCsrfToken(request);
      if (csrfToken) {
        reqHeaders['x-csrf-token'] = csrfToken;
      }
    } catch (csrfErr) {
      // Propagate CSRF retrieval failure (e.g. server offline)
      if (csrfErr instanceof ApiError) {
        throw csrfErr;
      }
      throw new ApiError(csrfErr.message || 'Failed to acquire CSRF security token', 0, null);
    }
  }

  let reqBody = body;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  if (body !== undefined && body !== null && !isFormData) {
    if (typeof body === 'object') {
      reqBody = JSON.stringify(body);
      if (!reqHeaders['Content-Type'] && !reqHeaders['content-type']) {
        reqHeaders['Content-Type'] = 'application/json';
      }
    }
  }

  const config = {
    method,
    credentials: 'include',
    headers: reqHeaders,
    body: reqBody,
    ...customConfig,
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err;
    }
    throw new ApiError(err.message || 'Network request failed', 0, null);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return { success: true, data: null };
  }

  const contentType = response.headers.get('content-type') || '';
  let responseData;

  if (contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      throw new ApiError('Malformed JSON response from server', response.status, null);
    }
  } else {
    // Non-JSON response (e.g. text or HTML error page from reverse proxy)
    const rawText = await response.text();
    if (!response.ok) {
      throw new ApiError(rawText || `Request failed with status ${response.status}`, response.status, null);
    }
    return rawText;
  }

  if (!response.ok) {
    const errorMessage =
      (responseData && typeof responseData === 'object' && responseData.message) ||
      `Request failed with status ${response.status}`;
    const errorData = (responseData && typeof responseData === 'object' && responseData.data) || null;

    // Check for CSRF token rejection and retry once if applicable
    const isCsrfError =
      response.status === 403 &&
      typeof errorMessage === 'string' &&
      /csrf/i.test(errorMessage);

    if (isCsrfError && requiresCsrf && !_isCsrfRetry) {
      try {
        const freshToken = await getOrFetchCsrfToken(request, true);
        return await request(endpoint, {
          ...options,
          _isCsrfRetry: true,
          headers: {
            ...headers,
            'x-csrf-token': freshToken,
          },
        });
      } catch {
        // Fall through to regular error throw below
      }
    }

    throw new ApiError(errorMessage, response.status, errorData);
  }

  return responseData;
}

export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
  request,
};

export default apiClient;
