import { Link } from 'react-router-dom';

export default function AdminDashboardPage() {
  const modules = [
    { title: 'Profile Information', desc: 'Biographies, titles, location & contact info', tag: 'Phase 4' },
    { title: 'Projects Catalog', desc: 'Projects showcase, slugs, media & reordering', tag: 'Phase 4' },
    { title: 'Skills & Categories', desc: 'Technical proficiencies & categorized groupings', tag: 'Phase 4' },
    { title: 'Experience & Education', desc: 'Career history and academic credentials', tag: 'Phase 4' },
    { title: 'Cloudinary Media Library', desc: 'Upload, inspect and delete image assets', tag: 'Phase 5' },
    { title: 'Dynamic Homepage Sections', desc: 'Reorder sections, toggle visibility & config', tag: 'Phase 5' },
    { title: 'Contact Messages Inbox', desc: 'Review submissions, mark read & archive', tag: 'Phase 6' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <span className="badge badge-warning" style={{ marginBottom: 'var(--space-2)' }}>
            Phase 1 CMS Shell
          </span>
          <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)' }}>Administrator Dashboard</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            Overview of content management modules. Full authentication guard activates in Phase 2.
          </p>
        </div>
        <Link to="/" className="btn btn-outline" style={{ fontSize: 'var(--text-sm)' }}>
          Exit to Public Site
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        {modules.map((mod) => (
          <div key={mod.title} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)' }}>{mod.title}</h2>
                <span className="badge badge-info">{mod.tag}</span>
              </div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>{mod.desc}</p>
            </div>
            <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Status: Planned for {mod.tag}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
