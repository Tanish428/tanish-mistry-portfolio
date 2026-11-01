import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage.jsx';
import * as portfolioApi from '../../api/portfolioApi.js';

vi.mock('../../api/portfolioApi.js');

describe('HomePage & Dynamic Section Engine (src/pages/public/HomePage.jsx)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Homepage API integration: fetches sections and renders loading then content', async () => {
    const mockSections = [
      {
        id: 'sec-1',
        type: 'hero',
        title: 'Hero Title',
        displayOrder: 0,
        content: {
          fullName: 'Tanish Mistry',
          professionalTitle: 'Full Stack Engineer',
          shortIntroduction: 'Welcome to my portfolio.',
        },
      },
    ];

    portfolioApi.getHomepageSections.mockResolvedValue(mockSections);

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Initial loading indicator
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Renders hero section
    expect(await screen.findByRole('heading', { level: 1, name: /Tanish Mistry/i })).toBeInTheDocument();
    expect(screen.getByText(/Full Stack Engineer/i)).toBeInTheDocument();
  });

  it('2. Dynamic section ordering: renders all eight supported section types in exact order returned', async () => {
    const mockSections = [
      {
        id: 'sec-hero',
        type: 'hero',
        displayOrder: 0,
        content: { fullName: 'Tanish Mistry' },
      },
      {
        id: 'sec-about',
        type: 'about',
        title: 'About Me Heading',
        displayOrder: 1,
        content: { about: 'A passionate developer.' },
      },
      {
        id: 'sec-projects',
        type: 'projects',
        title: 'Projects Heading',
        displayOrder: 2,
        content: {
          projects: [
            { id: 'p1', title: 'CMS Portfolio Platform', slug: 'cms-portfolio' },
          ],
        },
      },
      {
        id: 'sec-skills',
        type: 'skills',
        title: 'Skills Heading',
        displayOrder: 3,
        content: {
          skills: [{ id: 's1', name: 'React 19' }, { id: 's2', name: 'Node.js' }],
        },
      },
      {
        id: 'sec-experience',
        type: 'experience',
        title: 'Experience Heading',
        displayOrder: 4,
        content: {
          experience: [{ id: 'e1', title: 'Senior Software Engineer', company: 'Tech Corp' }],
        },
      },
      {
        id: 'sec-education',
        type: 'education',
        title: 'Education Heading',
        displayOrder: 5,
        content: {
          education: [{ id: 'ed1', degree: 'B.S. in Computer Science', institution: 'University' }],
        },
      },
      {
        id: 'sec-social',
        type: 'social_links',
        title: 'Social Heading',
        displayOrder: 6,
        content: {
          socialLinks: [{ id: 'soc1', platform: 'github', url: 'https://github.com/Tanish428' }],
        },
      },
      {
        id: 'sec-contact',
        type: 'contact',
        title: 'Contact Heading',
        displayOrder: 7,
        content: { showContactForm: true },
      },
    ];

    portfolioApi.getHomepageSections.mockResolvedValue(mockSections);

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Verify all 8 section types rendered
    expect(await screen.findByRole('heading', { level: 1, name: /Tanish Mistry/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /About Me Heading/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Projects Heading/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Skills Heading/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Experience Heading/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Education Heading/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Social Heading/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Contact Heading/i })).toBeInTheDocument();
  });

  it('3. Unknown section handling: safely ignores unsupported section types without crashing', async () => {
    const mockSections = [
      {
        id: 'sec-unknown',
        type: 'arbitrary_crypto_widget',
        title: 'Unsupported Widget',
        displayOrder: 0,
        content: { data: 'malicious or unsupported' },
      },
      {
        id: 'sec-about',
        type: 'about',
        title: 'Legitimate About Section',
        displayOrder: 1,
        content: { about: 'Clean developer profile' },
      },
    ];

    portfolioApi.getHomepageSections.mockResolvedValue(mockSections);

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Unknown section is omitted
    expect(await screen.findByText(/Legitimate About Section/i)).toBeInTheDocument();
    expect(screen.queryByText(/Unsupported Widget/i)).toBeNull();
  });

  it('4. Missing and empty content: handles empty sections array gracefully with welcome fallback', async () => {
    portfolioApi.getHomepageSections.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Welcome to My Portfolio/i)).toBeInTheDocument();
    expect(screen.getByText(/No homepage sections have been published yet/i)).toBeInTheDocument();
  });

  it('5. Error state: displays error banner and retry button on fetch failure', async () => {
    portfolioApi.getHomepageSections.mockRejectedValue(new Error('Network connection timed out'));

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Unable to Load Portfolio/i)).toBeInTheDocument();
    expect(screen.getByText(/Network connection timed out/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });
});
