import { useParams, Link } from 'react-router-dom';

export default function ProjectDetailPage() {
  const { slug } = useParams();

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Link to="/" style={{ color: 'var(--color-primary)', fontSize: 'var(--text-sm)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          ← Back to Portfolio
        </Link>
      </div>

      <span className="badge badge-info" style={{ marginBottom: 'var(--space-3)' }}>
        Project Detail Placeholder
      </span>

      <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>
        {slug ? slug.replace(/-/g, ' ').toUpperCase() : 'Project Detail'}
      </h1>

      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
        Slug identifier: <code>{slug}</code>
      </p>

      <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          In Phase 3, this route will fetch published project data via <code>GET /api/v1/portfolio/projects/{slug}</code> and render media galleries, tech stacks, and live links.
        </p>
      </div>
    </div>
  );
}
