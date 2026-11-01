import { useState, useEffect } from 'react';
import * as adminApi from '../../api/adminApi.js';
import Modal from '../../components/admin/Modal.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import Toast from '../../components/admin/Toast.jsx';

export default function SkillCategoryManager() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isVisible: true,
  });

  const loadCategories = async () => {
    try {
      const data = await adminApi.getAdminSkillCategories();
      setCategories(data?.categories || []);
    } catch (err) {
      setError(err.message || 'Failed to load skill categories');
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
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load skill categories');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '', isVisible: true });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      isVisible: cat.isVisible !== false,
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
      description: formData.description?.trim() || null,
      isVisible: formData.isVisible,
    };
    if (formData.slug?.trim()) {
      payload.slug = formData.slug.trim().toLowerCase();
    }

    try {
      if (editingCategory) {
        await adminApi.updateAdminSkillCategory(editingCategory.id, payload);
        setToast({ type: 'success', message: 'Category updated successfully!' });
      } else {
        await adminApi.createAdminSkillCategory(payload);
        setToast({ type: 'success', message: 'Category created successfully!' });
      }
      setIsModalOpen(false);
      loadCategories();
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
      await adminApi.deleteAdminSkillCategory(deleteTarget.id);
      setToast({ type: 'success', message: 'Category deleted.' });
      setDeleteTarget(null);
      loadCategories();
    } catch (err) {
      setError(err.message || 'Cannot delete category (it may still contain skills)');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (cat) => {
    try {
      if (cat.isPublished) {
        await adminApi.unpublishAdminSkillCategory(cat.id);
        setToast({ type: 'info', message: `Unpublished "${cat.name}".` });
      } else {
        await adminApi.publishAdminSkillCategory(cat.id);
        setToast({ type: 'success', message: `Published "${cat.name}".` });
      }
      loadCategories();
    } catch (err) {
      setError(err.message || 'Publish toggle failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-1)' }}>
            Skill Categories
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            Group your skills into structured categories like Frontend, Backend, DevOps, etc.
          </p>
        </div>
        <button type="button" onClick={handleOpenCreate} className="btn btn-primary">
          + Add New Category
        </button>
      </div>

      {error && (
        <div role="alert" className="card" style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: 'var(--space-4)' }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }} role="status">
          Loading skill categories...
        </div>
      ) : categories.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            No skill categories created yet.
          </p>
          <button type="button" onClick={handleOpenCreate} className="btn btn-primary">
            Create First Category
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Category Name</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Slug</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Status</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>{cat.name}</div>
                    {cat.description && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{cat.description}</div>}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)' }}>
                    <code>{cat.slug}</code>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(cat)}
                      className={`badge ${cat.isPublished ? 'badge-success' : 'badge-warning'}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {cat.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                      <button type="button" onClick={() => handleOpenEdit(cat)} className="btn btn-outline" style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-2)' }}>
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(cat)}
                        className="btn"
                        style={{
                          fontSize: 'var(--text-xs)',
                          padding: 'var(--space-1) var(--space-2)',
                          backgroundColor: 'var(--color-danger-bg)',
                          color: 'var(--color-danger)',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Category Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCategory ? 'Edit Category' : 'Create Category'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label htmlFor="cat-name">Category Name * (2–60 chars)</label>
            <input id="cat-name" name="name" type="text" value={formData.name} onChange={handleFormChange} placeholder="Frontend Frameworks" required />
          </div>

          <div>
            <label htmlFor="cat-slug">Category Slug (leave blank to auto-generate)</label>
            <input id="cat-slug" name="slug" type="text" value={formData.slug} onChange={handleFormChange} placeholder="frontend-frameworks" />
          </div>

          <div>
            <label htmlFor="cat-desc">Description</label>
            <textarea id="cat-desc" name="description" rows={3} value={formData.description} onChange={handleFormChange} placeholder="Client-side rendering libraries and state tools." />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
            <input type="checkbox" name="isVisible" checked={formData.isVisible} onChange={handleFormChange} style={{ width: 'auto' }} />
            <span>Category Visible on Portfolio</span>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={isSaving} className="btn btn-primary">
              {isSaving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deleteTarget?.name}"? Deletion will be rejected if skills are still assigned to this category.`}
        isProcessing={isSaving}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
