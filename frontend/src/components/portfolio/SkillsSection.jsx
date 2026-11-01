import { useState } from 'react';
import BrandLogo from '../common/BrandLogo';

export default function SkillsSection({ section }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { title, subtitle, content } = section || {};
  const categories = content?.categories || [];
  const skills = content?.skills || [];

  if (skills.length === 0) return null;

  // Filter out any unpublished categories or empty categories
  const groupedSkills = {};
  skills.forEach((skill) => {
    const catId = typeof skill.category === 'object' ? skill.category?.id || skill.category?._id : skill.category;
    if (catId) {
      if (!groupedSkills[catId]) {
        groupedSkills[catId] = [];
      }
      groupedSkills[catId].push(skill);
    }
  });

  const activeCategories = categories.filter((cat) => {
    const catSkills = groupedSkills[cat.id] || groupedSkills[cat._id] || [];
    return catSkills.length > 0;
  });

  const displayCategories = selectedCategory === 'all'
    ? activeCategories
    : activeCategories.filter((c) => (c.id || c._id || c.slug) === selectedCategory);

  return (
    <section
      id="skills"
      style={{
        position: 'relative',
        padding: 'var(--space-20) 0',
        backgroundColor: '#090812',
        borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 'var(--weight-bold)' }}>
              // 03. TECHNICAL CAPABILITIES
            </span>
          </div>
          <h2 className="gradient-heading" style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 'var(--weight-extrabold)', letterSpacing: '-0.02em', margin: 0 }}>
            {title || 'Technical Skills'}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', maxWidth: '640px', margin: 'var(--space-3) auto 0' }}>
            {subtitle || 'Core programming languages, application frameworks, databases, and engineering workflows.'}
          </p>

          {/* Filter Pills */}
          <div className="skills-filter-row">
            <button
              type="button"
              className={`skills-filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Domains ({skills.length})
            </button>
            {activeCategories.map((cat) => {
              const catKey = cat.id || cat._id || cat.slug;
              return (
                <button
                  key={catKey}
                  type="button"
                  className={`skills-filter-btn ${selectedCategory === catKey ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(catKey)}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Blocks */}
        <div className="skills-categories-layout">
          {displayCategories.map((cat) => {
            const catSkills = groupedSkills[cat.id] || groupedSkills[cat._id] || [];

            return (
              <div key={cat.id || cat.slug} className="skills-category-card">
                <div className="skills-category-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span className="category-accent-dot" />
                    <h3 className="skills-category-title">{cat.name}</h3>
                  </div>
                  <span className="skills-count-pill">{catSkills.length} Technologies</span>
                </div>

                <div className="skills-cards-grid">
                  {catSkills.map((sk) => {
                    const level = sk.proficiencyLevel || (sk.proficiency >= 85 ? 'advanced' : sk.proficiency >= 65 ? 'intermediate' : 'proficient');

                    return (
                      <div key={sk.id || sk.name} className="skill-tech-item">
                        <div className="skill-icon-badge">
                          <BrandLogo
                            name={sk.name}
                            slug={sk.slug}
                            iconName={sk.iconName}
                            size={44}
                            alt={`${sk.name} brand logo`}
                            ariaHidden={false}
                          />
                        </div>

                        <div className="skill-meta">
                          <span className="skill-tech-name">{sk.name}</span>
                          <span className={`skill-level-tag level-${level}`}>
                            {level}
                          </span>
                        </div>

                        {sk.proficiency !== undefined && sk.proficiency !== null && (
                          <div className="skill-bar-wrap">
                            <div className="skill-bar-track">
                              <div
                                className="skill-bar-fill"
                                style={{ width: `${Math.min(100, Math.max(0, sk.proficiency))}%` }}
                              />
                            </div>
                            <span className="skill-bar-pct">{sk.proficiency}%</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .skills-filter-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: var(--space-2);
          margin-top: var(--space-8);
        }

        .skills-filter-btn {
          background: rgba(21, 17, 40, 0.6);
          border: 1px solid rgba(168, 85, 247, 0.25);
          color: var(--color-text-secondary);
          font-size: var(--text-xs);
          font-weight: var(--weight-medium);
          padding: 0.4rem 0.9rem;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .skills-filter-btn:hover {
          color: #FFFFFF;
          border-color: rgba(185, 77, 255, 0.4);
          background: rgba(185, 77, 255, 0.1);
        }

        .skills-filter-btn.active {
          background: linear-gradient(135deg, rgba(185, 77, 255, 0.25) 0%, rgba(139, 66, 255, 0.25) 100%);
          border-color: var(--color-primary);
          color: #FFFFFF;
          box-shadow: 0 0 12px rgba(185, 77, 255, 0.3);
        }

        .skills-categories-layout {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }

        .skills-category-card {
          background: rgba(21, 17, 40, 0.7);
          border: 1px solid rgba(168, 85, 247, 0.25);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          backdrop-filter: blur(12px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
        }

        .skills-category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: var(--space-4);
          margin-bottom: var(--space-6);
          border-bottom: 1px solid rgba(168, 85, 247, 0.15);
        }

        .category-accent-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-primary);
          box-shadow: 0 0 8px var(--color-primary);
        }

        .skills-category-title {
          font-size: var(--text-lg);
          font-weight: var(--weight-bold);
          color: #F8F7FC;
          margin: 0;
        }

        .skills-count-pill {
          font-size: var(--text-xs);
          color: #d48aff;
          background: rgba(185, 77, 255, 0.1);
          border: 1px solid rgba(185, 77, 255, 0.25);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          font-weight: var(--weight-medium);
        }

        .skills-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: var(--space-4);
        }

        .skill-tech-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          background: rgba(27, 22, 51, 0.65);
          border: 1px solid rgba(168, 85, 247, 0.2);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          transition: all var(--transition-normal);
        }

        .skill-tech-item:hover {
          background: rgba(35, 28, 66, 0.85);
          border-color: rgba(185, 77, 255, 0.45);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4), 0 0 15px rgba(185, 77, 255, 0.15);
          transform: translateY(-2px);
        }

        .skill-icon-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: var(--radius-lg);
          background: rgba(16, 13, 32, 0.75);
          border: 1px solid rgba(168, 85, 247, 0.25);
          padding: 4px;
          margin-bottom: var(--space-2);
          transition: all var(--transition-fast);
        }

        .skill-tech-item:hover .skill-icon-badge {
          border-color: rgba(185, 77, 255, 0.5);
          background: rgba(27, 22, 51, 0.95);
          box-shadow: 0 0 16px rgba(185, 77, 255, 0.25);
        }

        .skill-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-2);
        }

        .skill-tech-name {
          font-size: var(--text-sm);
          font-weight: var(--weight-semibold);
          color: #F8F7FC;
        }

        .skill-level-tag {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          font-weight: var(--weight-semibold);
        }

        .skill-level-tag.level-advanced {
          background: rgba(185, 77, 255, 0.15);
          color: #d48aff;
          border: 1px solid rgba(185, 77, 255, 0.3);
        }

        .skill-level-tag.level-intermediate {
          background: rgba(147, 51, 234, 0.15);
          color: #c084fc;
          border: 1px solid rgba(147, 51, 234, 0.3);
        }

        .skill-level-tag.level-beginner,
        .skill-level-tag.level-proficient {
          background: rgba(16, 185, 129, 0.12);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .skill-bar-wrap {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-top: 2px;
        }

        .skill-bar-track {
          flex: 1;
          height: 4px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .skill-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #8B42FF 0%, #B94DFF 100%);
          border-radius: var(--radius-full);
          box-shadow: 0 0 6px rgba(185, 77, 255, 0.5);
        }

        .skill-bar-pct {
          font-size: 0.65rem;
          color: var(--color-text-muted);
          font-family: var(--font-mono);
          min-width: 26px;
          text-align: right;
        }
      `}</style>
    </section>
  );
}
