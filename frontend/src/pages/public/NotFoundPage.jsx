import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div
      className="card"
      style={{
        maxWidth: '500px',
        margin: 'var(--space-12) auto',
        textAlign: 'center',
        padding: 'var(--space-10) var(--space-6)',
      }}
    >
      <span className="badge badge-warning" style={{ marginBottom: 'var(--space-3)' }}>
        HTTP 404
      </span>
      <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-3)' }}>Page Not Found</h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        Return to Home
      </Link>
    </div>
  );
}
