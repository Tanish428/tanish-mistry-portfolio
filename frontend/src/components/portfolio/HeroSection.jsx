import { useState } from 'react';
import BrandLogo from '../common/BrandLogo';

export default function HeroSection({ section }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { content } = section || {};
  if (!content) return null;

  const {
    fullName = 'Tanish Mistry',
    professionalTitle = 'Full Stack Developer | Computer Engineering Student',
    shortIntroduction,
    profileImageUrl,
    profileImageAlt,
    availabilityStatus,
    primaryCtaLabel = 'View My Projects',
    primaryCtaUrl = '#projects',
  } = content;

  // Fallback if URL is missing or fails
  const realImageUrl = profileImageUrl || 'https://res.cloudinary.com/ndlay40n/image/upload/v1793538415/portfolio/img_1793538411212_0c0848c92f68.png';

  const availabilityText = availabilityStatus
    ? availabilityStatus.replace(/_/g, ' ')
    : 'open to internships';

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        padding: 'var(--space-16) 0 var(--space-20)',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
      }}
    >
      {/* Ambient background glow highlights */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '650px',
          height: '650px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(185, 77, 255, 0.16) 0%, rgba(139, 66, 255, 0.05) 50%, transparent 75%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        aria-hidden="true"
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="hero-layout">
          {/* ====================================================
              LEFT SIDE: Introduction & Calls to Action
             ==================================================== */}
          <div className="hero-left">
            <div className="hero-greeting-badge">
              <span className="hero-pulse-dot" />
              <span>Hello, I'm</span>
            </div>

            <h1 className="hero-name">
              <span className="gradient-heading" style={{ textTransform: 'uppercase' }}>{fullName}</span>
            </h1>

            <div className="hero-title-group">
              <h2 className="hero-subtitle">Computer Engineering Undergraduate</h2>
              <p className="hero-tagline">{professionalTitle || 'Full-Stack Developer | Backend Enthusiast'}</p>
            </div>

            <p className="hero-bio">
              {shortIntroduction ||
                'Passionate Computer Engineering student building robust, scalable web platforms and high-performance backend systems with modern engineering discipline.'}
            </p>

            <div className="hero-actions">
              <a href={primaryCtaUrl || '#projects'} className="btn btn-primary hero-btn-main">
                <span>{primaryCtaLabel || 'View My Projects'}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M7 17l10-10M17 17V7H7" />
                </svg>
              </a>

              <a
                href="#about"
                className="btn btn-outline hero-btn-sub"
              >
                <span>Download Resume</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              </a>
            </div>

            {/* Social Icons Row */}
            <div className="hero-social-row">
              <a
                href="https://github.com/Tanish428"
                target="_blank"
                rel="noopener noreferrer"
                className="hero-social-link"
                aria-label="GitHub Profile"
              >
                <BrandLogo name="github" size={20} ariaHidden={true} />
              </a>

              <a
                href="https://www.linkedin.com/in/tanish-mistry-1531333b9/"
                target="_blank"
                rel="noopener noreferrer"
                className="hero-social-link"
                aria-label="LinkedIn Profile"
              >
                <BrandLogo name="linkedin" size={20} ariaHidden={true} />
              </a>

              <a
                href="mailto:tanishymistry@gmail.com"
                className="hero-social-link"
                aria-label="Email Tanish Mistry"
              >
                <BrandLogo name="email" size={20} ariaHidden={true} />
              </a>
            </div>
          </div>

          {/* ====================================================
              CENTER: Actual Profile Photograph (Cloudinary)
             ==================================================== */}
          <div className="hero-center">
            <div className="hero-portrait-stage">
              {/* Outer decorative neon rings */}
              <div className="hero-portrait-ring-outer" />
              <div className="hero-portrait-ring-inner" />

              {/* 4:5 Aspect Ratio Portrait Frame */}
              <div className="hero-portrait-frame">
                {!imageError ? (
                  <img
                    src={realImageUrl}
                    alt={profileImageAlt || `${fullName} - Computer Engineering Undergraduate`}
                    className={`hero-portrait-img ${imageLoaded ? 'loaded' : ''}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    loading="eager"
                  />
                ) : (
                  <div className="hero-portrait-fallback">
                    <span style={{ fontSize: '4rem' }}>👨‍💻</span>
                    <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                      {fullName}
                    </p>
                  </div>
                )}
                {/* Subtle bottom gradient shade for organic blending */}
                <div className="hero-portrait-gradient-overlay" />
              </div>

              {/* Status floating chip */}
              <div className="hero-floating-badge">
                <span className="hero-status-beacon" />
                <span style={{ textTransform: 'capitalize' }}>{availabilityText}</span>
              </div>
            </div>
          </div>

          {/* ====================================================
              RIGHT SIDE: Personal & Academic Highlights Card
             ==================================================== */}
          <div className="hero-right">
            <div className="hero-info-card">
              <div className="hero-info-card-header">
                <span className="hero-info-tag">// PROFILE HIGHLIGHTS</span>
                <span className="hero-info-accent-bar" />
              </div>

              <div className="hero-info-list">
                {/* Item 1: Availability */}
                <div className="hero-info-row">
                  <div className="hero-info-icon-box status-accent">
                    <span className="hero-pulse-dot" />
                  </div>
                  <div className="hero-info-content">
                    <span className="hero-info-label">Current Status</span>
                    <span className="hero-info-val">Available for Software Engineering Internships</span>
                  </div>
                </div>

                {/* Item 2: Degree */}
                <div className="hero-info-row">
                  <div className="hero-info-icon-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  </div>
                  <div className="hero-info-content">
                    <span className="hero-info-label">Academic Program</span>
                    <span className="hero-info-val">B.Tech. Computer Engineering</span>
                  </div>
                </div>

                {/* Item 3: University */}
                <div className="hero-info-row">
                  <div className="hero-info-icon-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                    </svg>
                  </div>
                  <div className="hero-info-content">
                    <span className="hero-info-label">University</span>
                    <span className="hero-info-val">Dharmsinh Desai University</span>
                  </div>
                </div>

                {/* Item 4: Location */}
                <div className="hero-info-row">
                  <div className="hero-info-icon-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="hero-info-content">
                    <span className="hero-info-label">Location</span>
                    <span className="hero-info-val">Nadiad, Gujarat, India</span>
                  </div>
                </div>

                {/* Item 5: Academic Merit */}
                <div className="hero-info-row merit-row">
                  <div className="hero-info-icon-box merit-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="8" r="7" />
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                    </svg>
                  </div>
                  <div className="hero-info-content">
                    <span className="hero-info-label">Academic Merit</span>
                    <span className="hero-info-val merit-val">CGPA 9.26/10 (Through Sem V)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styled Layout & Scoped CSS */}
      <style>{`
        .hero-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-12);
          align-items: center;
        }

        @media (min-width: 1024px) {
          .hero-layout {
            grid-template-columns: 1.15fr 1fr 0.95fr;
            gap: var(--space-8);
          }
        }

        /* Left Side */
        .hero-left {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          text-align: left;
        }

        .hero-greeting-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-full);
          background: rgba(185, 77, 255, 0.1);
          border: 1px solid rgba(185, 77, 255, 0.3);
          color: #d48aff;
          font-size: var(--text-xs);
          font-weight: var(--weight-semibold);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          width: fit-content;
        }

        .hero-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #34d399;
          box-shadow: 0 0 8px #34d399;
          animation: heroPulse 2s infinite ease-in-out;
        }

        @keyframes heroPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
        }

        .hero-name {
          font-size: clamp(2.5rem, 5vw, 3.75rem);
          font-weight: var(--weight-extrabold);
          letter-spacing: -0.03em;
          line-height: 1.05;
          margin: 0;
        }

        .hero-title-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .hero-subtitle {
          font-size: var(--text-xl);
          font-weight: var(--weight-semibold);
          color: #F8F7FC;
          margin: 0;
        }

        .hero-tagline {
          font-size: var(--text-base);
          font-weight: var(--weight-medium);
          color: var(--color-primary);
          margin: 0;
          letter-spacing: -0.01em;
        }

        .hero-bio {
          font-size: var(--text-base);
          color: var(--color-text-secondary);
          line-height: var(--leading-relaxed);
          margin: var(--space-2) 0 0;
          max-width: 520px;
        }

        .hero-actions {
          display: flex;
          gap: var(--space-4);
          flex-wrap: wrap;
          margin-top: var(--space-3);
        }

        .hero-btn-main {
          padding: 0.85rem 1.6rem;
          font-size: var(--text-sm);
        }

        .hero-btn-sub {
          padding: 0.85rem 1.4rem;
          font-size: var(--text-sm);
        }

        .hero-social-row {
          display: flex;
          gap: var(--space-3);
          margin-top: var(--space-2);
        }

        .hero-social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: var(--radius-lg);
          background: rgba(21, 17, 40, 0.7);
          border: 1px solid rgba(168, 85, 247, 0.25);
          color: var(--color-text-secondary);
          transition: all var(--transition-fast);
          text-decoration: none;
        }

        .hero-social-link:hover {
          color: #FFFFFF;
          border-color: var(--color-primary);
          background: rgba(185, 77, 255, 0.2);
          box-shadow: 0 0 15px rgba(185, 77, 255, 0.4);
          transform: translateY(-2px);
        }

        /* Center: 4:5 Portrait Stage */
        .hero-center {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        .hero-portrait-stage {
          position: relative;
          width: 100%;
          max-width: 360px;
          display: flex;
          justify-content: center;
        }

        .hero-portrait-ring-outer {
          position: absolute;
          top: -16px;
          bottom: -16px;
          left: -16px;
          right: -16px;
          border-radius: calc(var(--radius-2xl) + 12px);
          border: 1px dashed rgba(185, 77, 255, 0.25);
          pointer-events: none;
        }

        .hero-portrait-ring-inner {
          position: absolute;
          inset: -6px;
          border-radius: calc(var(--radius-2xl) + 4px);
          background: linear-gradient(135deg, rgba(185, 77, 255, 0.4) 0%, rgba(139, 66, 255, 0.1) 100%);
          filter: blur(14px);
          opacity: 0.75;
          pointer-events: none;
        }

        .hero-portrait-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 5;
          max-height: 460px;
          border-radius: var(--radius-2xl);
          overflow: hidden;
          background: #151128;
          border: 2px solid rgba(185, 77, 255, 0.45);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(185, 77, 255, 0.25);
          z-index: 1;
        }

        .hero-portrait-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          transition: transform var(--transition-slow);
          display: block;
        }

        .hero-portrait-stage:hover .hero-portrait-img {
          transform: scale(1.03);
        }

        .hero-portrait-gradient-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 35%;
          background: linear-gradient(to top, rgba(9, 8, 18, 0.85) 0%, transparent 100%);
          pointer-events: none;
        }

        .hero-portrait-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #151128;
          color: var(--color-text-secondary);
        }

        .hero-floating-badge {
          position: absolute;
          bottom: -14px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: 0.45rem 1rem;
          background: rgba(16, 13, 32, 0.95);
          border: 1px solid rgba(185, 77, 255, 0.4);
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          font-weight: var(--weight-semibold);
          color: #F8F7FC;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6), 0 0 15px rgba(185, 77, 255, 0.3);
          z-index: 2;
          white-space: nowrap;
        }

        .hero-status-beacon {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }

        /* Right Side: Information Highlights Card */
        .hero-right {
          display: flex;
          justify-content: flex-start;
          width: 100%;
        }

        .hero-info-card {
          width: 100%;
          background: rgba(21, 17, 40, 0.7);
          border: 1px solid rgba(168, 85, 247, 0.25);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          backdrop-filter: blur(14px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
          transition: border-color var(--transition-normal);
        }

        .hero-info-card:hover {
          border-color: rgba(185, 77, 255, 0.45);
        }

        .hero-info-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-5);
          padding-bottom: var(--space-3);
          border-bottom: 1px solid rgba(168, 85, 247, 0.15);
        }

        .hero-info-tag {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          color: #d48aff;
          letter-spacing: 0.08em;
          font-weight: var(--weight-semibold);
        }

        .hero-info-accent-bar {
          width: 24px;
          height: 3px;
          border-radius: 2px;
          background: var(--color-primary);
          box-shadow: 0 0 8px var(--color-primary);
        }

        .hero-info-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .hero-info-row {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
        }

        .hero-info-icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          min-width: 36px;
          border-radius: var(--radius-md);
          background: rgba(185, 77, 255, 0.1);
          border: 1px solid rgba(185, 77, 255, 0.25);
          color: #d48aff;
        }

        .hero-info-icon-box.status-accent {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);
          color: #34d399;
        }

        .hero-info-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .hero-info-label {
          font-size: 0.725rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: var(--weight-medium);
        }

        .hero-info-val {
          font-size: var(--text-sm);
          font-weight: var(--weight-semibold);
          color: #F8F7FC;
          line-height: var(--leading-normal);
        }

        .merit-row {
          background: rgba(185, 77, 255, 0.08);
          border: 1px solid rgba(185, 77, 255, 0.3);
          border-radius: var(--radius-lg);
          padding: var(--space-3);
          margin-top: var(--space-1);
        }

        .merit-icon {
          background: rgba(185, 77, 255, 0.2);
          border-color: rgba(185, 77, 255, 0.4);
          color: #FFFFFF;
        }

        .merit-val {
          color: #d48aff;
          font-weight: var(--weight-bold);
        }

        /* Responsive breakpoints */
        @media (max-width: 1023px) {
          .hero-left {
            text-align: center;
            align-items: center;
          }
          .hero-greeting-badge {
            margin: 0 auto;
          }
          .hero-actions {
            justify-content: center;
          }
          .hero-social-row {
            justify-content: center;
          }
          .hero-center {
            order: -1;
            margin-bottom: var(--space-4);
          }
          .hero-right {
            max-width: 560px;
            margin: 0 auto;
          }
        }
      `}</style>
    </section>
  );
}
