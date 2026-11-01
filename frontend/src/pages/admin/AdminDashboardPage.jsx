import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth.js';
import { getHealthReady } from '../../api/health.js';

export default function AdminDashboardPage() {
  const { admin } = useAuth();
  const [dbStatus, setDbStatus] = useState('checking');

  useEffect(() => {
    let isMounted = true;
    getHealthReady()
      .then((res) => {
        if (isMounted) {
          setDbStatus(res?.data?.database === 'connected' ? 'connected' : 'degraded');
        }
      })
      .catch(() => {
        if (isMounted) {
          setDbStatus('error');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const modules = [
    { title: 'Profile Information', desc: 'Biographies, titles, location & contact info', tag: 'Active', link: '/admin/profile' },
    { title: 'Projects Catalog', desc: 'Projects showcase, slugs, media & reordering', tag: 'Active', link: '/admin/projects' },
    { title: 'Skills & Categories', desc: 'Technical proficiencies & categorized groupings', tag: 'Active', link: '/admin/skills' },
    { title: 'Experience & Education', desc: 'Career history and academic credentials', tag: 'Active', link: '/admin/experience' },
    { title: 'Cloudinary Media Library', desc: 'Upload, inspect and delete image assets', tag: 'Active', link: '/admin/media' },
    { title: 'Dynamic Homepage Sections', desc: 'Reorder sections, toggle visibility & config', tag: 'Active', link: '/admin/sections' },
    { title: 'Contact Messages Inbox', desc: 'Review submissions, mark read & archive', tag: 'Phase 6', link: null },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <span className="badge badge-success">Session Active</span>
            <span
              className={`badge ${
                dbStatus === 'connected'
                  ? 'badge-success'
                  : dbStatus === 'checking'
                  ? 'badge-info'
                  : 'badge-danger'
              }`}
            >
              Database: {dbStatus}
            </span>
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)' }}>
            Welcome back, {admin?.name || 'Administrator'}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            Signed in as <code>{admin?.email}</code>. Content Management System is authenticated and ready.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        {modules.map((mod) => (
          <div key={mod.title} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)' }}>{mod.title}</h2>
                <span className={`badge ${mod.tag === 'Active' ? 'badge-success' : 'badge-info'}`}>{mod.tag}</span>
              </div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>{mod.desc}</p>
            </div>
            <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                {mod.link ? 'Status: Operational' : 'Status: Planned for Phase 6'}
              </span>
              {mod.link && (
                <Link
                  to={mod.link}
                  className="btn btn-outline"
                  style={{ fontSize: '11px', padding: 'var(--space-1) var(--space-2)' }}
                >
                  Manage →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
