import { Link } from 'react-router-dom';
import BrandLogo from '../common/BrandLogo';

export default function ProjectsSection({ section }) {
  const { title, subtitle, content } = section || {};
  const projects = content?.projects || [];

  if (projects.length === 0) return null;

  // Custom visual fallback generator when a project record has no uploaded thumbnail
  const renderProjectVisual = (proj) => {
    if (proj.thumbnailUrl) {
      return (
        <div className="project-thumb-frame">
          <img
            src={proj.thumbnailUrl}
            alt={proj.thumbnailAlt || proj.title}
            className="project-thumb-img"
            loading="lazy"
          />
        </div>
      );
    }

    // Specific stylized neon banner per project
    const isMealMate = proj.slug?.includes('meal') || proj.title?.toLowerCase().includes('meal');
    const isSmartDevice = proj.slug?.includes('smart') || proj.title?.toLowerCase().includes('device');
    const isGRIP = proj.slug?.includes('grip') || proj.title?.toLowerCase().includes('grip');
    const isStock = proj.slug?.includes('stock') || proj.title?.toLowerCase().includes('stock');

    return (
      <div className={`project-visual-banner ${isMealMate ? 'theme-meal' : isSmartDevice ? 'theme-device' : isGRIP ? 'theme-grip' : 'theme-stock'}`}>
        <div className="banner-grid-lines" />
        <div className="banner-content">
          <div className="banner-badge-top">
            <span className="banner-dot" />
            <span>{proj.category?.toUpperCase() || 'ENGINEERING'}</span>
          </div>

          <div className="banner-center-icon">
            {isMealMate && (
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#d48aff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
                <path d="M9 7h6M9 11h6M9 14h3" />
              </svg>
            )}
            {isSmartDevice && (
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#d48aff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
                <path d="M7 8h2v4H7zM11 8h6v2h-6zM11 12h4v2h-4z" />
              </svg>
            )}
            {isGRIP && (
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#d48aff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l9 4.9V17L12 22l-9-5V6.9L12 2z" />
                <path d="M12 12l8.5-4.5M12 12v9.5M12 12L3.5 7.5" />
              </svg>
            )}
            {isStock && (
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#d48aff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            )}
          </div>

          <div className="banner-foot-code">
            <code>
              {isMealMate && 'Flutter + Supabase + PostgreSQL'}
              {isSmartDevice && 'C# + ASP.NET Core + SQL Server'}
              {isGRIP && 'React + Node + Express + MongoDB'}
              {isStock && 'Python + Django + SQLite + yfinance'}
            </code>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id="projects"
      style={{
        position: 'relative',
        padding: 'var(--space-20) 0',
        backgroundColor: '#090812',
        borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 'var(--weight-bold)' }}>
              // 02. PORTFOLIO SHOWCASE
            </span>
          </div>
          <h2 className="gradient-heading" style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 'var(--weight-extrabold)', letterSpacing: '-0.02em', margin: 0 }}>
            {title || 'Featured Projects'}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', maxWidth: '640px', margin: 'var(--space-3) auto 0' }}>
            {subtitle || 'Full-stack web applications, mobile platforms, and system tools built with performance and clean architecture.'}
          </p>
        </div>

        {/* 3-Column Desktop Grid / 2-Col Tablet / 1-Col Mobile */}
        <div className="projects-grid">
          {projects.map((proj) => (
            <article key={proj.id || proj.slug} className="project-card">
              {/* Visual Thumbnail or Neon Banner */}
              {renderProjectVisual(proj)}

              <div className="project-content">
                <div className="project-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <h3 className="project-title">
                      <Link to={`/projects/${proj.slug}`}>
                        {proj.title}
                      </Link>
                    </h3>
                  </div>

                  {proj.isFeatured && (
                    <span className="project-featured-badge">
                      ★ Featured
                    </span>
                  )}
                </div>

                <p className="project-desc">
                  {proj.shortDescription || proj.description}
                </p>

                {/* Technology Badges with authentic brand logos */}
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="project-tech-list">
                    {proj.technologies.map((tech) => (
                      <span key={tech} className="project-tech-badge">
                        <BrandLogo name={tech} size={16} ariaHidden={true} />
                        <span>{tech}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions Footer */}
                <div className="project-footer">
                  <Link to={`/projects/${proj.slug}`} className="project-link-btn view-btn">
                    <span>View Details</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>

                  <div className="project-action-icons">
                    {proj.repositoryUrl && (
                      <a
                        href={proj.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-icon-btn"
                        aria-label={`${proj.title} Source Code`}
                        title="View Source Code"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                      </a>
                    )}

                    {proj.liveDemoUrl && (
                      <a
                        href={proj.liveDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-icon-btn live-btn"
                        aria-label={`${proj.title} Live Demo`}
                        title="Launch Live Demo"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        .projects-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-8);
        }

        @media (min-width: 680px) and (max-width: 1023px) {
          .projects-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .projects-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .project-card {
          display: flex;
          flex-direction: column;
          background: rgba(21, 17, 40, 0.7);
          border: 1px solid rgba(168, 85, 247, 0.25);
          border-radius: var(--radius-xl);
          overflow: hidden;
          backdrop-filter: blur(12px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
          transition: all var(--transition-normal);
        }

        .project-card:hover {
          border-color: rgba(185, 77, 255, 0.55);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6), 0 0 25px rgba(185, 77, 255, 0.2);
          transform: translateY(-4px);
        }

        /* Thumb Image Frame */
        .project-thumb-frame {
          height: 190px;
          width: 100%;
          overflow: hidden;
          background: #151128;
          border-bottom: 1px solid rgba(168, 85, 247, 0.2);
        }

        .project-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }

        .project-card:hover .project-thumb-img {
          transform: scale(1.05);
        }

        /* Stylized Neon Visual Banner */
        .project-visual-banner {
          position: relative;
          height: 175px;
          width: 100%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid rgba(168, 85, 247, 0.2);
          background: linear-gradient(135deg, #130f26 0%, #1a1435 100%);
        }

        .banner-grid-lines {
          position: absolute;
          inset: 0;
          background-size: 24px 24px;
          background-image: 
            linear-gradient(to right, rgba(168, 85, 247, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(168, 85, 247, 0.08) 1px, transparent 1px);
        }

        .banner-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          padding: var(--space-4);
          width: 100%;
        }

        .banner-badge-top {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          background: rgba(185, 77, 255, 0.12);
          border: 1px solid rgba(185, 77, 255, 0.3);
          font-size: 0.675rem;
          font-weight: var(--weight-bold);
          color: #d48aff;
          letter-spacing: 0.08em;
        }

        .banner-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-primary);
          box-shadow: 0 0 6px var(--color-primary);
        }

        .banner-center-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 58px;
          height: 58px;
          border-radius: var(--radius-xl);
          background: rgba(21, 17, 40, 0.85);
          border: 1px solid rgba(185, 77, 255, 0.35);
          box-shadow: 0 0 20px rgba(185, 77, 255, 0.2);
          transition: transform var(--transition-normal);
        }

        .project-card:hover .banner-center-icon {
          transform: scale(1.1);
          border-color: var(--color-primary);
        }

        .banner-foot-code {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--color-text-muted);
          background: rgba(9, 8, 18, 0.6);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }

        /* Card Content */
        .project-content {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: var(--space-6);
        }

        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-2);
          margin-bottom: var(--space-2);
        }

        .project-title {
          font-size: var(--text-lg);
          font-weight: var(--weight-bold);
          line-height: var(--leading-tight);
          margin: 0;
        }

        .project-title a {
          color: #F8F7FC;
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .project-title a:hover {
          color: var(--color-primary);
        }

        .project-featured-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);
          font-size: 0.7rem;
          font-weight: var(--weight-semibold);
          background: rgba(185, 77, 255, 0.15);
          color: #d48aff;
          border: 1px solid rgba(185, 77, 255, 0.35);
          white-space: nowrap;
        }

        .project-desc {
          color: var(--color-text-secondary);
          font-size: 0.85rem;
          line-height: var(--leading-normal);
          margin: var(--space-2) 0 var(--space-4);
          flex: 1;
        }

        .project-tech-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: var(--space-5);
        }

        .project-tech-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.725rem;
          font-weight: var(--weight-medium);
          padding: 3px 8px;
          border-radius: var(--radius-md);
          background: rgba(185, 77, 255, 0.08);
          color: #dcd7ea;
          border: 1px solid rgba(168, 85, 247, 0.2);
          transition: all var(--transition-fast);
        }

        .project-tech-badge:hover {
          background: rgba(185, 77, 255, 0.15);
          border-color: rgba(185, 77, 255, 0.4);
          color: #FFFFFF;
        }

        .project-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: var(--space-4);
          border-top: 1px solid rgba(168, 85, 247, 0.15);
          margin-top: auto;
        }

        .project-link-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--text-xs);
          font-weight: var(--weight-semibold);
          color: var(--color-primary);
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .project-link-btn:hover {
          color: #FFFFFF;
          text-shadow: 0 0 8px rgba(185, 77, 255, 0.5);
          transform: translateX(2px);
        }

        .project-action-icons {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .project-icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          background: rgba(27, 22, 51, 0.6);
          border: 1px solid rgba(168, 85, 247, 0.25);
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .project-icon-btn:hover {
          background: rgba(185, 77, 255, 0.2);
          border-color: var(--color-primary);
          color: #FFFFFF;
          box-shadow: 0 0 10px rgba(185, 77, 255, 0.35);
        }
      `}</style>
    </section>
  );
}
