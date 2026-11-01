import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/admin/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header
        style={{
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg-surface)',
          padding: 'var(--space-4) 0',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Link
              to="/admin"
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--color-text-primary)',
              }}
            >
              CMS Dashboard
            </Link>
            <span className="badge badge-success">Authenticated</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            {admin && (
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                Signed in as <strong style={{ color: 'var(--color-text-primary)' }}>{admin.name || admin.email}</strong>
              </span>
            )}
            <Link
              to="/"
              className="btn btn-outline"
              style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-3)' }}
            >
              View Site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="btn btn-outline"
              style={{
                fontSize: 'var(--text-xs)',
                padding: 'var(--space-1) var(--space-3)',
                color: 'var(--color-danger)',
                borderColor: 'var(--color-danger-bg)',
              }}
            >
              {isLoggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: 'var(--space-8) 0' }}>
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer
        style={{
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg-surface)',
          padding: 'var(--space-4) 0',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-xs)',
        }}
      >
        <div className="container">
          <p>Protected CMS Portal — Authenticated Session Active</p>
        </div>
      </footer>
    </div>
  );
}
