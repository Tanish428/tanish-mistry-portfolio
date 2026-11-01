import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as authApi from './authApi.js';
import * as csrf from './csrf.js';
import { apiClient, ApiError } from './client.js';

describe('Authentication & CSRF Security Suite (src/api/authApi.js & src/api/csrf.js)', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    csrf.clearCsrfToken();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    csrf.clearCsrfToken();
  });

  it('1. CSRF token acquisition: retrieves token and stores in-memory only', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        message: 'CSRF token generated',
        data: { csrfToken: 'test-csrf-token-123' },
      }),
    });

    const token = await csrf.getOrFetchCsrfToken(apiClient.request);
    expect(token).toBe('test-csrf-token-123');
    expect(csrf.getStoredCsrfToken()).toBe('test-csrf-token-123');

    // Verify no storage leakage
    expect(localStorage.getItem('csrfToken')).toBeNull();
    expect(sessionStorage.getItem('csrfToken')).toBeNull();
  });

  it('2. CSRF header attachment: mutating requests automatically attach x-csrf-token', async () => {
    csrf.setCsrfToken('active-session-csrf-token');

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true, message: 'Updated', data: null }),
    });

    await apiClient.post('/api/v1/admin/sample-mutation', { value: 42 });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/v1/admin/sample-mutation',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({
          'x-csrf-token': 'active-session-csrf-token',
        }),
      })
    );
  });

  it('3. Login success: updates in-memory CSRF token and returns admin profile without writing to storage', async () => {
    const mockAdmin = { id: 'admin-1', name: 'Tanish Mistry', email: 'admin@example.com' };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        message: 'Login successful',
        data: {
          admin: mockAdmin,
          csrfToken: 'post-login-csrf-token-abc',
        },
      }),
    });

    const result = await authApi.login('admin@example.com', 'ValidPassword123!');

    expect(result).toEqual(mockAdmin);
    expect(csrf.getStoredCsrfToken()).toBe('post-login-csrf-token-abc');

    // Strict security check: neither JWT nor CSRF token in browser persistent storage
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('jwt')).toBeNull();
    expect(localStorage.getItem('csrfToken')).toBeNull();
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('csrfToken')).toBeNull();
  });

  it('4. Invalid credentials: throws 401 ApiError with backend generic error message', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: false,
        message: 'Invalid email or password',
        data: null,
      }),
    });

    await expect(authApi.login('admin@example.com', 'WrongPassword!'))
      .rejects
      .toThrow(ApiError);

    try {
      await authApi.login('admin@example.com', 'WrongPassword!');
    } catch (err) {
      expect(err.status).toBe(401);
      expect(err.message).toBe('Invalid email or password');
    }
  });

  it('5. HTTP 429 handling: rate limit response is cleanly mapped to ApiError', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: false,
        message: 'Too many login attempts. Please try again after 15 minutes.',
        data: null,
      }),
    });

    try {
      await authApi.login('admin@example.com', 'Password123!');
      expect.unreachable('Should have thrown ApiError on 429');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(429);
      expect(err.message).toMatch(/Too many login attempts/i);
    }
  });

  it('6. Logout: sends CSRF header, clears in-memory CSRF token upon completion', async () => {
    csrf.setCsrfToken('token-before-logout');

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        message: 'Logout successful',
        data: null,
      }),
    });

    await authApi.logout();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/v1/auth/logout',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-csrf-token': 'token-before-logout',
        }),
      })
    );

    // Verify token was cleared
    expect(csrf.getStoredCsrfToken()).toBeNull();
  });

  it('7. CSRF failure handling: 403 CSRF error triggers token refresh and single retry', async () => {
    csrf.setCsrfToken('stale-token');

    let requestCount = 0;
    globalThis.fetch = vi.fn().mockImplementation(async (url) => {
      requestCount++;
      if (url.includes('/csrf-token')) {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: { csrfToken: 'refreshed-token-xyz' },
          }),
        };
      }

      if (requestCount === 1) {
        // First attempt fails with 403 Invalid or missing CSRF token
        return {
          ok: false,
          status: 403,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: false,
            message: 'Invalid or missing CSRF token',
            data: null,
          }),
        };
      }

      // Retry succeeds with refreshed token
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          message: 'Saved successfully',
          data: { saved: true },
        }),
      };
    });

    const result = await apiClient.post('/api/v1/admin/projects', { name: 'New Project' });
    expect(result.data.saved).toBe(true);
    expect(csrf.getStoredCsrfToken()).toBe('refreshed-token-xyz');
  });
});
