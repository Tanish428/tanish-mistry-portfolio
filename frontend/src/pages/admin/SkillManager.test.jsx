import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SkillManager from './SkillManager.jsx';
import * as adminApi from '../../api/adminApi.js';

vi.mock('../../api/adminApi.js');

describe('SkillManager Component (src/pages/admin/SkillManager.jsx)', () => {
  const mockCategories = [
    { id: 'cat-1', name: 'Frontend Technologies', slug: 'frontend-technologies' },
    { id: 'cat-2', name: 'Backend & APIs', slug: 'backend-apis' },
  ];

  const mockSkills = [
    {
      id: 'skill-1',
      name: 'React 19',
      slug: 'react-19',
      category: { id: 'cat-1', name: 'Frontend Technologies' },
      proficiencyLevel: 'expert',
      isFeatured: true,
      isPublished: true,
    },
    {
      id: 'skill-2',
      name: 'Express 5',
      slug: 'express-5',
      category: { id: 'cat-2', name: 'Backend & APIs' },
      proficiencyLevel: 'advanced',
      isFeatured: false,
      isPublished: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Loads and renders skill list and categories', async () => {
    adminApi.getAdminSkillCategories.mockResolvedValue({ categories: mockCategories });
    adminApi.getAdminSkills.mockResolvedValue({ skills: mockSkills });

    render(<SkillManager />);

    expect(screen.getByText(/Loading skills.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('React 19')).toBeInTheDocument();
      expect(screen.getByText('Express 5')).toBeInTheDocument();
      expect(screen.getAllByText('Frontend Technologies').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('2. Creates a new skill via modal', async () => {
    const user = userEvent.setup();
    adminApi.getAdminSkillCategories.mockResolvedValue({ categories: mockCategories });
    adminApi.getAdminSkills.mockResolvedValue({ skills: mockSkills });
    adminApi.createAdminSkill.mockResolvedValue({
      id: 'skill-3',
      name: 'Node.js',
      category: 'cat-2',
    });

    render(<SkillManager />);

    await waitFor(() => {
      expect(screen.getByText('React 19')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /\+ Add Skill/i });
    await user.click(addBtn);

    expect(screen.getByRole('heading', { name: /Create Skill/i })).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Skill Name \*/i);
    await user.type(nameInput, 'Node.js');

    const submitBtn = screen.getByRole('button', { name: /^Create Skill$/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(adminApi.createAdminSkill).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Node.js',
          proficiencyLevel: 'intermediate',
        })
      );
    });

    expect(await screen.findByText(/Skill created successfully!/i)).toBeInTheDocument();
  });

  it('3. Confirms and deletes a skill', async () => {
    const user = userEvent.setup();
    adminApi.getAdminSkillCategories.mockResolvedValue({ categories: mockCategories });
    adminApi.getAdminSkills.mockResolvedValue({ skills: mockSkills });
    adminApi.deleteAdminSkill.mockResolvedValue({ success: true });

    render(<SkillManager />);

    await waitFor(() => {
      expect(screen.getByText('React 19')).toBeInTheDocument();
    });

    const deleteBtns = screen.getAllByRole('button', { name: /Delete/i });
    await user.click(deleteBtns[0]);

    expect(screen.getByRole('heading', { name: /Delete Skill/i })).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to permanently delete "React 19"/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /Delete Permanently/i });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(adminApi.deleteAdminSkill).toHaveBeenCalledWith('skill-1');
    });

    expect(await screen.findByText(/Skill deleted successfully!/i)).toBeInTheDocument();
  });
});
