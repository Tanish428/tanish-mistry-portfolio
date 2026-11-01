import { Link, Outlet } from 'react-router-dom';

export default function AdminLayout() {
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
              Portfolio CMS
            </Link>
            <span className="badge badge-warning">Admin Space</span>
          </div>

          <nav style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <Link
              to="/"
              className="btn btn-outline"
              style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-3)' }}
            >
              View Site
            </Link>
            <Link
              to="/admin/login"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-medium)',
                color: 'var(--color-danger)',
              }}
            >
              Sign In
            </Link>
          </nav>
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
          <p>Protected CMS Administration Area — Phase 1 Skeleton</p>
        </div>
      </footer>
    </div>
  );
}
