import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProjectManager from './ProjectManager.jsx';
import * as adminApi from '../../api/adminApi.js';

vi.mock('../../api/adminApi.js');

describe('ProjectManager Component (src/pages/admin/ProjectManager.jsx)', () => {
  const mockProjects = [
    {
      id: 'proj-1',
      title: 'AI Portfolio CMS',
      slug: 'ai-portfolio-cms',
      summary: 'A modular portfolio engine with CMS',
      category: 'full_stack',
      isFeatured: true,
      isPublished: true,
      displayOrder: 0,
    },
    {
      id: 'proj-2',
      title: 'DevOps Automation Pipeline',
      slug: 'devops-automation-pipeline',
      summary: 'CI/CD pipeline orchestrator',
      category: 'cloud_devops',
      isFeatured: false,
      isPublished: false,
      displayOrder: 1,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Renders project list and summary details', async () => {
    adminApi.getAdminProjects.mockResolvedValue({
      projects: mockProjects,
      pagination: { total: 2 },
    });

    render(<ProjectManager />);

    expect(screen.getByText(/Loading projects.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('AI Portfolio CMS')).toBeInTheDocument();
      expect(screen.getByText('DevOps Automation Pipeline')).toBeInTheDocument();
    });

    expect(screen.getByText('/ai-portfolio-cms')).toBeInTheDocument();
  });

  it('2. Opens create modal and creates a new project', async () => {
    const user = userEvent.setup();
    adminApi.getAdminProjects.mockResolvedValue({
      projects: mockProjects,
      pagination: { total: 2 },
    });
    adminApi.createAdminProject.mockResolvedValue({
      id: 'proj-3',
      title: 'New React App',
      slug: 'new-react-app',
      category: 'frontend',
    });

    render(<ProjectManager />);

    await waitFor(() => {
      expect(screen.getByText('AI Portfolio CMS')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /\+ Add New Project/i });
    await user.click(addBtn);

    expect(screen.getByRole('heading', { name: /Add New Project/i })).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/Project Title \*/i);
    await user.type(titleInput, 'New React App');

    const summaryInput = screen.getByLabelText(/Short Description \*/i);
    await user.type(summaryInput, 'A great project built with modern React 19.');

    const techInput = screen.getByLabelText(/Technologies \(comma-separated\) \*/i);
    await user.type(techInput, 'React, Vite, Node.js');

    const submitBtn = screen.getByRole('button', { name: /Create Project/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(adminApi.createAdminProject).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New React App',
          shortDescription: 'A great project built with modern React 19.',
        })
      );
    });

    expect(await screen.findByText(/Project created in draft!/i)).toBeInTheDocument();
  });

  it('3. Toggles project publication status', async () => {
    const user = userEvent.setup();
    adminApi.getAdminProjects.mockResolvedValue({
      projects: mockProjects,
      pagination: { total: 2 },
    });
    adminApi.unpublishAdminProject.mockResolvedValue({
      ...mockProjects[0],
      isPublished: false,
    });

    render(<ProjectManager />);

    await waitFor(() => {
      expect(screen.getByText('AI Portfolio CMS')).toBeInTheDocument();
    });

    const publishedBtn = screen.getByRole('button', { name: /^Published$/i });
    await user.click(publishedBtn);

    await waitFor(() => {
      expect(adminApi.unpublishAdminProject).toHaveBeenCalledWith('proj-1');
    });
  });

  it('4. Handles project deletion with confirmation dialog', async () => {
    const user = userEvent.setup();
    adminApi.getAdminProjects.mockResolvedValue({
      projects: mockProjects,
      pagination: { total: 2 },
    });
    adminApi.deleteAdminProject.mockResolvedValue({ success: true });

    render(<ProjectManager />);

    await waitFor(() => {
      expect(screen.getByText('AI Portfolio CMS')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    await user.click(deleteButtons[0]);

    expect(screen.getByRole('heading', { name: /Delete Project/i })).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to permanently delete/i)).toBeInTheDocument();

    const confirmDeleteBtn = screen.getByRole('button', { name: /Delete Permanently/i });
    await user.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(adminApi.deleteAdminProject).toHaveBeenCalledWith('proj-1');
    });

    expect(await screen.findByText(/Project deleted\./i)).toBeInTheDocument();
  });
});
