export default function HeroSection({ section }) {
  const { title, subtitle, content } = section || {};
  if (!content) return null;

  const {
    fullName,
    professionalTitle,
    shortIntroduction,
    profileImageUrl,
    profileImageAlt,
    availabilityStatus,
    primaryCtaLabel,
    primaryCtaUrl,
    secondaryCtaLabel,
    secondaryCtaUrl,
  } = content;

  return (
    <section
      id="hero"
      style={{
        padding: 'var(--space-16) 0 var(--space-12)',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-base)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 'var(--space-6)',
          maxWidth: '800px',
        }}
      >
        {availabilityStatus && (
          <span className="badge badge-success" style={{ textTransform: 'capitalize' }}>
            ● {availabilityStatus.replace(/_/g, ' ')}
          </span>
        )}

        {profileImageUrl && (
          <div
            style={{
              width: '128px',
              height: '128px',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              border: '3px solid var(--color-border)',
            }}
          >
            <img
              src={profileImageUrl}
              alt={profileImageAlt || fullName || 'Profile photo'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        <div>
          <h1
            style={{
              fontSize: 'var(--text-4xl)',
              fontWeight: 'var(--weight-bold)',
              letterSpacing: '-0.03em',
              marginBottom: 'var(--space-2)',
            }}
          >
            {fullName || title || 'Developer Portfolio'}
          </h1>
          {professionalTitle && (
            <p
              style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--weight-medium)',
                color: 'var(--color-primary)',
                marginBottom: 'var(--space-4)',
              }}
            >
              {professionalTitle}
            </p>
          )}
          {(shortIntroduction || subtitle) && (
            <p
              style={{
                fontSize: 'var(--text-lg)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
              }}
            >
              {shortIntroduction || subtitle}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
          {primaryCtaLabel && primaryCtaUrl && (
            <a href={primaryCtaUrl} className="btn btn-primary">
              {primaryCtaLabel}
            </a>
          )}
          {secondaryCtaLabel && secondaryCtaUrl && (
            <a href={secondaryCtaUrl} className="btn btn-outline">
              {secondaryCtaLabel}
            </a>
          )}
          {!primaryCtaLabel && (
            <a href="#projects" className="btn btn-primary">
              Explore Projects
            </a>
          )}
          {!secondaryCtaLabel && (
            <a href="#contact" className="btn btn-outline">
              Get in Touch
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
