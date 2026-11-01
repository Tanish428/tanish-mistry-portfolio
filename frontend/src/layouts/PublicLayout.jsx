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
    { label: 'Education', href: isHome ? '#education' : '/#education' },
    { label: 'Contact', href: isHome ? '#contact' : '/#contact' },
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg-base)' }}>
      <a href="#main-content" className="visually-hidden">
        Skip to main content
      </a>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 'var(--z-sticky)',
          backgroundColor: 'rgba(9, 8, 18, 0.85)',
          borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '72px',
          }}
        >
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--weight-extrabold)',
              color: 'var(--color-text-primary)',
              textDecoration: 'none',
              letterSpacing: '-0.02em',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                boxShadow: '0 0 12px var(--color-primary)',
              }}
            />
            <span className="gradient-heading" style={{ textTransform: 'uppercase' }}>Tanish Mistry</span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            style={{
              display: 'none',
              gap: 'var(--space-8)',
              alignItems: 'center',
            }}
            className="desktop-nav"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="nav-link"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
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
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-full)',
                borderColor: 'rgba(168, 85, 247, 0.35)',
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
              backgroundColor: 'rgba(21, 17, 40, 0.7)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: 'var(--color-text-primary)',
            }}
          >
            <svg
              width="22"
              height="22"
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
              borderTop: '1px solid rgba(168, 85, 247, 0.2)',
              backgroundColor: 'rgba(16, 13, 32, 0.98)',
              backdropFilter: 'blur(16px)',
              padding: 'var(--space-6) 0',
            }}
            aria-label="Mobile Navigation"
          >
            <div
              className="container"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
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
                    textDecoration: 'none',
                    padding: 'var(--space-2) 0',
                    borderBottom: '1px solid rgba(168, 85, 247, 0.1)',
                  }}
                >
                  {link.label}
                </a>
              ))}
              <div style={{ paddingTop: 'var(--space-2)' }}>
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

      <main id="main-content" style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer
        style={{
          borderTop: '1px solid rgba(168, 85, 247, 0.2)',
          backgroundColor: '#090812',
          padding: 'var(--space-10) 0',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-sm)',
          position: 'relative',
        }}
      >
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                boxShadow: '0 0 10px var(--color-primary)',
              }}
            />
            <p style={{ fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)', letterSpacing: '0.05em' }}>
              TANISH MISTRY
            </p>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '500px' }}>
            Full-Stack Developer & Computer Engineering Undergraduate at Dharmsinh Desai University.
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            © {new Date().getFullYear()} Tanish Mistry. Built with MERN Stack & Cloudinary CMS.
          </p>
        </div>
      </footer>

      <style>{`
        .nav-link:hover {
          color: var(--color-primary) !important;
          text-shadow: 0 0 8px rgba(185, 77, 255, 0.4);
        }
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
