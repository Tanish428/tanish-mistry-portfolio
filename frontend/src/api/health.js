import apiClient from './client.js';

/**
 * Retrieves backend API liveness status.
 * Target endpoint: GET /api/v1/health/live
 *
 * @param {RequestInit} [options]
 * @returns {Promise<{ success: boolean, message: string, data: { status: string, timestamp: string } }>}
 */
export async function getHealthLive(options = {}) {
  return apiClient.get('/api/v1/health/live', options);
}

/**
 * Retrieves backend API readiness status (checks database connectivity).
 * Target endpoint: GET /api/v1/health/ready
 *
 * @param {RequestInit} [options]
 * @returns {Promise<{ success: boolean, message: string, data: { status: string, database: string, timestamp: string } }>}
 */
export async function getHealthReady(options = {}) {
  return apiClient.get('/api/v1/health/ready', options);
}
