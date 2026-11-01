import { getBrandLogoSrc } from '../../utils/brandIcons.js';

/**
 * Reusable Brand Logo component displaying official, authentic vector SVGs
 * with original brand colors, natural aspect ratios, and full accessibility.
 */
export default function BrandLogo({
  name = '',
  slug = '',
  iconName = '',
  size = 24,
  className = '',
  style = {},
  alt = '',
  ariaHidden = true,
}) {
  const logoSrc = getBrandLogoSrc(name, slug, iconName);
  const displayName = name || iconName || slug || 'Technology';
  const resolvedAlt = alt || `${displayName} logo`;

  const sizeStyle = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    objectFit: 'contain',
    display: 'inline-block',
    verticalAlign: 'middle',
    flexShrink: 0,
    ...style,
  };

  if (logoSrc) {
    return (
      <img
        src={logoSrc}
        alt={resolvedAlt}
        aria-hidden={ariaHidden ? 'true' : undefined}
        className={`brand-logo-img ${className}`.trim()}
        style={sizeStyle}
        loading="eager"
      />
    );
  }

  // Fallback neutral SVG tech icon if no brand mark is registered
  return (
    <span
      className={`brand-logo-fallback ${className}`.trim()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        borderRadius: '6px',
        backgroundColor: 'rgba(185, 77, 255, 0.1)',
        color: '#B94DFF',
        fontSize: typeof size === 'number' ? `${Math.max(10, Math.floor(size * 0.45))}px` : '12px',
        fontWeight: 'bold',
        fontFamily: 'var(--font-mono, monospace)',
        border: '1px solid rgba(185, 77, 255, 0.25)',
        flexShrink: 0,
        ...style,
      }}
      aria-label={resolvedAlt}
      aria-hidden={ariaHidden ? 'true' : undefined}
      title={displayName}
    >
      <svg
        width="65%"
        height="65%"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    </span>
  );
}
