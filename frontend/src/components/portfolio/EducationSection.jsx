export default function EducationSection({ section }) {
  const { title, subtitle, content } = section || {};
  const educationList = content?.education || [];

  if (educationList.length === 0) return null;

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
      id="education"
      style={{
        padding: 'var(--space-16) 0',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-surface)',
      }}
    >
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-2)' }}>
            {title || 'Education & Credentials'}
          </h2>
          {subtitle && (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)' }}>{subtitle}</p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {educationList.map((edu) => (
            <div key={edu.id || edu.institution} className="card" style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)' }}>{edu.degree}</h3>
                  {edu.fieldOfStudy && (
                    <p style={{ color: 'var(--color-primary)', fontWeight: 'var(--weight-medium)', fontSize: 'var(--text-sm)' }}>
                      {edu.fieldOfStudy}
                    </p>
                  )}
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
                    {edu.institution} {edu.location && `• ${edu.location}`}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-info" style={{ fontSize: 'var(--text-xs)' }}>
                    {formatDate(edu.startDate)} — {edu.isCurrent ? 'Present' : formatDate(edu.endDate)}
                  </span>
                  {edu.grade && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                      Grade: {edu.grade}
                    </div>
                  )}
                </div>
              </div>

              {edu.description && (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', marginTop: 'var(--space-3)', whiteSpace: 'pre-line' }}>
                  {edu.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
