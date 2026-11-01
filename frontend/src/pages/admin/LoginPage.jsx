import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth.js';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Destination path after successful login
  const fromPath = location.state?.from?.pathname || '/admin';

  // Prevent authenticated users from staying on login page
  if (!isAuthLoading && isAuthenticated) {
    return <Navigate to={fromPath} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your administrator email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(trimmedEmail, password);
      navigate(fromPath, { replace: true });
    } catch (err) {
      if (err?.status === 429) {
        setErrorMessage(err.message || 'Too many login attempts. Please try again after 15 minutes.');
      } else if (err?.status === 401) {
        setErrorMessage('Invalid email or password. Please verify your credentials.');
      } else if (err?.status === 0) {
        setErrorMessage('Unable to connect to the server. Please check your network connection.');
      } else {
        setErrorMessage(err.message || 'An unexpected error occurred during login.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="card"
      style={{
        maxWidth: '420px',
        margin: 'var(--space-8) auto',
        padding: 'var(--space-8)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <span className="badge badge-warning" style={{ marginBottom: 'var(--space-2)' }}>
          CMS Security Portal
        </span>
        <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>Administrator Login</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          Enter your credentials to manage portfolio content.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="card"
          style={{
            backgroundColor: 'var(--color-danger-bg)',
            borderColor: 'var(--color-danger)',
            color: 'var(--color-danger)',
            padding: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-medium)',
          }}
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} noValidate>
        <div>
          <label htmlFor="admin-email">Email Address</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            placeholder="admin@example.com"
            disabled={isSubmitting}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••••••"
            disabled={isSubmitting}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          style={{ width: '100%', marginTop: 'var(--space-2)' }}
        >
          {isSubmitting ? 'Authenticating...' : 'Sign In'}
        </button>

        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          Protected by HttpOnly session cookies & CSRF double-submit token verification.
        </p>
      </form>

      <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
        <Link to="/" style={{ color: 'var(--color-primary)', fontSize: 'var(--text-sm)' }}>
          ← Back to Public Portfolio
        </Link>
      </div>
    </div>
  );
}
