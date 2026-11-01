import { useState, useEffect } from 'react';
import { getHomepageSections } from '../../api/portfolioApi.js';
import SectionRenderer from '../../components/portfolio/SectionRenderer.jsx';

export default function HomePage() {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleRetry = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getHomepageSections();
      setSections(data || []);
    } catch (err) {
      setError(err?.message || 'Unable to load portfolio sections. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    getHomepageSections()
      .then((data) => {
        if (isMounted) {
          setSections(data || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'Unable to load portfolio sections. Please try again.');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          color: 'var(--color-text-secondary)',
        }}
        role="status"
        aria-live="polite"
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-block',
              width: '36px',
              height: '36px',
              border: '3px solid var(--color-border)',
              borderTopColor: 'var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              marginBottom: 'var(--space-4)',
            }}
          />
          <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-medium)' }}>
            Loading portfolio...
          </p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center', maxWidth: '600px' }}>
        <div className="card" style={{ padding: 'var(--space-8)' }}>
          <span className="badge badge-danger" style={{ marginBottom: 'var(--space-3)' }}>
            Connection Error
          </span>
          <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>Unable to Load Portfolio</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
            {error}
          </p>
          <button type="button" onClick={handleRetry} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center', maxWidth: '640px' }}>
        <div className="card" style={{ padding: 'var(--space-10) var(--space-6)' }}>
          <span className="badge badge-info" style={{ marginBottom: 'var(--space-3)' }}>
            Portfolio Offline / Setup in Progress
          </span>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-3)' }}>Welcome to My Portfolio</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', marginBottom: 'var(--space-6)' }}>
            No homepage sections have been published yet. Content will appear here once published from the CMS.
          </p>
          <a href="/admin/login" className="btn btn-outline">
            Go to CMS Portal
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {sections.map((section) => (
        <SectionRenderer key={section.id || section.type} section={section} />
      ))}
    </div>
  );
}
