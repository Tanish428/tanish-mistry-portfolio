import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EducationManager from './EducationManager.jsx';
import * as adminApi from '../../api/adminApi.js';

vi.mock('../../api/adminApi.js');

describe('EducationManager Component (src/pages/admin/EducationManager.jsx)', () => {
  const mockEducation = [
    {
      id: 'edu-1',
      institution: 'University of Engineering',
      degree: 'B.Tech Computer Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2020-08-01T00:00:00.000Z',
      endDate: '2024-05-30T00:00:00.000Z',
      isCurrent: false,
      grade: '9.2 CGPA',
      isPublished: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Loads and lists education records', async () => {
    adminApi.getAdminEducation.mockResolvedValue({ education: mockEducation });

    render(<EducationManager />);

    expect(screen.getByText(/Loading education records.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('B.Tech Computer Science')).toBeInTheDocument();
      expect(screen.getByText(/University of Engineering/i)).toBeInTheDocument();
      expect(screen.getByText('9.2 CGPA')).toBeInTheDocument();
    });
  });

  it('2. Creates a new education record via modal', async () => {
    const user = userEvent.setup();
    adminApi.getAdminEducation.mockResolvedValue({ education: mockEducation });
    adminApi.createAdminEducation.mockResolvedValue({
      id: 'edu-2',
      institution: 'Global High School',
      degree: 'High School Diploma',
    });

    render(<EducationManager />);

    await waitFor(() => {
      expect(screen.getByText('B.Tech Computer Science')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /\+ Add Education/i });
    await user.click(addBtn);

    expect(screen.getByRole('heading', { name: /Add Education/i })).toBeInTheDocument();

    const instInput = screen.getByLabelText(/Institution \/ University \*/i);
    await user.type(instInput, 'Global High School');

    const degreeInput = screen.getByLabelText(/Degree \/ Diploma \*/i);
    await user.type(degreeInput, 'High School Diploma');

    const startInput = screen.getByLabelText(/Start Date \*/i);
    await user.type(startInput, '2018-06-01');

    const endInput = screen.getByLabelText(/End Date \*/i);
    await user.type(endInput, '2020-05-30');

    const submitBtn = screen.getByRole('button', { name: /^Create Education$/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(adminApi.createAdminEducation).toHaveBeenCalledWith(
        expect.objectContaining({
          institution: 'Global High School',
          degree: 'High School Diploma',
          startDate: '2018-06-01',
          endDate: '2020-05-30',
          isCurrent: false,
        })
      );
    });

    expect(await screen.findByText(/Education entry created successfully!/i)).toBeInTheDocument();
  });
});
