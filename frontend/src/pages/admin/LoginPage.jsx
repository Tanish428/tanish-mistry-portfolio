import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div
      className="card"
      style={{
        maxWidth: '420px',
        margin: 'var(--space-8) auto',
        padding: 'var(--space-8)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <span className="badge badge-warning" style={{ marginBottom: 'var(--space-2)' }}>
          Phase 1 Auth Placeholder
        </span>
        <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>CMS Administrator Login</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          Sign in to manage your portfolio content.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div>
          <label htmlFor="admin-email">Email Address</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-2)' }}>
          Sign In
        </button>

        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          Full HttpOnly cookie session management and CSRF token exchange will be connected in Phase 2.
        </p>
      </form>

      <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
        <Link to="/" style={{ color: 'var(--color-primary)', fontSize: 'var(--text-sm)' }}>
          ← Back to Public Portfolio
        </Link>
      </div>
    </div>
  );
}
