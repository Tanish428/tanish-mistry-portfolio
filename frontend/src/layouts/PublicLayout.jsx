import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';

  const navLinks = [
    { label: 'About', href: isHome ? '#about' : '/#about' },
    { label: 'Projects', href: isHome ? '#projects' : '/#projects' },
    { label: 'Skills', href: isHome ? '#skills' : '/#skills' },
    { label: 'Experience', href: isHome ? '#experience' : '/#experience' },
    { label: 'Contact', href: isHome ? '#contact' : '/#contact' },
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 'var(--z-sticky)',
          backgroundColor: 'var(--color-bg-surface)',
          borderBottom: '1px solid var(--color-border)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '64px',
          }}
        >
          <Link
            to="/"
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Tanish Mistry
          </Link>

          {/* Desktop Navigation */}
          <nav
            style={{
              display: 'none',
              gap: 'var(--space-6)',
              alignItems: 'center',
            }}
            className="desktop-nav"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                  color: 'var(--color-text-secondary)',
                  transition: 'color var(--transition-fast)',
                }}
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/admin/login"
              className="btn btn-outline"
              style={{
                fontSize: 'var(--text-xs)',
                padding: 'var(--space-1) var(--space-3)',
                marginLeft: 'var(--space-2)',
              }}
            >
              CMS Portal
            </Link>
          </nav>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-2)',
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: 'var(--color-text-primary)',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <nav
            className="mobile-nav-menu"
            style={{
              borderTop: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-surface)',
              padding: 'var(--space-4) 0',
            }}
            aria-label="Mobile Navigation"
          >
            <div
              className="container"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}
            >
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={handleLinkClick}
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--color-text-primary)',
                    padding: 'var(--space-2) 0',
                  }}
                >
                  {link.label}
                </a>
              ))}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
                <Link
                  to="/admin/login"
                  onClick={handleLinkClick}
                  className="btn btn-outline"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  CMS Portal
                </Link>
              </div>
            </div>
          </nav>
        )}
      </header>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer
        style={{
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg-surface)',
          padding: 'var(--space-8) 0',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-sm)',
        }}
      >
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <p style={{ fontWeight: 'var(--weight-medium)', color: 'var(--color-text-secondary)' }}>
            Tanish Mistry — Developer Portfolio
          </p>
          <p>© {new Date().getFullYear()} All rights reserved. Managed with dynamic CMS.</p>
        </div>
      </footer>

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-toggle {
            display: none !important;
          }
          .mobile-nav-menu {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
