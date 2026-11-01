import { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/admin/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { label: 'Overview', path: '/admin', end: true },
    { label: 'Profile', path: '/admin/profile' },
    { label: 'Projects', path: '/admin/projects' },
    { label: 'Skill Categories', path: '/admin/skill-categories' },
    { label: 'Skills', path: '/admin/skills' },
    { label: 'Experience', path: '/admin/experience' },
    { label: 'Education', path: '/admin/education' },
  ];

  // Derive simple breadcrumb from current path
  const currentNav = navItems.find((item) =>
    item.end ? location.pathname === item.path : location.pathname.startsWith(item.path) && item.path !== '/admin'
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg-base)' }}>
      {/* Top Header */}
      <header
        style={{
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg-surface)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--z-sticky)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '60px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button
              type="button"
              className="admin-menu-toggle"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle admin sidebar"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-2)',
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}
            >
              ☰
            </button>
            <Link
              to="/admin"
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--color-text-primary)',
              }}
            >
              CMS Dashboard
            </Link>
            <span className="badge badge-success" style={{ fontSize: '10px' }}>
              Admin
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {admin && (
              <span
                className="admin-user-email"
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {admin.email}
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

      {/* Main Container with Sidebar + Content */}
      <div className="container" style={{ display: 'flex', flex: 1, padding: 'var(--space-6) 0' }}>
        {/* Sidebar */}
        <aside
          className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
          style={{
            width: '220px',
            flexShrink: 0,
            marginRight: 'var(--space-6)',
          }}
        >
          <nav
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-1)',
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-3)',
            }}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: isActive ? 'var(--weight-semibold)' : 'var(--weight-medium)',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  backgroundColor: isActive ? 'var(--color-primary-subtle)' : 'transparent',
                  borderRadius: 'var(--radius-md)',
                  transition: 'background-color var(--transition-fast)',
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Breadcrumbs */}
          <div style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            <Link to="/admin" style={{ color: 'var(--color-text-secondary)' }}>
              CMS
            </Link>
            {currentNav && currentNav.path !== '/admin' && (
              <>
                <span style={{ margin: '0 var(--space-2)' }}>/</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 'var(--weight-medium)' }}>
                  {currentNav.label}
                </span>
              </>
            )}
          </div>

          <Outlet />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar {
            display: none;
            position: fixed;
            top: 61px;
            left: 0;
            bottom: 0;
            width: 240px;
            z-index: var(--z-modal);
            background-color: var(--color-bg-surface);
            padding: var(--space-4);
            box-shadow: var(--shadow-lg);
          }
          .admin-sidebar.open {
            display: block;
          }
          .admin-user-email {
            display: none;
          }
        }
        @media (min-width: 769px) {
          .admin-menu-toggle {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
