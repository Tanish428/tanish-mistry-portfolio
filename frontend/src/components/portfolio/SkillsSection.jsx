export default function SkillsSection({ section }) {
  const { title, subtitle, content } = section || {};
  const categories = content?.categories || [];
  const skills = content?.skills || [];

  if (skills.length === 0) return null;

  // Group skills by category ID or slug
  const groupedSkills = {};
  const uncategorizedSkills = [];

  skills.forEach((skill) => {
    const catId = typeof skill.category === 'object' ? skill.category?.id || skill.category?._id : skill.category;
    if (catId) {
      if (!groupedSkills[catId]) {
        groupedSkills[catId] = [];
      }
      groupedSkills[catId].push(skill);
    } else {
      uncategorizedSkills.push(skill);
    }
  });

  return (
    <section
      id="skills"
      style={{
        padding: 'var(--space-16) 0',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-surface)',
      }}
    >
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-2)' }}>
            {title || 'Technical Proficiencies'}
          </h2>
          {subtitle && (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)' }}>{subtitle}</p>
          )}
        </div>

        {categories.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-6)',
            }}
          >
            {categories.map((cat) => {
              const catSkills = groupedSkills[cat.id] || groupedSkills[cat._id] || [];
              if (catSkills.length === 0) return null;

              return (
                <div key={cat.id || cat.slug} className="card" style={{ padding: 'var(--space-6)' }}>
                  <h3
                    style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--weight-semibold)',
                      marginBottom: 'var(--space-4)',
                      paddingBottom: 'var(--space-2)',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    {cat.name}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {catSkills.map((sk) => (
                      <div key={sk.id || sk.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--color-text-primary)' }}>
                          {sk.name}
                        </span>
                        {sk.proficiency !== undefined && sk.proficiency !== null && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <div
                              style={{
                                width: '64px',
                                height: '6px',
                                backgroundColor: 'var(--color-bg-subtle)',
                                borderRadius: 'var(--radius-full)',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  width: `${Math.min(100, Math.max(0, sk.proficiency))}%`,
                                  height: '100%',
                                  backgroundColor: 'var(--color-primary)',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', minWidth: '28px', textAlign: 'right' }}>
                              {sk.proficiency}%
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', justifyContent: 'center' }}>
            {skills.map((sk) => (
              <span
                key={sk.id || sk.name}
                className="card"
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                }}
              >
                {sk.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
