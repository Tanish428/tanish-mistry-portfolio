export default function SocialLinksSection({ section }) {
  const { title, subtitle, content } = section || {};
  const links = content?.socialLinks || [];

  if (links.length === 0) return null;

  return (
    <section
      id="social-links"
      style={{
        padding: 'var(--space-12) 0',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-base)',
      }}
    >
      <div className="container" style={{ textAlign: 'center', maxWidth: '640px' }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-2)' }}>
          {title || 'Connect & Follow'}
        </h2>
        {subtitle && (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
            {subtitle}
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'center' }}>
          {links.map((item) => (
            <a
              key={item.id || item.platform}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-4)',
                textTransform: 'capitalize',
              }}
            >
              <span>🔗</span>
              <span>{item.label || item.platform}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
