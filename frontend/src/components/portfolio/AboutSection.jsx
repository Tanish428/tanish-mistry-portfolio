export default function AboutSection({ section }) {
  const { title, subtitle, content } = section || {};
  if (!content) return null;

  const { fullName, professionalTitle, about, location, publicEmail, profileImageUrl, profileImageAlt } = content;

  return (
    <section
      id="about"
      style={{
        padding: 'var(--space-16) 0',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-surface)',
      }}
    >
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-2)' }}>
            {title || 'About Me'}
          </h2>
          {subtitle && (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)' }}>{subtitle}</p>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: profileImageUrl ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr',
            gap: 'var(--space-8)',
            alignItems: 'center',
          }}
        >
          {profileImageUrl && (
            <div
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
                maxHeight: '360px',
              }}
            >
              <img
                src={profileImageUrl}
                alt={profileImageAlt || `${fullName || 'Developer'} portrait`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {fullName && (
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)' }}>
                {fullName} {professionalTitle && <span style={{ color: 'var(--color-text-muted)', fontWeight: 'var(--weight-regular)' }}>— {professionalTitle}</span>}
              </h3>
            )}

            {about && (
              <p
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: 'var(--leading-relaxed)',
                  whiteSpace: 'pre-line',
                }}
              >
                {about}
              </p>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
              {location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  <span>📍</span>
                  <span>{location}</span>
                </div>
              )}
              {publicEmail && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  <span>✉️</span>
                  <a href={`mailto:${publicEmail}`} style={{ color: 'var(--color-primary)' }}>
                    {publicEmail}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
