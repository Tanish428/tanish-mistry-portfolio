import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExperienceManager from './ExperienceManager.jsx';
import * as adminApi from '../../api/adminApi.js';

vi.mock('../../api/adminApi.js');

describe('ExperienceManager Component (src/pages/admin/ExperienceManager.jsx)', () => {
  const mockExperiences = [
    {
      id: 'exp-1',
      company: 'Tech Innovations Inc',
      position: 'Senior Software Engineer',
      employmentType: 'full_time',
      workMode: 'remote',
      startDate: '2023-01-01T00:00:00.000Z',
      endDate: null,
      isCurrent: true,
      isPublished: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Loads and lists experience items', async () => {
    adminApi.getAdminExperience.mockResolvedValue({ experience: mockExperiences });

    render(<ExperienceManager />);

    expect(screen.getByText(/Loading experience history.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
      expect(screen.getByText(/Tech Innovations Inc/i)).toBeInTheDocument();
      expect(screen.getByText(/Present/i)).toBeInTheDocument();
    });
  });

  it('2. Creates a new experience entry via modal', async () => {
    const user = userEvent.setup();
    adminApi.getAdminExperience.mockResolvedValue({ experience: mockExperiences });
    adminApi.createAdminExperience.mockResolvedValue({
      id: 'exp-2',
      company: 'Startup Lab',
      position: 'Full-Stack Intern',
    });

    render(<ExperienceManager />);

    await waitFor(() => {
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /\+ Add Experience/i });
    await user.click(addBtn);

    expect(screen.getByRole('heading', { name: /Add Experience/i })).toBeInTheDocument();

    const companyInput = screen.getByLabelText(/Company \*/i);
    await user.type(companyInput, 'Startup Lab');

    const posInput = screen.getByLabelText(/Position \/ Role \*/i);
    await user.type(posInput, 'Full-Stack Intern');

    const startInput = screen.getByLabelText(/Start Date \*/i);
    await user.type(startInput, '2024-01-15');

    const isCurrentCheckbox = screen.getByLabelText(/Current Role/i);
    await user.click(isCurrentCheckbox);

    const submitBtn = screen.getByRole('button', { name: /^Create Experience$/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(adminApi.createAdminExperience).toHaveBeenCalledWith(
        expect.objectContaining({
          company: 'Startup Lab',
          position: 'Full-Stack Intern',
          startDate: '2024-01-15',
          isCurrent: true,
          endDate: null,
        })
      );
    });

    expect(await screen.findByText(/Experience created successfully!/i)).toBeInTheDocument();
  });
});
