import { useState, useEffect } from 'react';
import * as adminApi from '../../api/adminApi.js';
import Modal from '../../components/admin/Modal.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import Toast from '../../components/admin/Toast.jsx';

const PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

export default function SkillManager() {
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: '',
    proficiencyLevel: 'intermediate',
    iconName: '',
    description: '',
    isFeatured: false,
    isVisible: true,
  });

  const loadSkills = async () => {
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await adminApi.getAdminSkills(params);
      setSkills(data?.skills || []);
    } catch (err) {
      setError(err.message || 'Failed to load skills');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    adminApi
      .getAdminSkillCategories()
      .then((data) => {
        if (!isMounted) return;
        setCategories(data?.categories || []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load skill categories');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (searchQuery.trim()) params.search = searchQuery.trim();

    adminApi
      .getAdminSkills(params)
      .then((data) => {
        if (!isMounted) return;
        setSkills(data?.skills || []);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load skills');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, searchQuery]);

  const handleOpenCreate = () => {
    setEditingSkill(null);
    setFormData({
      name: '',
      slug: '',
      category: categories.length > 0 ? categories[0].id : '',
      proficiencyLevel: 'intermediate',
      iconName: '',
      description: '',
      isFeatured: false,
      isVisible: true,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (skill) => {
    setEditingSkill(skill);
    const catId = typeof skill.category === 'object' ? skill.category?.id : skill.category;
    setFormData({
      name: skill.name || '',
      slug: skill.slug || '',
      category: catId || '',
      proficiencyLevel: skill.proficiencyLevel || 'intermediate',
      iconName: skill.iconName || '',
      description: skill.description || '',
      isFeatured: skill.isFeatured || false,
      isVisible: skill.isVisible !== false,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      proficiencyLevel: formData.proficiencyLevel,
      description: formData.description?.trim() || null,
      iconName: formData.iconName?.trim() || null,
      isFeatured: formData.isFeatured,
      isVisible: formData.isVisible,
    };
    if (formData.slug?.trim()) {
      payload.slug = formData.slug.trim().toLowerCase();
    }

    try {
      if (editingSkill) {
        await adminApi.updateAdminSkill(editingSkill.id, payload);
        setToast({ type: 'success', message: 'Skill updated successfully!' });
      } else {
        await adminApi.createAdminSkill(payload);
        setToast({ type: 'success', message: 'Skill created successfully!' });
      }
      setIsModalOpen(false);
      loadSkills();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);
    try {
      await adminApi.deleteAdminSkill(deleteTarget.id);
      setToast({ type: 'success', message: 'Skill deleted successfully!' });
      setDeleteTarget(null);
      loadSkills();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete skill' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (skill) => {
    try {
      if (skill.isPublished) {
        await adminApi.unpublishAdminSkill(skill.id);
        setToast({ type: 'success', message: `Unpublished "${skill.name}"` });
      } else {
        await adminApi.publishAdminSkill(skill.id);
        setToast({ type: 'success', message: `Published "${skill.name}"` });
      }
      loadSkills();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to change publication status' });
    }
  };

  const handleToggleFeatured = async (skill) => {
    try {
      await adminApi.setAdminSkillFeatured(skill.id, !skill.isFeatured);
      setToast({ type: 'success', message: `Updated featured status for "${skill.name}"` });
      loadSkills();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to update featured status' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)' }}>
            Skill Management
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
            Manage technical proficiencies, tools, and frameworks displayed in your portfolio.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="btn btn-primary"
          disabled={categories.length === 0}
          title={categories.length === 0 ? 'Create a category first' : 'Add new skill'}
        >
          + Add Skill
        </button>
      </div>

      {categories.length === 0 && !isLoading && (
        <div className="card" style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-warning-subtle)', borderColor: 'var(--color-warning)' }}>
          <p style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)' }}>
            ⚠️ No skill categories found. You must create at least one category in <strong>Skill Categories</strong> before creating skills.
          </p>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 200px' }}>
          <input
            type="text"
            className="input"
            placeholder="Search skills by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ flex: '0 1 220px' }}>
          <select
            className="input"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Skills Table / List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Loading skills...
          </div>
        ) : skills.length === 0 ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No skills found matching your filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Name</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Category</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Level</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Featured</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Status</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((skill) => {
                  const catName = typeof skill.category === 'object' ? skill.category?.name : 'Unknown';
                  return (
                    <tr
                      key={skill.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background-color var(--transition-fast)',
                      }}
                    >
                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 'var(--weight-medium)' }}>
                        <div>{skill.name}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>/{skill.slug}</div>
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)' }}>
                        {catName}
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: 'var(--space-1) var(--space-2)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 'var(--weight-medium)',
                            backgroundColor: 'var(--color-bg-subtle)',
                            color: 'var(--color-text-primary)',
                            textTransform: 'capitalize',
                          }}
                        >
                          {skill.proficiencyLevel}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(skill)}
                          className="btn btn-outline"
                          style={{
                            padding: 'var(--space-1) var(--space-2)',
                            fontSize: 'var(--text-xs)',
                            borderColor: skill.isFeatured ? 'var(--color-primary)' : 'var(--color-border)',
                            color: skill.isFeatured ? 'var(--color-primary)' : 'var(--color-text-muted)',
                          }}
                        >
                          {skill.isFeatured ? '★ Featured' : '☆ Standard'}
                        </button>
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(skill)}
                          className="btn btn-outline"
                          style={{
                            padding: 'var(--space-1) var(--space-2)',
                            fontSize: 'var(--text-xs)',
                            backgroundColor: skill.isPublished ? 'var(--color-success-subtle)' : 'var(--color-bg-subtle)',
                            color: skill.isPublished ? 'var(--color-success)' : 'var(--color-text-muted)',
                            borderColor: skill.isPublished ? 'var(--color-success)' : 'var(--color-border)',
                          }}
                        >
                          {skill.isPublished ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(skill)}
                            className="btn btn-outline"
                            style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)' }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(skill)}
                            className="btn btn-outline"
                            style={{
                              padding: 'var(--space-1) var(--space-2)',
                              fontSize: 'var(--text-xs)',
                              color: 'var(--color-danger)',
                              borderColor: 'var(--color-danger-subtle)',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSkill ? 'Edit Skill' : 'Create Skill'}
        maxWidth="540px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {error && (
            <div
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-danger-subtle)',
                color: 'var(--color-danger)',
                fontSize: 'var(--text-sm)',
              }}
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="skill-name" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}>
              Skill Name *
            </label>
            <input
              id="skill-name"
              name="name"
              type="text"
              required
              maxLength={60}
              className="input"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="e.g. React"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label htmlFor="skill-slug" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}>
              Custom Slug (optional)
            </label>
            <input
              id="skill-slug"
              name="slug"
              type="text"
              className="input"
              value={formData.slug}
              onChange={handleFormChange}
              placeholder="Auto-generated if left blank"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label htmlFor="skill-category" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}>
                Category *
              </label>
              <select
                id="skill-category"
                name="category"
                required
                className="input"
                value={formData.category}
                onChange={handleFormChange}
                style={{ width: '100%' }}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="skill-proficiency" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}>
                Proficiency Level *
              </label>
              <select
                id="skill-proficiency"
                name="proficiencyLevel"
                required
                className="input"
                value={formData.proficiencyLevel}
                onChange={handleFormChange}
                style={{ width: '100%' }}
              >
                {PROFICIENCY_LEVELS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="skill-iconName" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}>
              Icon Identifier (optional)
            </label>
            <input
              id="skill-iconName"
              name="iconName"
              type="text"
              className="input"
              value={formData.iconName}
              onChange={handleFormChange}
              placeholder="e.g. react or code"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label htmlFor="skill-description" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}>
              Description (optional)
            </label>
            <textarea
              id="skill-description"
              name="description"
              rows={3}
              maxLength={500}
              className="input"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Brief summary of experience with this skill..."
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-1)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleFormChange}
              />
              Featured Skill
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
              <input
                type="checkbox"
                name="isVisible"
                checked={formData.isVisible}
                onChange={handleFormChange}
              />
              Visible in Public Views
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn btn-primary">
              {isSaving ? 'Saving...' : editingSkill ? 'Update Skill' : 'Create Skill'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Skill"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"?`}
        isProcessing={isSaving}
      />
    </div>
  );
}
