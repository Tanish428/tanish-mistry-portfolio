import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHealthLive } from '../../api/health.js';

export default function HomePage() {
  const [healthStatus, setHealthStatus] = useState('checking');

  useEffect(() => {
    let isMounted = true;
    getHealthLive()
      .then((res) => {
        if (isMounted) {
          setHealthStatus(res?.data?.status === 'alive' ? 'connected' : 'unexpected-response');
        }
      })
      .catch(() => {
        if (isMounted) {
          setHealthStatus('disconnected');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <section className="card" style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)' }}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <span
            className={`badge ${
              healthStatus === 'connected'
                ? 'badge-success'
                : healthStatus === 'checking'
                ? 'badge-info'
                : 'badge-warning'
            }`}
          >
            Backend API: {healthStatus}
          </span>
        </div>
        <h1 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-4)' }}>
          Developer Portfolio & CMS
        </h1>
        <p
          style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-secondary)',
            maxWidth: '640px',
            margin: '0 auto var(--space-6)',
          }}
        >
          A modular MERN stack personal portfolio powered by React 19, Express 5, and MongoDB.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <Link to="/projects/personal-portfolio" className="btn btn-primary">
            View Sample Project
          </Link>
          <Link to="/admin/login" className="btn btn-outline">
            Go to Admin Login
          </Link>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
        <div className="card">
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>Public Portfolio</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            Dynamic, performant portfolio pages rendering content directly from the CMS backend.
          </p>
          <Link to="/projects/personal-portfolio" style={{ color: 'var(--color-primary)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>
            Explore project detail →
          </Link>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>Administrator CMS</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            Private management portal with JWT HttpOnly cookies and CSRF protection.
          </p>
          <Link to="/admin" style={{ color: 'var(--color-primary)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>
            Access dashboard skeleton →
          </Link>
        </div>
      </section>
    </div>
  );
}
