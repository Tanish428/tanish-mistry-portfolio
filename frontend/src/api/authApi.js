import apiClient from './client.js';
import { setCsrfToken, clearCsrfToken } from './csrf.js';

/**
 * Submits administrator login credentials.
 * Target: POST /api/v1/auth/login
 * Note: Login is a public rate-limited endpoint that does not require CSRF token.
 * On success, backend sets HttpOnly auth cookie and returns fresh CSRF token in data.csrfToken.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ id: string, name: string, email: string }>} Admin profile
 */
export async function login(email, password) {
  const response = await apiClient.post(
    '/api/v1/auth/login',
    { email, password },
    { skipCsrf: true }
  );

  if (response?.data?.csrfToken) {
    setCsrfToken(response.data.csrfToken);
  }

  return response?.data?.admin;
}

/**
 * Retrieves the currently authenticated administrator profile using HttpOnly cookie.
 * Target: GET /api/v1/auth/me
 *
 * @returns {Promise<{ id: string, name: string, email: string }>} Admin profile
 */
export async function getCurrentAdmin() {
  const response = await apiClient.get('/api/v1/auth/me');
  return response?.data?.admin;
}

/**
 * Logs out the administrator, clears HttpOnly auth and CSRF cookies on the server,
 * and clears the in-memory CSRF token.
 * Target: POST /api/v1/auth/logout (protected by authenticate + doubleCsrfProtection)
 *
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function logout() {
  try {
    const response = await apiClient.post('/api/v1/auth/logout');
    return response;
  } finally {
    clearCsrfToken();
  }
}
