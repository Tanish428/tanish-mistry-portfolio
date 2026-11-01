import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ContactInbox from './ContactInbox.jsx';
import * as adminApi from '../../api/adminApi.js';

vi.mock('../../api/adminApi.js');

describe('ContactInbox Component (src/pages/admin/ContactInbox.jsx)', () => {
  const mockMessages = [
    {
      id: 'msg-1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      subject: 'Collaboration on Open Source AI',
      message: 'Hello Tanish,\n\nI was impressed by your portfolio and would like to discuss collaborating on an open source LLM project.\n\nBest,\nAlice',
      status: 'new',
      createdAt: '2026-10-31T14:30:00.000Z',
      updatedAt: '2026-10-31T14:30:00.000Z',
    },
    {
      id: 'msg-2',
      name: 'Bob Smith',
      email: 'bob@techrecruiter.com',
      subject: 'Senior Full Stack Role',
      message: 'Hi Tanish, we have a remote Senior Full Stack opening that aligns well with your experience.',
      status: 'read',
      createdAt: '2026-10-30T10:15:00.000Z',
      updatedAt: '2026-10-30T11:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Loads and renders contact messages with sender details and status badges', async () => {
    adminApi.getAdminContactMessages.mockResolvedValue({
      messages: mockMessages,
      pagination: {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });

    render(<ContactInbox />);

    expect(screen.getByText(/Loading messages.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
      expect(screen.getByText('Collaboration on Open Source AI')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      expect(screen.getByText('bob@techrecruiter.com')).toBeInTheDocument();
      expect(screen.getByText('Senior Full Stack Role')).toBeInTheDocument();
    });
  });

  it('2. Filter buttons switch active tab and re-fetch filtered messages', async () => {
    const user = userEvent.setup();
    adminApi.getAdminContactMessages.mockResolvedValueOnce({
      messages: mockMessages,
      pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
    });

    render(<ContactInbox />);

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    // Mock next response for 'new' status
    adminApi.getAdminContactMessages.mockResolvedValueOnce({
      messages: [mockMessages[0]],
      pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });

    const newTab = screen.getByRole('button', { name: /^new$/i });
    await user.click(newTab);

    await waitFor(() => {
      expect(adminApi.getAdminContactMessages).toHaveBeenCalledWith({ page: 1, limit: 10, status: 'new' });
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
    });
  });

  it('3. Opens message detail modal, auto-marks new message as read, and displays content', async () => {
    const user = userEvent.setup();
    adminApi.getAdminContactMessages.mockResolvedValue({
      messages: mockMessages,
      pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
    });

    adminApi.updateAdminContactMessageStatus.mockResolvedValue({
      ...mockMessages[0],
      status: 'read',
    });

    render(<ContactInbox />);

    await waitFor(() => {
      expect(screen.getByText('Collaboration on Open Source AI')).toBeInTheDocument();
    });

    const viewBtn = screen.getByRole('button', { name: /View message from Alice Johnson/i });
    await user.click(viewBtn);

    await waitFor(() => {
      expect(adminApi.updateAdminContactMessageStatus).toHaveBeenCalledWith('msg-1', 'read');
      expect(screen.getByText(/Message Content/i)).toBeInTheDocument();
      expect(screen.getByText(/I was impressed by your portfolio/i)).toBeInTheDocument();
    });

    // Close modal
    const closeBtn = screen.getByRole('button', { name: /^close$/i });
    await user.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Message Content/i)).not.toBeInTheDocument();
    });
  });

  it('4. Updates message status to archived via quick action button', async () => {
    const user = userEvent.setup();
    adminApi.getAdminContactMessages.mockResolvedValue({
      messages: mockMessages,
      pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
    });

    adminApi.updateAdminContactMessageStatus.mockResolvedValue({
      ...mockMessages[1],
      status: 'archived',
    });

    render(<ContactInbox />);

    await waitFor(() => {
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    });

    const archiveBtn = screen.getByRole('button', { name: /Archive message from Bob Smith/i });
    await user.click(archiveBtn);

    await waitFor(() => {
      expect(adminApi.updateAdminContactMessageStatus).toHaveBeenCalledWith('msg-2', 'archived');
      expect(screen.getByText(/Message marked as archived/i)).toBeInTheDocument();
    });
  });

  it('5. Deletes a message with confirmation dialog', async () => {
    const user = userEvent.setup();
    adminApi.getAdminContactMessages.mockResolvedValue({
      messages: mockMessages,
      pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
    });

    adminApi.deleteAdminContactMessage.mockResolvedValue({ success: true, data: null });

    render(<ContactInbox />);

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByRole('button', { name: /Delete message from Alice Johnson/i });
    await user.click(deleteBtn);

    // Confirm dialog should be visible
    expect(screen.getByRole('heading', { name: /Delete Contact Message/i })).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /^Delete Message$/i });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(adminApi.deleteAdminContactMessage).toHaveBeenCalledWith('msg-1');
      expect(screen.getByText(/Message permanently deleted/i)).toBeInTheDocument();
    });
  });

  it('6. Displays error message if API fails', async () => {
    adminApi.getAdminContactMessages.mockRejectedValue(new Error('Network error loading inbox'));

    render(<ContactInbox />);

    await waitFor(() => {
      expect(screen.getByText('Network error loading inbox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
    });
  });
});
