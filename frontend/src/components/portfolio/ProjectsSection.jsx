import { Link } from 'react-router-dom';

export default function ProjectsSection({ section }) {
  const { title, subtitle, content } = section || {};
  const projects = content?.projects || [];

  if (projects.length === 0) return null;

  return (
    <section
      id="projects"
      style={{
        padding: 'var(--space-16) 0',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-base)',
      }}
    >
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-2)' }}>
            {title || 'Featured Projects'}
          </h2>
          {subtitle && (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)' }}>{subtitle}</p>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 'var(--space-8)',
          }}
        >
          {projects.map((proj) => (
            <article
              key={proj.id || proj.slug}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                padding: 0,
                transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
              }}
            >
              {proj.thumbnailUrl ? (
                <div style={{ height: '190px', width: '100%', overflow: 'hidden', backgroundColor: 'var(--color-bg-subtle)' }}>
                  <img
                    src={proj.thumbnailUrl}
                    alt={proj.thumbnailAlt || proj.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    height: '140px',
                    width: '100%',
                    backgroundColor: 'var(--color-bg-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  No preview available
                </div>
              )}

              <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)' }}>
                    <Link
                      to={`/projects/${proj.slug}`}
                      style={{ color: 'var(--color-text-primary)', textDecoration: 'none' }}
                    >
                      {proj.title}
                    </Link>
                  </h3>
                  {proj.isFeatured && <span className="badge badge-info">Featured</span>}
                </div>

                <p
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--text-sm)',
                    lineHeight: 'var(--leading-normal)',
                    marginBottom: 'var(--space-4)',
                    flex: 1,
                  }}
                >
                  {proj.shortDescription}
                </p>

                {proj.technologies && proj.technologies.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginBottom: 'var(--space-4)' }}>
                    {proj.technologies.map((tech) => (
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

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'auto',
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: 'var(--space-3)',
                  }}
                >
                  <Link
                    to={`/projects/${proj.slug}`}
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--weight-semibold)',
                      color: 'var(--color-primary)',
                    }}
                  >
                    View Details →
                  </Link>

                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    {proj.liveDemoUrl && (
                      <a
                        href={proj.liveDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}
                      >
                        Live Demo ↗
                      </a>
                    )}
                    {proj.repositoryUrl && (
                      <a
                        href={proj.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}
                      >
                        GitHub ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
