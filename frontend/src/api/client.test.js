import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient, ApiError } from './client.js';

describe('API Client (src/api/client.js)', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('1. Handles successful JSON responses correctly', async () => {
    const mockData = { success: true, message: 'Success', data: { id: 1, name: 'Portfolio' } };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockData,
    });

    const result = await apiClient.get('/api/v1/projects');

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/projects', expect.objectContaining({
      method: 'GET',
      credentials: 'include',
    }));
    expect(result).toEqual(mockData);
  });

  it('2. Preserves backend error messages and status codes on API failure', async () => {
    const errorPayload = {
      success: false,
      message: 'Invalid email or password',
      data: null,
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => errorPayload,
    });

    await expect(apiClient.post('/api/v1/auth/login', { email: 'bad@test.com' }))
      .rejects
      .toThrow(ApiError);

    try {
      await apiClient.post('/api/v1/auth/login', { email: 'bad@test.com' });
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe('Invalid email or password');
      expect(err.status).toBe(401);
      expect(err.data).toBeNull();
    }
  });

  it('3. Handles network failures gracefully by throwing ApiError with status 0', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(apiClient.get('/api/v1/health/live'))
      .rejects
      .toThrow('Failed to fetch');

    try {
      await apiClient.get('/api/v1/health/live');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(0);
    }
  });

  it('4. Handles FormData without forcing Content-Type header', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true, data: { url: 'https://example.com/img.png' } }),
    });

    const formData = new FormData();
    formData.append('image', new Blob(['test-binary']), 'test.png');

    await apiClient.post('/api/v1/admin/media/images', formData);

    const callArgs = globalThis.fetch.mock.calls[0];
    const fetchOptions = callArgs[1];

    expect(fetchOptions.headers['Content-Type']).toBeUndefined();
    expect(fetchOptions.headers['content-type']).toBeUndefined();
    expect(fetchOptions.body).toBe(formData);
  });

  it('5. Handles request cancellation via AbortController signal', async () => {
    const controller = new AbortController();
    controller.abort();

    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';

    globalThis.fetch = vi.fn().mockRejectedValue(abortError);

    await expect(apiClient.get('/api/v1/slow-endpoint', { signal: controller.signal }))
      .rejects
      .toThrow('The operation was aborted');
  });

  it('6. Serializes query parameters accurately', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true, data: [] }),
    });

    await apiClient.get('/api/v1/projects', {
      params: { category: 'web', featured: true, limit: 10, empty: '' },
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/v1/projects?category=web&featured=true&limit=10',
      expect.anything()
    );
  });

  it('7. Handles 204 No Content responses cleanly', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: new Headers(),
    });

    const res = await apiClient.delete('/api/v1/admin/projects/123');
    expect(res).toEqual({ success: true, data: null });
  });
});
