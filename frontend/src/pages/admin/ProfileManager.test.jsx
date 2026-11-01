import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfileManager from './ProfileManager.jsx';
import * as adminApi from '../../api/adminApi.js';

vi.mock('../../api/adminApi.js');

describe('ProfileManager Component (src/pages/admin/ProfileManager.jsx)', () => {
  const mockProfile = {
    id: 'profile-1',
    fullName: 'Tanish Mistry',
    professionalTitle: 'Full-Stack Developer & AI Specialist',
    shortIntroduction: 'Passionate software engineer building robust web apps.',
    about: 'I have extensive experience working with modern JavaScript frameworks.',
    location: 'Mumbai, India',
    publicEmail: 'tanish@example.com',
    profileImageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatar.jpg',
    profileImageAlt: 'Tanish Mistry avatar',
    availabilityStatus: 'open_to_opportunities',
    isVisible: true,
    isPublished: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Loads and renders existing profile data', async () => {
    adminApi.getAdminProfile.mockResolvedValue(mockProfile);

    render(<ProfileManager />);

    expect(screen.getByText(/Loading profile.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Tanish Mistry')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Full-Stack Developer & AI Specialist')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Mumbai, India')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Unpublish Profile/i })).toBeInTheDocument();
  });

  it('2. Submits updated profile details successfully', async () => {
    const user = userEvent.setup();
    adminApi.getAdminProfile.mockResolvedValue(mockProfile);
    adminApi.updateAdminProfile.mockResolvedValue({
      ...mockProfile,
      fullName: 'Tanish Mistry (Updated)',
    });

    render(<ProfileManager />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Tanish Mistry')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/Full Name \*/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Tanish Mistry (Updated)');

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(adminApi.updateAdminProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'Tanish Mistry (Updated)',
        })
      );
    });

    expect(await screen.findByText(/Profile updated successfully!/i)).toBeInTheDocument();
  });

  it('3. Toggles publication state (unpublish and publish)', async () => {
    const user = userEvent.setup();
    adminApi.getAdminProfile.mockResolvedValue(mockProfile);
    adminApi.unpublishAdminProfile.mockResolvedValue({
      ...mockProfile,
      isPublished: false,
    });

    render(<ProfileManager />);

    const unpublishBtn = await screen.findByRole('button', { name: /Unpublish Profile/i });
    await user.click(unpublishBtn);

    await waitFor(() => {
      expect(adminApi.unpublishAdminProfile).toHaveBeenCalled();
    });

    expect(await screen.findByText(/Profile unpublished/i)).toBeInTheDocument();
  });
});
