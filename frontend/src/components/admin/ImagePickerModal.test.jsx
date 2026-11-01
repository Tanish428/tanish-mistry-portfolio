import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ImagePickerModal from './ImagePickerModal.jsx';
import * as adminApi from '../../api/adminApi.js';

vi.mock('../../api/adminApi.js');

describe('ImagePickerModal Component (src/components/admin/ImagePickerModal.jsx)', () => {
  const mockMedia = [
    {
      id: 'media-1',
      publicId: 'img_avatar',
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatar.jpg',
      format: 'jpg',
      originalFilename: 'avatar.jpg',
      altText: 'Profile Avatar',
    },
    {
      id: 'media-2',
      publicId: 'img_project',
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/project.png',
      format: 'png',
      originalFilename: 'project.png',
      altText: 'Project Thumbnail',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Loads and renders media items when open', async () => {
    adminApi.getAdminMedia.mockResolvedValue({ media: mockMedia });

    render(
      <ImagePickerModal
        isOpen={true}
        onClose={vi.fn()}
        onSelectImage={vi.fn()}
        title="Choose an Image"
      />
    );

    expect(screen.getByText(/Loading media library.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Profile Avatar')).toBeInTheDocument();
      expect(screen.getByText('Project Thumbnail')).toBeInTheDocument();
    });
  });

  it('2. Selects an image and triggers onSelectImage callback on confirm', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    const handleClose = vi.fn();

    adminApi.getAdminMedia.mockResolvedValue({ media: mockMedia });

    render(
      <ImagePickerModal
        isOpen={true}
        onClose={handleClose}
        onSelectImage={handleSelect}
        title="Choose an Image"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Profile Avatar')).toBeInTheDocument();
    });

    const firstImageCard = screen.getByText('Profile Avatar');
    await user.click(firstImageCard);

    expect(screen.getByText(/Selected:/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /Use Selected Image/i });
    expect(confirmBtn).not.toBeDisabled();
    await user.click(confirmBtn);

    expect(handleSelect).toHaveBeenCalledWith(mockMedia[0]);
    expect(handleClose).toHaveBeenCalled();
  });

  it('3. Cancels selection and invokes onClose', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    adminApi.getAdminMedia.mockResolvedValue({ media: mockMedia });

    render(
      <ImagePickerModal
        isOpen={true}
        onClose={handleClose}
        onSelectImage={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Profile Avatar')).toBeInTheDocument();
    });

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelBtn);

    expect(handleClose).toHaveBeenCalled();
  });
});
