export default function ExperienceSection({ section }) {
  const { title, subtitle, content } = section || {};
  const experiences = content?.experience || [];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
    } catch {
      return dateString;
    }
  };

  return (
    <section
      id="experience"
      style={{
        position: 'relative',
        padding: 'var(--space-20) 0',
        backgroundColor: '#090812',
        borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
      }}
    >
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 'var(--weight-bold)' }}>
              // 04. EXPERIENCE & ACTIVITY
            </span>
          </div>
          <h2 className="gradient-heading" style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 'var(--weight-extrabold)', letterSpacing: '-0.02em', margin: 0 }}>
            {title || 'Experience & Activity'}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', maxWidth: '640px', margin: 'var(--space-3) auto 0' }}>
            {subtitle || 'Open source engineering, professional commitments, and developer platform activity.'}
          </p>
        </div>

        <div className="experience-layout">
          {/* Work Experiences (if any exist in CMS) */}
          {experiences.length > 0 && (
            <div className="timeline-wrap">
              {experiences.map((exp) => (
                <div key={exp.id || exp.title} className="exp-timeline-item">
                  <div className="timeline-node">
                    <span className="node-glow-dot" />
                  </div>
                  <div className="exp-card">
                    <div className="exp-card-header">
                      <div>
                        <h3 className="exp-role">{exp.title}</h3>
                        <p className="exp-company">{exp.company} {exp.location && `• ${exp.location}`}</p>
                      </div>
                      <span className="exp-date-badge">
                        {formatDate(exp.startDate)} — {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                      </span>
                    </div>

                    {exp.description && (
                      <p className="exp-desc">{exp.description}</p>
                    )}

                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="exp-tech-tags">
                        {exp.technologies.map((t) => (
                          <span key={t} className="exp-tag">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Polished Activity Dashboard (Verified GitHub Profile & Platform Activity) */}
          <div className="activity-dashboard-card">
            <div className="activity-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span className="activity-beacon" />
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: '#F8F7FC', margin: 0 }}>
                  Developer Activity & Open Source
                </h3>
              </div>
              <a
                href="https://github.com/Tanish428"
                target="_blank"
                rel="noopener noreferrer"
                className="activity-profile-link"
              >
                <span>GitHub Profile</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', margin: 'var(--space-3) 0 var(--space-6)' }}>
              Actively developing full-stack applications, contributing to modular repositories, and exploring algorithms and backend architectures.
            </p>

            <div className="activity-repos-grid">
              {/* Repo 1: MealMate */}
              <a
                href="https://github.com/Tanish428/Mealmate"
                target="_blank"
                rel="noopener noreferrer"
                className="repo-activity-item"
              >
                <div className="repo-item-top">
                  <span className="repo-name">MealMate</span>
                  <span className="repo-lang-tag">Flutter</span>
                </div>
                <p className="repo-item-desc">
                  Smart meal planning and dietary tracking mobile application built with Flutter & Supabase.
                </p>
                <span className="repo-link-action">github.com/Tanish428/Mealmate →</span>
              </a>

              {/* Repo 2: SmartDeviceMatch */}
              <a
                href="https://github.com/Tanish428/SmartDeviceMatch"
                target="_blank"
                rel="noopener noreferrer"
                className="repo-activity-item"
              >
                <div className="repo-item-top">
                  <span className="repo-name">SmartDeviceMatch</span>
                  <span className="repo-lang-tag">C# / .NET</span>
                </div>
                <p className="repo-item-desc">
                  Hardware recommendation and specification comparison engine powered by ASP.NET Core & SQL Server.
                </p>
                <span className="repo-link-action">github.com/Tanish428/SmartDeviceMatch →</span>
              </a>

              {/* Repo 3: StockRiskTracker */}
              <a
                href="https://github.com/Tanish428/StockRiskTracker"
                target="_blank"
                rel="noopener noreferrer"
                className="repo-activity-item"
              >
                <div className="repo-item-top">
                  <span className="repo-name">StockRiskTracker</span>
                  <span className="repo-lang-tag">Python</span>
                </div>
                <p className="repo-item-desc">
                  Financial risk assessment and portfolio volatility monitoring tool using Django & yfinance.
                </p>
                <span className="repo-link-action">github.com/Tanish428/StockRiskTracker →</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .experience-layout {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }

        .timeline-wrap {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
          position: relative;
          padding-left: var(--space-6);
          border-left: 2px solid rgba(168, 85, 247, 0.25);
        }

        .exp-timeline-item {
          position: relative;
        }

        .timeline-node {
          position: absolute;
          left: calc(-1 * var(--space-6) - 7px);
          top: var(--space-4);
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #090812;
          border: 2px solid var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .node-glow-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-primary);
          box-shadow: 0 0 8px var(--color-primary);
        }

        .exp-card {
          background: rgba(21, 17, 40, 0.7);
          border: 1px solid rgba(168, 85, 247, 0.25);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          backdrop-filter: blur(12px);
        }

        .exp-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-bottom: var(--space-2);
        }

        .exp-role {
          font-size: var(--text-lg);
          font-weight: var(--weight-bold);
          color: #F8F7FC;
          margin: 0;
        }

        .exp-company {
          font-size: var(--text-sm);
          color: var(--color-primary);
          margin: 4px 0 0;
        }

        .exp-date-badge {
          font-size: var(--text-xs);
          color: #d48aff;
          background: rgba(185, 77, 255, 0.12);
          border: 1px solid rgba(185, 77, 255, 0.25);
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }

        .exp-desc {
          color: var(--color-text-secondary);
          font-size: var(--text-sm);
          line-height: var(--leading-relaxed);
          margin: var(--space-3) 0;
        }

        .exp-tech-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .exp-tag {
          font-size: 0.725rem;
          padding: 2px 8px;
          background: rgba(185, 77, 255, 0.08);
          border: 1px solid rgba(168, 85, 247, 0.2);
          border-radius: var(--radius-md);
          color: #dcd7ea;
        }

        /* Activity Dashboard Card */
        .activity-dashboard-card {
          background: rgba(21, 17, 40, 0.7);
          border: 1px solid rgba(168, 85, 247, 0.25);
          border-radius: var(--radius-xl);
          padding: var(--space-8);
          backdrop-filter: blur(12px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
        }

        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: var(--space-4);
          border-bottom: 1px solid rgba(168, 85, 247, 0.15);
        }

        .activity-beacon {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 10px #34d399;
        }

        .activity-profile-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          color: #d48aff;
          font-size: var(--text-xs);
          font-weight: var(--weight-semibold);
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .activity-profile-link:hover {
          color: #FFFFFF;
          text-shadow: 0 0 8px rgba(185, 77, 255, 0.5);
        }

        .activity-repos-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-4);
        }

        @media (min-width: 640px) {
          .activity-repos-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .repo-activity-item {
          display: flex;
          flex-direction: column;
          background: rgba(27, 22, 51, 0.6);
          border: 1px solid rgba(168, 85, 247, 0.2);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          text-decoration: none;
          transition: all var(--transition-normal);
        }

        .repo-activity-item:hover {
          background: rgba(35, 28, 66, 0.85);
          border-color: rgba(185, 77, 255, 0.45);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4), 0 0 15px rgba(185, 77, 255, 0.15);
          transform: translateY(-2px);
        }

        .repo-item-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-2);
        }

        .repo-name {
          font-size: var(--text-sm);
          font-weight: var(--weight-bold);
          color: #F8F7FC;
        }

        .repo-lang-tag {
          font-size: 0.675rem;
          color: #d48aff;
          background: rgba(185, 77, 255, 0.12);
          padding: 2px 6px;
          border-radius: var(--radius-sm);
        }

        .repo-item-desc {
          font-size: 0.775rem;
          color: var(--color-text-secondary);
          line-height: var(--leading-normal);
          margin: 0 0 var(--space-3);
          flex: 1;
        }

        .repo-link-action {
          font-family: var(--font-mono);
          font-size: 0.675rem;
          color: var(--color-primary);
          margin-top: auto;
        }
      `}</style>
    </section>
  );
}
