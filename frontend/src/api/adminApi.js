import apiClient from './client.js';

// ==========================================
// 1. PROFILE API
// ==========================================

export async function getAdminProfile() {
  const response = await apiClient.get('/api/v1/admin/profile');
  return response?.data?.profile;
}

export async function createAdminProfile(profileData) {
  const response = await apiClient.post('/api/v1/admin/profile', profileData);
  return response?.data?.profile;
}

export async function updateAdminProfile(updateData) {
  const response = await apiClient.patch('/api/v1/admin/profile', updateData);
  return response?.data?.profile;
}

export async function publishAdminProfile() {
  const response = await apiClient.patch('/api/v1/admin/profile/publish');
  return response?.data?.profile;
}

export async function unpublishAdminProfile() {
  const response = await apiClient.patch('/api/v1/admin/profile/unpublish');
  return response?.data?.profile;
}

// ==========================================
// 2. PROJECTS API
// ==========================================

export async function getAdminProjects(params = {}) {
  const response = await apiClient.get('/api/v1/admin/projects', { params });
  return response?.data; // { projects: [...], pagination: {...} }
}

export async function getAdminProjectById(id) {
  const response = await apiClient.get(`/api/v1/admin/projects/${id}`);
  return response?.data?.project;
}

export async function createAdminProject(projectData) {
  const response = await apiClient.post('/api/v1/admin/projects', projectData);
  return response?.data?.project;
}

export async function updateAdminProject(id, updateData) {
  const response = await apiClient.patch(`/api/v1/admin/projects/${id}`, updateData);
  return response?.data?.project;
}

export async function deleteAdminProject(id) {
  const response = await apiClient.delete(`/api/v1/admin/projects/${id}`);
  return response?.data;
}

export async function publishAdminProject(id) {
  const response = await apiClient.patch(`/api/v1/admin/projects/${id}/publish`);
  return response?.data?.project;
}

export async function unpublishAdminProject(id) {
  const response = await apiClient.patch(`/api/v1/admin/projects/${id}/unpublish`);
  return response?.data?.project;
}

export async function setAdminProjectFeatured(id, isFeatured) {
  const response = await apiClient.patch(`/api/v1/admin/projects/${id}/featured`, { isFeatured });
  return response?.data?.project;
}

export async function reorderAdminProjects(projects) {
  const response = await apiClient.patch('/api/v1/admin/projects/reorder', { projects });
  return response?.data;
}

// ==========================================
// 3. SKILLS & CATEGORIES API
// ==========================================

export async function getAdminSkillCategories(params = {}) {
  const response = await apiClient.get('/api/v1/admin/skill-categories', { params });
  return response?.data; // { categories: [...] }
}

export async function getAdminSkillCategoryById(id) {
  const response = await apiClient.get(`/api/v1/admin/skill-categories/${id}`);
  return response?.data?.category;
}

export async function createAdminSkillCategory(categoryData) {
  const response = await apiClient.post('/api/v1/admin/skill-categories', categoryData);
  return response?.data?.category;
}

export async function updateAdminSkillCategory(id, updateData) {
  const response = await apiClient.patch(`/api/v1/admin/skill-categories/${id}`, updateData);
  return response?.data?.category;
}

export async function deleteAdminSkillCategory(id) {
  const response = await apiClient.delete(`/api/v1/admin/skill-categories/${id}`);
  return response?.data;
}

export async function publishAdminSkillCategory(id) {
  const response = await apiClient.patch(`/api/v1/admin/skill-categories/${id}/publish`);
  return response?.data?.category;
}

export async function unpublishAdminSkillCategory(id) {
  const response = await apiClient.patch(`/api/v1/admin/skill-categories/${id}/unpublish`);
  return response?.data?.category;
}

export async function getAdminSkills(params = {}) {
  const response = await apiClient.get('/api/v1/admin/skills', { params });
  return response?.data; // { skills: [...] }
}

export async function getAdminSkillById(id) {
  const response = await apiClient.get(`/api/v1/admin/skills/${id}`);
  return response?.data?.skill;
}

export async function createAdminSkill(skillData) {
  const response = await apiClient.post('/api/v1/admin/skills', skillData);
  return response?.data?.skill;
}

export async function updateAdminSkill(id, updateData) {
  const response = await apiClient.patch(`/api/v1/admin/skills/${id}`, updateData);
  return response?.data?.skill;
}

export async function deleteAdminSkill(id) {
  const response = await apiClient.delete(`/api/v1/admin/skills/${id}`);
  return response?.data;
}

export async function publishAdminSkill(id) {
  const response = await apiClient.patch(`/api/v1/admin/skills/${id}/publish`);
  return response?.data?.skill;
}

export async function unpublishAdminSkill(id) {
  const response = await apiClient.patch(`/api/v1/admin/skills/${id}/unpublish`);
  return response?.data?.skill;
}

export async function setAdminSkillFeatured(id, isFeatured) {
  const response = await apiClient.patch(`/api/v1/admin/skills/${id}/featured`, { isFeatured });
  return response?.data?.skill;
}

// ==========================================
// 4. EXPERIENCE & EDUCATION API
// ==========================================

export async function getAdminExperience(params = {}) {
  const response = await apiClient.get('/api/v1/admin/experience', { params });
  return response?.data; // { experience: [...] }
}

export async function createAdminExperience(data) {
  const response = await apiClient.post('/api/v1/admin/experience', data);
  return response?.data?.experience;
}

export async function updateAdminExperience(id, data) {
  const response = await apiClient.patch(`/api/v1/admin/experience/${id}`, data);
  return response?.data?.experience;
}

export async function deleteAdminExperience(id) {
  const response = await apiClient.delete(`/api/v1/admin/experience/${id}`);
  return response?.data;
}

export async function publishAdminExperience(id) {
  const response = await apiClient.patch(`/api/v1/admin/experience/${id}/publish`);
  return response?.data?.experience;
}

export async function unpublishAdminExperience(id) {
  const response = await apiClient.patch(`/api/v1/admin/experience/${id}/unpublish`);
  return response?.data?.experience;
}

export async function getAdminEducation(params = {}) {
  const response = await apiClient.get('/api/v1/admin/education', { params });
  return response?.data; // { education: [...] }
}

export async function createAdminEducation(data) {
  const response = await apiClient.post('/api/v1/admin/education', data);
  return response?.data?.education;
}

export async function updateAdminEducation(id, data) {
  const response = await apiClient.patch(`/api/v1/admin/education/${id}`, data);
  return response?.data?.education;
}

export async function deleteAdminEducation(id) {
  const response = await apiClient.delete(`/api/v1/admin/education/${id}`);
  return response?.data;
}

export async function publishAdminEducation(id) {
  const response = await apiClient.patch(`/api/v1/admin/education/${id}/publish`);
  return response?.data?.education;
}

export async function unpublishAdminEducation(id) {
  const response = await apiClient.patch(`/api/v1/admin/education/${id}/unpublish`);
  return response?.data?.education;
}

// ==========================================
// 5. MEDIA LIBRARY API
// ==========================================

export async function getAdminMedia(params = {}) {
  const response = await apiClient.get('/api/v1/admin/media', { params });
  return response?.data; // { media: [...], pagination: { ... } }
}

export async function getAdminMediaById(id) {
  const response = await apiClient.get(`/api/v1/admin/media/${id}`);
  return response?.data;
}

export async function uploadAdminMedia(formData) {
  const response = await apiClient.post('/api/v1/admin/media/images', formData);
  return response?.data; // media object { id, secureUrl, ... }
}

export async function deleteAdminMedia(id) {
  const response = await apiClient.delete(`/api/v1/admin/media/${id}`);
  return response?.data;
}

// ==========================================
// 6. HOMEPAGE SECTIONS API
// ==========================================

export async function getAdminHomepageSections() {
  const response = await apiClient.get('/api/v1/admin/homepage-sections');
  return response?.data; // { sections: [...] }
}

export async function getAdminHomepageSectionById(id) {
  const response = await apiClient.get(`/api/v1/admin/homepage-sections/${id}`);
  return response?.data?.section;
}

export async function createAdminHomepageSection(sectionData) {
  const response = await apiClient.post('/api/v1/admin/homepage-sections', sectionData);
  return response?.data?.section;
}

export async function updateAdminHomepageSection(id, sectionData) {
  const response = await apiClient.patch(`/api/v1/admin/homepage-sections/${id}`, sectionData);
  return response?.data?.section;
}

export async function deleteAdminHomepageSection(id) {
  const response = await apiClient.delete(`/api/v1/admin/homepage-sections/${id}`);
  return response?.data;
}

export async function publishAdminHomepageSection(id) {
  const response = await apiClient.patch(`/api/v1/admin/homepage-sections/${id}/publish`);
  return response?.data?.section;
}

export async function unpublishAdminHomepageSection(id) {
  const response = await apiClient.patch(`/api/v1/admin/homepage-sections/${id}/unpublish`);
  return response?.data?.section;
}

export async function reorderAdminHomepageSections(sectionsArray) {
  const response = await apiClient.patch('/api/v1/admin/homepage-sections/reorder', sectionsArray);
  return response?.data;
}
