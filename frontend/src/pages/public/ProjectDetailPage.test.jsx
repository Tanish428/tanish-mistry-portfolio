import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProjectDetailPage from './ProjectDetailPage.jsx';
import * as portfolioApi from '../../api/portfolioApi.js';

vi.mock('../../api/portfolioApi.js');

describe('ProjectDetailPage (src/pages/public/ProjectDetailPage.jsx)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Fetches project by slug and renders details, technologies, and features', async () => {
    const mockProject = {
      id: 'proj-1',
      title: 'Full Stack CMS Platform',
      slug: 'full-stack-cms',
      category: 'web-application',
      shortDescription: 'A modular monolithic developer portfolio and CMS.',
      description: 'Extensive overview of the MERN architecture.',
      technologies: ['React 19', 'Express 5', 'MongoDB', 'Cloudinary'],
      keyFeatures: ['Dynamic block rendering', 'CSRF double-submit protection', 'HttpOnly auth'],
      liveDemoUrl: 'https://demo.portfolio.dev',
      repositoryUrl: 'https://github.com/Tanish428/portfolio',
      role: 'Lead Architect',
      isFeatured: true,
    };

    portfolioApi.getProjectBySlug.mockResolvedValue(mockProject);

    render(
      <MemoryRouter initialEntries={['/projects/full-stack-cms']}>
        <Routes>
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { level: 1, name: 'Full Stack CMS Platform' })).toBeInTheDocument();
    expect(screen.getByText(/Lead Architect/i)).toBeInTheDocument();
    expect(screen.getByText(/Dynamic block rendering/i)).toBeInTheDocument();
    expect(screen.getByText('React 19')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Live Demo ↗/i })).toHaveAttribute('href', 'https://demo.portfolio.dev');
    expect(screen.getByRole('link', { name: /GitHub Repo ↗/i })).toHaveAttribute('href', 'https://github.com/Tanish428/portfolio');
  });

  it('2. Invalid project slug: displays 404 Project Not Found view when project is missing', async () => {
    const error404 = new Error('Project not found');
    error404.status = 404;
    portfolioApi.getProjectBySlug.mockRejectedValue(error404);

    render(
      <MemoryRouter initialEntries={['/projects/non-existent-slug']}>
        <Routes>
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/404 Not Found/i)).toBeInTheDocument();
    expect(screen.getByText(/Project Not Found/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /← Back to Projects/i })).toBeInTheDocument();
  });
});
