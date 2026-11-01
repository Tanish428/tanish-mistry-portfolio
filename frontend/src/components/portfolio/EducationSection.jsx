export default function EducationSection({ section }) {
  const { title, subtitle, content } = section || {};
  const educationList = content?.education || [];

  if (educationList.length === 0) return null;

  return (
    <section
      id="education"
      style={{
        position: 'relative',
        padding: 'var(--space-20) 0',
        backgroundColor: '#090812',
        borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
      }}
    >
      <div className="container" style={{ maxWidth: '860px' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 'var(--weight-bold)' }}>
              // 05. ACADEMIC CREDENTIALS
            </span>
          </div>
          <h2 className="gradient-heading" style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 'var(--weight-extrabold)', letterSpacing: '-0.02em', margin: 0 }}>
            {title || 'Education & Credentials'}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', maxWidth: '640px', margin: 'var(--space-3) auto 0' }}>
            {subtitle || 'Formal Computer Engineering academic education, honors, and core foundational engineering coursework.'}
          </p>
        </div>

        <div className="edu-list">
          {educationList.map((edu) => (
            <div key={edu.id || edu.institution} className="edu-premium-card">
              <div className="edu-card-glow" />

              <div className="edu-card-inner">
                <div className="edu-top-row">
                  <div className="edu-inst-info">
                    <span className="edu-period-badge">2024 — 2028 • B.Tech</span>
                    <h3 className="edu-degree">{edu.degree || 'B.Tech. Computer Engineering'}</h3>
                    <p className="edu-institution">
                      {edu.institution || 'Dharmsinh Desai University'} {edu.location && `• ${edu.location}`}
                    </p>
                  </div>

                  <div className="edu-grade-box">
                    <span className="edu-grade-label">Academic Merit</span>
                    <span className="edu-grade-value">{edu.grade || 'CGPA: 9.26/10'}</span>
                    <span className="edu-sem-label">Current: Semester V</span>
                  </div>
                </div>

                {edu.description && (
                  <p className="edu-desc">{edu.description}</p>
                )}

                <div className="edu-highlights-row">
                  <span className="edu-chip">Computer Engineering</span>
                  <span className="edu-chip">Data Structures & Algorithms</span>
                  <span className="edu-chip">Full-Stack Web Development</span>
                  <span className="edu-chip">Database Management Systems</span>
                  <span className="edu-chip">Software Engineering</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .edu-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .edu-premium-card {
          position: relative;
          background: rgba(21, 17, 40, 0.7);
          border: 1px solid rgba(168, 85, 247, 0.25);
          border-radius: var(--radius-2xl);
          overflow: hidden;
          backdrop-filter: blur(14px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
          transition: all var(--transition-normal);
        }

        .edu-premium-card:hover {
          border-color: rgba(185, 77, 255, 0.5);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5), 0 0 25px rgba(185, 77, 255, 0.2);
          transform: translateY(-2px);
        }

        .edu-card-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #8B42FF 0%, #B94DFF 50%, #8B42FF 100%);
          box-shadow: 0 0 12px var(--color-primary);
        }

        .edu-card-inner {
          padding: var(--space-8);
        }

        .edu-top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: var(--space-4);
          margin-bottom: var(--space-4);
        }

        .edu-period-badge {
          display: inline-block;
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          color: #d48aff;
          background: rgba(185, 77, 255, 0.12);
          border: 1px solid rgba(185, 77, 255, 0.25);
          padding: 3px 10px;
          border-radius: var(--radius-full);
          margin-bottom: var(--space-2);
          font-weight: var(--weight-medium);
        }

        .edu-degree {
          font-size: var(--text-2xl);
          font-weight: var(--weight-extrabold);
          color: #F8F7FC;
          letter-spacing: -0.01em;
          margin: 0;
        }

        .edu-institution {
          font-size: var(--text-base);
          color: var(--color-primary);
          font-weight: var(--weight-medium);
          margin: var(--space-1) 0 0;
        }

        .edu-grade-box {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          background: rgba(185, 77, 255, 0.08);
          border: 1px solid rgba(185, 77, 255, 0.3);
          border-radius: var(--radius-lg);
          padding: var(--space-3) var(--space-5);
        }

        @media (min-width: 640px) {
          .edu-grade-box {
            align-items: flex-end;
          }
        }

        .edu-grade-label {
          font-size: 0.7rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .edu-grade-value {
          font-size: var(--text-xl);
          font-weight: var(--weight-extrabold);
          color: #d48aff;
        }

        .edu-sem-label {
          font-size: 0.725rem;
          color: #34d399;
          font-weight: var(--weight-medium);
        }

        .edu-desc {
          color: var(--color-text-secondary);
          font-size: var(--text-sm);
          line-height: var(--leading-relaxed);
          margin: var(--space-4) 0;
          white-space: pre-line;
        }

        .edu-highlights-row {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-top: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid rgba(168, 85, 247, 0.15);
        }

        .edu-chip {
          font-size: var(--text-xs);
          padding: 4px 10px;
          border-radius: var(--radius-md);
          background: rgba(27, 22, 51, 0.6);
          border: 1px solid rgba(168, 85, 247, 0.2);
          color: #dcd7ea;
        }
      `}</style>
    </section>
  );
}
