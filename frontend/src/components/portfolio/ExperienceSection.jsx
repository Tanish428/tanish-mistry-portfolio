export default function ExperienceSection({ section }) {
  const { title, subtitle, content } = section || {};
  const experiences = content?.experience || [];

  if (experiences.length === 0) return null;

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
        padding: 'var(--space-16) 0',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-base)',
      }}
    >
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-2)' }}>
            {title || 'Work Experience'}
          </h2>
          {subtitle && (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)' }}>{subtitle}</p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {experiences.map((exp) => (
            <div key={exp.id || exp.title} className="card" style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)' }}>{exp.title}</h3>
                  <p style={{ color: 'var(--color-primary)', fontWeight: 'var(--weight-medium)', fontSize: 'var(--text-sm)' }}>
                    {exp.company} {exp.location && `• ${exp.location}`}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-info" style={{ fontSize: 'var(--text-xs)' }}>
                    {formatDate(exp.startDate)} — {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                  </span>
                  {exp.employmentType && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)', textTransform: 'capitalize' }}>
                      {exp.employmentType.replace(/_/g, ' ')}
                    </div>
                  )}
                </div>
              </div>

              {exp.description && (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', marginTop: 'var(--space-3)', whiteSpace: 'pre-line' }}>
                  {exp.description}
                </p>
              )}

              {exp.technologies && exp.technologies.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginTop: 'var(--space-4)' }}>
                  {exp.technologies.map((tech) => (
                    <span
                      key={tech}
                      style={{
                        fontSize: 'var(--text-xs)',
                        backgroundColor: 'var(--color-bg-subtle)',
                        color: 'var(--color-text-secondary)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
