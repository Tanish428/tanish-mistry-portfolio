import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import AppRoutes from './AppRoutes.jsx';
import App from '../App.jsx';
import * as authApi from '../api/authApi.js';

// Mock health, auth, and portfolio APIs
vi.mock('../api/health.js', () => ({
  getHealthLive: vi.fn().mockResolvedValue({
    success: true,
    message: 'Health check OK',
    data: { status: 'alive' },
  }),
  getHealthReady: vi.fn().mockResolvedValue({
    success: true,
    data: { status: 'ready', database: 'connected' },
  }),
}));

vi.mock('../api/authApi.js');

vi.mock('../api/portfolioApi.js', () => ({
  getHomepageSections: vi.fn().mockResolvedValue([
    {
      id: 'sec-hero',
      type: 'hero',
      content: {
        fullName: 'Tanish Mistry',
        professionalTitle: 'Full Stack Developer',
        shortIntroduction: 'Welcome to my portfolio.',
      },
    },
  ]),
  getProjectBySlug: vi.fn().mockResolvedValue({
    id: 'p-1',
    title: 'E-Commerce Platform',
    slug: 'e-commerce-platform',
    shortDescription: 'Modern e-commerce platform.',
    technologies: ['React 19', 'Node.js'],
  }),
}));

describe('Router & Page Navigation (src/routes/AppRoutes.jsx)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const error401 = new Error('Authentication required');
    error401.status = 401;
    authApi.getCurrentAdmin.mockRejectedValue(error401);
  });

  it('1. Application startup: App renders successfully at root path', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { level: 1, name: /Tanish Mistry/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tanish Mistry' })).toBeInTheDocument();
  });

  it('2. Navigates to public homepage ("/") and displays dynamic hero section', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { level: 1, name: /Tanish Mistry/i })).toBeInTheDocument();
    expect(screen.getByText(/Full Stack Developer/i)).toBeInTheDocument();
  });

  it('3. Navigates to project detail ("/projects/:slug") and fetches project by slug', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/e-commerce-platform']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { level: 1, name: /E-Commerce Platform/i })).toBeInTheDocument();
    expect(screen.getByText(/Modern e-commerce platform/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /← Back to Projects/i })).toBeInTheDocument();
  });

  it('4. Navigates to admin login ("/admin/login") and displays login form', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Administrator Login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('5. Protected route redirection: unauthenticated direct access to /admin redirects to /admin/login', async () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Administrator Login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
  });

  it('6. Authenticated access: valid admin session allows access to /admin dashboard', async () => {
    authApi.getCurrentAdmin.mockResolvedValue({
      id: 'admin-1',
      name: 'Tanish Mistry',
      email: 'admin@portfolio.dev',
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Welcome back, Tanish Mistry/i)).toBeInTheDocument();
    expect(screen.getByText(/CMS Dashboard/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Out/i })).toBeInTheDocument();
  });

  it('7. Navigates to unknown route and renders 404 Not Found page', async () => {
    render(
      <MemoryRouter initialEntries={['/some/unknown/route/that/does/not/exist']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText(/HTTP 404/i)).toBeInTheDocument();
    expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Return to Home/i })).toBeInTheDocument();
  });
});
