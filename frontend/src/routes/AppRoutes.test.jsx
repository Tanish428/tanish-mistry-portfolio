import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes.jsx';
import App from '../App.jsx';

// Mock health API to avoid unhandled network requests in jsdom
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

describe('Router & Page Navigation (src/routes/AppRoutes.jsx)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Application startup: App renders successfully at root path', async () => {
    render(<App />);
    expect(screen.getByText(/Developer Portfolio & CMS/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tanish Mistry' })).toBeInTheDocument();
    expect(await screen.findByText(/Backend API: connected/i)).toBeInTheDocument();
  });

  it('2. Navigates to public homepage ("/") and displays welcome elements', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText(/Developer Portfolio & CMS/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View Sample Project/i })).toBeInTheDocument();
    expect(await screen.findByText(/Backend API: connected/i)).toBeInTheDocument();
  });

  it('3. Navigates to project detail ("/projects/:slug") and extracts slug parameter', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/e-commerce-platform']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText(/Project Detail Placeholder/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /E COMMERCE PLATFORM/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /← Back to Portfolio/i })).toBeInTheDocument();
  });

  it('4. Navigates to admin login ("/admin/login") and displays login form placeholder', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText(/CMS Administrator Login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('5. Navigates to admin dashboard ("/admin") and renders admin shell and module tiles', async () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText(/Administrator Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Phase 1 CMS Shell/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Projects Catalog/i)).toBeInTheDocument();
    expect(screen.getByText(/Cloudinary Media Library/i)).toBeInTheDocument();
  });

  it('6. Navigates to unknown route and renders 404 Not Found page', async () => {
    render(
      <MemoryRouter initialEntries={['/some/unknown/route/that/does/not/exist']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText(/HTTP 404/i)).toBeInTheDocument();
    expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Return to Home/i })).toBeInTheDocument();
  });
});
