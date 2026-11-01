import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SkillCategoryManager from './SkillCategoryManager.jsx';
import * as adminApi from '../../api/adminApi.js';

vi.mock('../../api/adminApi.js');

describe('SkillCategoryManager Component (src/pages/admin/SkillCategoryManager.jsx)', () => {
  const mockCategories = [
    {
      id: 'cat-1',
      name: 'Frontend Technologies',
      slug: 'frontend-technologies',
      description: 'Client-side technologies',
      isPublished: true,
      displayOrder: 0,
    },
    {
      id: 'cat-2',
      name: 'Databases & Storage',
      slug: 'databases-storage',
      description: 'SQL & NoSQL engines',
      isPublished: false,
      displayOrder: 1,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Loads and lists skill categories', async () => {
    adminApi.getAdminSkillCategories.mockResolvedValue({ categories: mockCategories });

    render(<SkillCategoryManager />);

    expect(screen.getByText(/Loading skill categories.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Frontend Technologies')).toBeInTheDocument();
      expect(screen.getByText('Databases & Storage')).toBeInTheDocument();
    });
  });

  it('2. Creates a new category via modal', async () => {
    const user = userEvent.setup();
    adminApi.getAdminSkillCategories.mockResolvedValue({ categories: mockCategories });
    adminApi.createAdminSkillCategory.mockResolvedValue({
      id: 'cat-3',
      name: 'DevOps & Cloud',
      slug: 'devops-cloud',
    });

    render(<SkillCategoryManager />);

    await waitFor(() => {
      expect(screen.getByText('Frontend Technologies')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /\+ Add New Category/i });
    await user.click(addBtn);

    expect(screen.getByRole('heading', { name: /Create Category/i })).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Category Name \*/i);
    await user.type(nameInput, 'DevOps & Cloud');

    const submitBtn = screen.getByRole('button', { name: /^Create Category$/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(adminApi.createAdminSkillCategory).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'DevOps & Cloud',
        })
      );
    });

    expect(await screen.findByText(/Category created successfully!/i)).toBeInTheDocument();
  });
});
