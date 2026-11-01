import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HomepageSectionManager from './HomepageSectionManager.jsx';
import * as adminApi from '../../api/adminApi.js';

vi.mock('../../api/adminApi.js');

describe('HomepageSectionManager Component (src/pages/admin/HomepageSectionManager.jsx)', () => {
  const mockSections = [
    {
      id: 'sec-1',
      type: 'hero',
      title: 'Welcome to My Portfolio',
      subtitle: 'Building Scalable Full-Stack Web Engines',
      displayOrder: 0,
      isVisible: true,
      isPublished: true,
      config: {
        showProfileImage: true,
        showAvailability: true,
        primaryCtaLabel: 'View Projects',
        primaryCtaUrl: '#projects',
        secondaryCtaLabel: 'Contact Me',
        secondaryCtaUrl: '#contact',
      },
    },
    {
      id: 'sec-2',
      type: 'about',
      title: 'About Me',
      subtitle: 'Full-Stack Developer Background',
      displayOrder: 1,
      isVisible: true,
      isPublished: false,
      config: {
        showProfileImage: true,
        maxTextLength: 1000,
      },
    },
    {
      id: 'sec-3',
      type: 'projects',
      title: 'Featured Works',
      subtitle: 'Selected production-ready web apps',
      displayOrder: 2,
      isVisible: true,
      isPublished: true,
      config: {
        featuredOnly: true,
        limit: 6,
        category: '',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Loads and renders existing homepage sections', async () => {
    adminApi.getAdminHomepageSections.mockResolvedValue({ sections: mockSections });

    render(<HomepageSectionManager />);

    expect(screen.getByText(/Loading homepage sections.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('hero')).toBeInTheDocument();
      expect(screen.getByText('about')).toBeInTheDocument();
      expect(screen.getByText('projects')).toBeInTheDocument();
      expect(screen.getByText('Welcome to My Portfolio')).toBeInTheDocument();
    });
  });

  it('2. Opens configuration modal and updates hero section config', async () => {
    const user = userEvent.setup();
    adminApi.getAdminHomepageSections.mockResolvedValue({ sections: mockSections });
    adminApi.updateAdminHomepageSection.mockResolvedValue({
      ...mockSections[0],
      title: 'Updated Hero Heading',
    });

    render(<HomepageSectionManager />);

    await waitFor(() => {
      expect(screen.getByText('Welcome to My Portfolio')).toBeInTheDocument();
    });

    const configureBtns = screen.getAllByRole('button', { name: /^Configure$/i });
    await user.click(configureBtns[0]);

    expect(screen.getByRole('heading', { name: /Configure Section: HERO/i })).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/Section Title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Hero Heading');

    const saveBtn = screen.getByRole('button', { name: /Update Section/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(adminApi.updateAdminHomepageSection).toHaveBeenCalledWith(
        'sec-1',
        expect.objectContaining({
          title: 'Updated Hero Heading',
        })
      );
    });

    expect(await screen.findByText(/Section "Updated Hero Heading" updated!/i)).toBeInTheDocument();
  });

  it('3. Creates a new homepage section from available allowlist types', async () => {
    const user = userEvent.setup();
    adminApi.getAdminHomepageSections.mockResolvedValue({ sections: mockSections });
    adminApi.createAdminHomepageSection.mockResolvedValue({
      id: 'sec-4',
      type: 'skills',
      title: 'Technical Skills',
      displayOrder: 3,
    });

    render(<HomepageSectionManager />);

    await waitFor(() => {
      expect(screen.getByText('Welcome to My Portfolio')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /\+ Add Section/i });
    await user.click(addBtn);

    expect(screen.getByRole('heading', { name: /Add Homepage Section/i })).toBeInTheDocument();

    const typeSelect = screen.getByLabelText(/Section Type \*/i);
    await user.selectOptions(typeSelect, 'skills');

    const titleInput = screen.getByLabelText(/Section Title/i);
    await user.type(titleInput, 'Technical Skills');

    const submitBtn = screen.getByRole('button', { name: /Create Section/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(adminApi.createAdminHomepageSection).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'skills',
          title: 'Technical Skills',
        })
      );
    });

    expect(await screen.findByText(/Section "skills" created successfully!/i)).toBeInTheDocument();
  });

  it('4. Toggles section publication status', async () => {
    const user = userEvent.setup();
    adminApi.getAdminHomepageSections.mockResolvedValue({ sections: mockSections });
    adminApi.unpublishAdminHomepageSection.mockResolvedValue({
      ...mockSections[0],
      isPublished: false,
    });

    render(<HomepageSectionManager />);

    await waitFor(() => {
      expect(screen.getByText('Welcome to My Portfolio')).toBeInTheDocument();
    });

    const publishedBtn = screen.getAllByRole('button', { name: /^Published$/i })[0];
    await user.click(publishedBtn);

    await waitFor(() => {
      expect(adminApi.unpublishAdminHomepageSection).toHaveBeenCalledWith('sec-1');
    });

    expect(await screen.findByText(/unpublished/i)).toBeInTheDocument();
  });

  it('5. Reorders homepage sections with bulk update', async () => {
    const user = userEvent.setup();
    adminApi.getAdminHomepageSections.mockResolvedValue({ sections: mockSections });
    adminApi.reorderAdminHomepageSections.mockResolvedValue({ success: true });

    render(<HomepageSectionManager />);

    await waitFor(() => {
      expect(screen.getByText('Welcome to My Portfolio')).toBeInTheDocument();
    });

    // Move first item down
    const moveDownBtns = screen.getAllByTitle('Move Down');
    await user.click(moveDownBtns[0]);

    await waitFor(() => {
      expect(adminApi.reorderAdminHomepageSections).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'sec-2', displayOrder: 0 }),
          expect.objectContaining({ id: 'sec-1', displayOrder: 1 }),
        ])
      );
    });

    expect(await screen.findByText(/Homepage section order updated!/i)).toBeInTheDocument();
  });

  it('6. Deletes homepage section with confirmation', async () => {
    const user = userEvent.setup();
    adminApi.getAdminHomepageSections.mockResolvedValue({ sections: mockSections });
    adminApi.deleteAdminHomepageSection.mockResolvedValue({ success: true });

    render(<HomepageSectionManager />);

    await waitFor(() => {
      expect(screen.getByText('Welcome to My Portfolio')).toBeInTheDocument();
    });

    const deleteBtns = screen.getAllByRole('button', { name: /^Delete$/i });
    await user.click(deleteBtns[0]);

    expect(screen.getByRole('heading', { name: /Delete Homepage Section/i })).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to permanently delete the "hero" section block/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /Delete Permanently/i });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(adminApi.deleteAdminHomepageSection).toHaveBeenCalledWith('sec-1');
    });

    expect(await screen.findByText(/Section "hero" deleted\./i)).toBeInTheDocument();
  });
});
