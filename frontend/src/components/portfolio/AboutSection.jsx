export default function AboutSection({ section }) {
  const { title, content } = section || {};
  if (!content) return null;

  const {
    fullName = 'Tanish Mistry',
    professionalTitle,
    about,
    location = 'Nadiad, Gujarat, India',
    publicEmail = 'tanishymistry@gmail.com',
  } = content;

  return (
    <section
      id="about"
      style={{
        position: 'relative',
        padding: 'var(--space-20) 0',
        backgroundColor: '#090812',
        borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
        overflow: 'hidden',
      }}
    >
      {/* Background glow accent */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 66, 255, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

      <div className="container">
        <div className="about-grid">
          {/* ====================================================
              LEFT SIDE: Section Number, Labels, Biography
             ==================================================== */}
          <div className="about-left">
            <div className="about-label-row">
              <span className="about-number">01</span>
              <span className="about-pill">ABOUT ME</span>
            </div>

            <h2 className="about-heading gradient-heading">
              {title || 'Get to know me'}
            </h2>

            {professionalTitle && (
              <p className="about-role">
                {professionalTitle}
              </p>
            )}

            <div className="about-bio-text">
              <p>
                {about ||
                  'I am a dedicated Computer Engineering undergraduate at Dharmsinh Desai University with a strong foundation in full-stack web development, software engineering principles, and database management. My technical focus revolves around scalable architecture design, robust backend workflows, and modern, responsive web applications.'}
              </p>
            </div>

            <div className="about-meta-grid">
              <div className="about-meta-item">
                <span className="about-meta-icon">📍</span>
                <div>
                  <span className="about-meta-label">Location</span>
                  <span className="about-meta-value">{location}</span>
                </div>
              </div>

              <div className="about-meta-item">
                <span className="about-meta-icon">✉️</span>
                <div>
                  <span className="about-meta-label">Direct Contact</span>
                  <a href={`mailto:${publicEmail}`} className="about-meta-link">
                    {publicEmail}
                  </a>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-6)' }}>
              <a href="#projects" className="btn btn-outline about-cta-link">
                <span>Explore Featured Works</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
          </div>

          {/* ====================================================
              RIGHT SIDE: Glass-Style Statistic & Highlight Cards
             ==================================================== */}
          <div className="about-right">
            <div className="about-stats-grid">
              {/* Stat 1: CGPA */}
              <div className="about-stat-card card-glow">
                <div className="stat-card-header">
                  <span className="stat-number gradient-heading">9.26</span>
                  <span className="stat-scale">/ 10</span>
                </div>
                <h3 className="stat-title">Cumulative Grade Point</h3>
                <p className="stat-desc">Through Semester V at Dharmsinh Desai University</p>
              </div>

              {/* Stat 2: Projects */}
              <div className="about-stat-card card-glow">
                <div className="stat-card-header">
                  <span className="stat-number gradient-heading">4+</span>
                </div>
                <h3 className="stat-title">Engineered Projects</h3>
                <p className="stat-desc">Full-stack web applications, mobile platforms & micro-tools</p>
              </div>

              {/* Stat 3: Technical Skills */}
              <div className="about-stat-card card-glow">
                <div className="stat-card-header">
                  <span className="stat-number gradient-heading">30+</span>
                </div>
                <h3 className="stat-title">Technologies Mastered</h3>
                <p className="stat-desc">Languages, full-stack frameworks, databases & developer tools</p>
              </div>

              {/* Stat 4: Academic Timeline */}
              <div className="about-stat-card card-glow">
                <div className="stat-card-header">
                  <span className="stat-number gradient-heading">2024–28</span>
                </div>
                <h3 className="stat-title">B.Tech. Undergrad</h3>
                <p className="stat-desc">Continuous pursuit of algorithmic & systems excellence</p>
              </div>
            </div>

            {/* Inspirational Quotation Card */}
            <div className="about-quote-card">
              <span className="quote-mark">“</span>
              <p className="quote-text">
                Crafting robust backend architectures, clean APIs, and modern user-centric interfaces from concept to production.
              </p>
              <span className="quote-author">— {fullName}</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .about-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-12);
          align-items: center;
        }

        @media (min-width: 1024px) {
          .about-grid {
            grid-template-columns: 1.1fr 1fr;
            gap: var(--space-16);
          }
        }

        .about-left {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .about-label-row {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .about-number {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          font-weight: var(--weight-bold);
          color: var(--color-primary);
        }

        .about-pill {
          font-size: var(--text-xs);
          font-weight: var(--weight-bold);
          letter-spacing: 0.1em;
          color: #d48aff;
          background: rgba(185, 77, 255, 0.1);
          border: 1px solid rgba(185, 77, 255, 0.3);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
        }

        .about-heading {
          font-size: clamp(2rem, 4vw, 2.75rem);
          font-weight: var(--weight-extrabold);
          letter-spacing: -0.02em;
          margin: 0;
          line-height: 1.15;
        }

        .about-role {
          font-size: var(--text-lg);
          color: var(--color-primary);
          font-weight: var(--weight-medium);
          margin: 0;
        }

        .about-bio-text {
          font-size: var(--text-base);
          color: var(--color-text-secondary);
          line-height: var(--leading-relaxed);
          margin-top: var(--space-2);
        }

        .about-meta-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-4);
          margin-top: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid rgba(168, 85, 247, 0.15);
        }

        @media (min-width: 640px) {
          .about-meta-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .about-meta-item {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
        }

        .about-meta-icon {
          font-size: 1.25rem;
          line-height: 1;
        }

        .about-meta-label {
          display: block;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: var(--weight-medium);
        }

        .about-meta-value {
          font-size: var(--text-sm);
          color: #F8F7FC;
          font-weight: var(--weight-medium);
        }

        .about-meta-link {
          font-size: var(--text-sm);
          color: #d48aff;
          text-decoration: none;
          font-weight: var(--weight-medium);
          transition: color var(--transition-fast);
        }

        .about-meta-link:hover {
          color: #FFFFFF;
          text-decoration: underline;
        }

        .about-cta-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          border-color: rgba(185, 77, 255, 0.35);
        }

        /* Right Side: Stats & Quote */
        .about-right {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .about-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }

        .about-stat-card {
          background: rgba(21, 17, 40, 0.7);
          border: 1px solid rgba(168, 85, 247, 0.25);
          border-radius: var(--radius-xl);
          padding: var(--space-5);
          backdrop-filter: blur(12px);
          transition: all var(--transition-normal);
        }

        .about-stat-card:hover {
          border-color: rgba(185, 77, 255, 0.5);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4), 0 0 15px rgba(185, 77, 255, 0.2);
          transform: translateY(-2px);
        }

        .stat-card-header {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: var(--space-1);
        }

        .stat-number {
          font-size: var(--text-3xl);
          font-weight: var(--weight-extrabold);
          line-height: 1;
        }

        .stat-scale {
          font-size: var(--text-xs);
          color: var(--color-text-muted);
          font-weight: var(--weight-medium);
        }

        .stat-title {
          font-size: var(--text-sm);
          font-weight: var(--weight-semibold);
          color: #F8F7FC;
          margin: 0 0 4px;
        }

        .stat-desc {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
          line-height: var(--leading-normal);
          margin: 0;
        }

        .about-quote-card {
          position: relative;
          background: linear-gradient(135deg, rgba(27, 22, 51, 0.8) 0%, rgba(21, 17, 40, 0.6) 100%);
          border: 1px solid rgba(185, 77, 255, 0.35);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(12px);
        }

        .quote-mark {
          position: absolute;
          top: var(--space-2);
          right: var(--space-4);
          font-size: 3.5rem;
          font-family: serif;
          color: rgba(185, 77, 255, 0.15);
          line-height: 1;
          pointer-events: none;
        }

        .quote-text {
          font-size: var(--text-sm);
          font-style: italic;
          color: #dcd7ea;
          line-height: var(--leading-relaxed);
          margin: 0 0 var(--space-3);
        }

        .quote-author {
          font-size: var(--text-xs);
          font-weight: var(--weight-semibold);
          color: var(--color-primary);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
      `}</style>
    </section>
  );
}
