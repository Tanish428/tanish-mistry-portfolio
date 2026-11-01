import { Link, Outlet } from 'react-router-dom';

export default function PublicLayout() {
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
          <Link
            to="/"
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--color-text-primary)',
            }}
          >
            Tanish Mistry
          </Link>
          <nav style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
            <Link
              to="/"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-medium)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Portfolio
            </Link>
            <Link
              to="/admin/login"
              className="btn btn-outline"
              style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-3)' }}
            >
              CMS Portal
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
          padding: 'var(--space-6) 0',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-sm)',
        }}
      >
        <div className="container">
          <p>© {new Date().getFullYear()} Tanish Mistry. Built with React 19 & Express 5.</p>
        </div>
      </footer>
    </div>
  );
}
