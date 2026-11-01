import BrandLogo from '../common/BrandLogo';

export default function SocialLinksSection({ section }) {
  const { title, subtitle, content } = section || {};
  const links = content?.socialLinks || [];

  if (links.length === 0) return null;

  return (
    <section
      id="social-links"
      style={{
        position: 'relative',
        padding: 'var(--space-16) 0',
        backgroundColor: '#090812',
        borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
      }}
    >
      <div className="container" style={{ textAlign: 'center', maxWidth: '720px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 'var(--weight-bold)' }}>
            // SOCIAL PRESENCE
          </span>
        </div>
        <h2 className="gradient-heading" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-2)' }}>
          {title || 'Connect & Follow'}
        </h2>
        {subtitle && (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-8)' }}>
            {subtitle}
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', justifyContent: 'center' }}>
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
                padding: 'var(--space-3) var(--space-6)',
                borderRadius: 'var(--radius-full)',
                borderColor: 'rgba(168, 85, 247, 0.3)',
                textTransform: 'capitalize',
                fontSize: 'var(--text-sm)',
              }}
            >
              <BrandLogo name={item.platform || item.label} size={22} ariaHidden={true} />
              <span>{item.label || item.platform}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
