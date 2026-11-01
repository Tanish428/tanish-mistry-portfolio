import apiClient from './client.js';

/**
 * Retrieves all published and visible homepage sections with resolved content.
 * Target: GET /api/v1/portfolio/homepage-sections
 *
 * @param {RequestInit} [options]
 * @returns {Promise<Array<object>>} List of populated section objects in displayOrder
 */
export async function getHomepageSections(options = {}) {
  const response = await apiClient.get('/api/v1/portfolio/homepage-sections', options);
  return response?.data?.sections || [];
}

/**
 * Retrieves a single published project by its unique slug.
 * Target: GET /api/v1/portfolio/projects/:slug
 *
 * @param {string} slug
 * @param {RequestInit} [options]
 * @returns {Promise<object>} Project document
 */
export async function getProjectBySlug(slug, options = {}) {
  if (!slug || typeof slug !== 'string') {
    throw new Error('Project slug is required');
  }
  const response = await apiClient.get(`/api/v1/portfolio/projects/${encodeURIComponent(slug.trim())}`, options);
  return response?.data?.project;
}

/**
 * Submits a message through the public contact form.
 * Target: POST /api/v1/portfolio/contact
 * Automatically protected by centralized double-submit CSRF token.
 *
 * @param {{ name: string, email: string, subject: string, message: string }} data
 * @returns {Promise<object>}
 */
export async function submitContactMessage(data) {
  const response = await apiClient.post('/api/v1/portfolio/contact', data);
  return response?.data;
}
