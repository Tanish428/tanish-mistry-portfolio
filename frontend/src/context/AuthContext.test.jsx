import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext.jsx';
import ProtectedRoute from '../routes/ProtectedRoute.jsx';
import LoginPage from '../pages/admin/LoginPage.jsx';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage.jsx';
import * as authApi from '../api/authApi.js';
import * as healthApi from '../api/health.js';

vi.mock('../api/authApi.js');
vi.mock('../api/health.js');

describe('AuthContext & ProtectedRoute Integration Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();

    healthApi.getHealthReady.mockResolvedValue({
      success: true,
      data: { status: 'ready', database: 'connected' },
    });
  });

  it('1. Session restoration: successfully restores session from server source of truth', async () => {
    const mockAdmin = { id: 'admin-1', name: 'Tanish Mistry', email: 'admin@portfolio.dev' };
    authApi.getCurrentAdmin.mockResolvedValue(mockAdmin);

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Route>
            <Route path="/admin/login" element={<LoginPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Initial loading indicator is visible
    expect(screen.getByRole('status')).toBeInTheDocument();

    // After session verification completes, dashboard displays admin's name
    expect(await screen.findByText(/Welcome back, Tanish Mistry/i)).toBeInTheDocument();
    expect(screen.getByText(/admin@portfolio.dev/i)).toBeInTheDocument();

    // Verify no storage leakage
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('2. Expired session: 401 from GET /auth/me redirects unauthenticated user to /admin/login', async () => {
    const error401 = new Error('Authentication required. Please log in.');
    error401.status = 401;
    authApi.getCurrentAdmin.mockRejectedValue(error401);

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Route>
            <Route path="/admin/login" element={<LoginPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Redirected to login page
    expect(await screen.findByText(/Administrator Login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('3. Login flow: submitting valid credentials logs in and grants access to dashboard', async () => {
    // Initial cold boot has no session
    const error401 = new Error('Authentication required');
    error401.status = 401;
    authApi.getCurrentAdmin.mockRejectedValue(error401);

    const loggedInAdmin = { id: 'admin-1', name: 'Tanish Mistry', email: 'tanish@dev.io' };
    authApi.login.mockResolvedValue(loggedInAdmin);

    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/admin/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    const emailInput = await screen.findByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitBtn = screen.getByRole('button', { name: /Sign In/i });

    await userEvent.type(emailInput, 'tanish@dev.io');
    await userEvent.type(passwordInput, 'SecurePass123!');
    await userEvent.click(submitBtn);

    expect(authApi.login).toHaveBeenCalledWith('tanish@dev.io', 'SecurePass123!');
    expect(await screen.findByText(/Welcome back, Tanish Mistry/i)).toBeInTheDocument();
  });

  it('4. Login rejection: displays server 401 error message when credentials fail', async () => {
    const error401 = new Error('Authentication required');
    error401.status = 401;
    authApi.getCurrentAdmin.mockRejectedValue(error401);

    const loginFail = new Error('Invalid email or password');
    loginFail.status = 401;
    authApi.login.mockRejectedValue(loginFail);

    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/admin/login" element={<LoginPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    const emailInput = await screen.findByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitBtn = screen.getByRole('button', { name: /Sign In/i });

    await userEvent.type(emailInput, 'wrong@user.com');
    await userEvent.type(passwordInput, 'WrongPass!');
    await userEvent.click(submitBtn);

    expect(await screen.findByRole('alert')).toHaveTextContent(/Invalid email or password/i);
  });

  it('5. Login rate-limiting: displays 429 message when brute-force threshold is hit', async () => {
    const error401 = new Error('Authentication required');
    error401.status = 401;
    authApi.getCurrentAdmin.mockRejectedValue(error401);

    const rateLimitError = new Error('Too many login attempts. Please try again after 15 minutes.');
    rateLimitError.status = 429;
    authApi.login.mockRejectedValue(rateLimitError);

    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/admin/login" element={<LoginPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    const emailInput = await screen.findByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitBtn = screen.getByRole('button', { name: /Sign In/i });

    await userEvent.type(emailInput, 'admin@user.com');
    await userEvent.type(passwordInput, 'Attempt!');
    await userEvent.click(submitBtn);

    expect(await screen.findByRole('alert')).toHaveTextContent(/Too many login attempts/i);
  });

  it('6. Authenticated user revisiting /admin/login is redirected to /admin', async () => {
    const mockAdmin = { id: 'admin-1', name: 'Tanish Mistry', email: 'admin@portfolio.dev' };
    authApi.getCurrentAdmin.mockResolvedValue(mockAdmin);

    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/admin/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Bypasses login page and lands on dashboard
    expect(await screen.findByText(/Welcome back, Tanish Mistry/i)).toBeInTheDocument();
  });
});
