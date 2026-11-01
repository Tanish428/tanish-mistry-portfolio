import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MediaLibrary from './MediaLibrary.jsx';
import * as adminApi from '../../api/adminApi.js';

vi.mock('../../api/adminApi.js');

describe('MediaLibrary Component (src/pages/admin/MediaLibrary.jsx)', () => {
  const mockMedia = [
    {
      id: 'media-1',
      publicId: 'img_1730000000_abc123',
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatar.jpg',
      format: 'jpg',
      bytes: 204800, // 200 KB
      width: 800,
      height: 800,
      originalFilename: 'profile-shot.jpg',
      altText: 'Tanish Mistry Headshot',
      createdAt: '2026-10-31T20:00:00.000Z',
    },
    {
      id: 'media-2',
      publicId: 'img_1730000001_def456',
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/project1.png',
      format: 'png',
      bytes: 1048576, // 1 MB
      width: 1920,
      height: 1080,
      originalFilename: 'project-dashboard.png',
      altText: 'AI Project Preview',
      createdAt: '2026-10-31T21:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Loads and renders media gallery with metadata', async () => {
    adminApi.getAdminMedia.mockResolvedValue({
      media: mockMedia,
      pagination: { total: 2, page: 1, limit: 12, totalPages: 1 },
    });

    render(<MediaLibrary />);

    expect(screen.getByText(/Loading Cloudinary media.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('profile-shot.jpg')).toBeInTheDocument();
      expect(screen.getByText('project-dashboard.png')).toBeInTheDocument();
      expect(screen.getByText('800×800')).toBeInTheDocument();
      expect(screen.getByText('1920×1080')).toBeInTheDocument();
    });
  });

  it('2. Uploads an image successfully via multipart FormData', async () => {
    const user = userEvent.setup();
    adminApi.getAdminMedia.mockResolvedValue({
      media: mockMedia,
      pagination: { total: 2, page: 1, limit: 12, totalPages: 1 },
    });
    adminApi.uploadAdminMedia.mockResolvedValue({
      id: 'media-3',
      publicId: 'img_1730000002_ghi789',
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/new-upload.webp',
      format: 'webp',
      originalFilename: 'new-upload.webp',
      altText: 'New Upload Banner',
    });

    render(<MediaLibrary />);

    await waitFor(() => {
      expect(screen.getByText('profile-shot.jpg')).toBeInTheDocument();
    });

    const openUploadBtn = screen.getByRole('button', { name: /\+ Upload Image/i });
    await user.click(openUploadBtn);

    expect(screen.getByRole('heading', { name: /Upload Image to Cloudinary/i })).toBeInTheDocument();

    const file = new File(['dummy image content'], 'new-upload.webp', { type: 'image/webp' });
    const fileInput = screen.getByLabelText(/Select Image File \*/i);
    Object.defineProperty(fileInput, 'files', { value: [file], configurable: true });
    fireEvent.change(fileInput);

    const altInput = screen.getByLabelText(/Alt Text \/ Caption/i);
    await user.type(altInput, 'New Upload Banner');

    const form = fileInput.closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(adminApi.uploadAdminMedia).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText(/Image uploaded to Cloudinary successfully!/i)).toBeInTheDocument();
  });

  it('3. Rejects invalid file format on client-side', async () => {
    const user = userEvent.setup();
    adminApi.getAdminMedia.mockResolvedValue({
      media: mockMedia,
      pagination: { total: 2, page: 1, limit: 12, totalPages: 1 },
    });

    render(<MediaLibrary />);

    await waitFor(() => {
      expect(screen.getByText('profile-shot.jpg')).toBeInTheDocument();
    });

    const openUploadBtn = screen.getByRole('button', { name: /\+ Upload Image/i });
    await user.click(openUploadBtn);

    const pdfFile = new File(['not an image'], 'document.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/Select Image File \*/i);
    fireEvent.change(fileInput, { target: { files: [pdfFile] } });

    expect(
      screen.getByText(/Invalid format. Only JPEG, PNG, and WebP images are allowed./i)
    ).toBeInTheDocument();
  });

  it('4. Rejects file exceeding 5 MB limit on client-side', async () => {
    const user = userEvent.setup();
    adminApi.getAdminMedia.mockResolvedValue({
      media: mockMedia,
      pagination: { total: 2, page: 1, limit: 12, totalPages: 1 },
    });

    render(<MediaLibrary />);

    await waitFor(() => {
      expect(screen.getByText('profile-shot.jpg')).toBeInTheDocument();
    });

    const openUploadBtn = screen.getByRole('button', { name: /\+ Upload Image/i });
    await user.click(openUploadBtn);

    const largeContent = new Uint8Array(5.5 * 1024 * 1024);
    const largeFile = new File([largeContent], 'huge-image.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/Select Image File \*/i);
    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    expect(
      screen.getByText(/File exceeds maximum size limit of 5 MB./i)
    ).toBeInTheDocument();
  });

  it('5. Handles server-side upload failure cleanly', async () => {
    const user = userEvent.setup();
    adminApi.getAdminMedia.mockResolvedValue({
      media: mockMedia,
      pagination: { total: 2, page: 1, limit: 12, totalPages: 1 },
    });
    adminApi.uploadAdminMedia.mockRejectedValue(new Error('Cloudinary stream connection error'));

    render(<MediaLibrary />);

    await waitFor(() => {
      expect(screen.getByText('profile-shot.jpg')).toBeInTheDocument();
    });

    const openUploadBtn = screen.getByRole('button', { name: /\+ Upload Image/i });
    await user.click(openUploadBtn);

    const file = new File(['valid content'], 'valid.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/Select Image File \*/i);
    Object.defineProperty(fileInput, 'files', { value: [file], configurable: true });
    fireEvent.change(fileInput);

    const form = fileInput.closest('form');
    fireEvent.submit(form);

    expect(await screen.findByText(/Cloudinary stream connection error/i)).toBeInTheDocument();
  });

  it('6. Deletes media asset with confirmation dialog', async () => {
    const user = userEvent.setup();
    adminApi.getAdminMedia.mockResolvedValue({
      media: mockMedia,
      pagination: { total: 2, page: 1, limit: 12, totalPages: 1 },
    });
    adminApi.deleteAdminMedia.mockResolvedValue({ success: true });

    render(<MediaLibrary />);

    await waitFor(() => {
      expect(screen.getByText('profile-shot.jpg')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /^Delete$/i });
    await user.click(deleteButtons[0]);

    expect(screen.getByRole('heading', { name: /Delete Media Asset/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to permanently delete "profile-shot\.jpg"/i)
    ).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /Delete Permanently/i });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(adminApi.deleteAdminMedia).toHaveBeenCalledWith('media-1');
    });

    expect(await screen.findByText(/Media asset deleted successfully\./i)).toBeInTheDocument();
  });

  it('7. Handles deletion failure when referenced by Profile or Project (HTTP 409)', async () => {
    const user = userEvent.setup();
    adminApi.getAdminMedia.mockResolvedValue({
      media: mockMedia,
      pagination: { total: 2, page: 1, limit: 12, totalPages: 1 },
    });
    adminApi.deleteAdminMedia.mockRejectedValue(
      new Error('Cannot delete media asset because it is currently referenced by the profile')
    );

    render(<MediaLibrary />);

    await waitFor(() => {
      expect(screen.getByText('profile-shot.jpg')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /^Delete$/i });
    await user.click(deleteButtons[0]);

    const confirmBtn = screen.getByRole('button', { name: /Delete Permanently/i });
    await user.click(confirmBtn);

    expect(
      await screen.findByText(/Cannot delete media asset because it is currently referenced by the profile/i)
    ).toBeInTheDocument();
  });
});
