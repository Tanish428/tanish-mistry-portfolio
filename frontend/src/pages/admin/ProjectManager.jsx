import { useState, useEffect } from 'react';
import * as adminApi from '../../api/adminApi.js';
import Modal from '../../components/admin/Modal.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import Toast from '../../components/admin/Toast.jsx';
import ImagePickerModal from '../../components/admin/ImagePickerModal.jsx';

const PROJECT_CATEGORIES = ['web', 'mobile', 'desktop', 'backend', 'fullstack', 'other'];

const initialProjectState = {
  title: '',
  slug: '',
  category: 'web',
  shortDescription: '',
  description: '',
  technologies: '',
  thumbnailUrl: '',
  thumbnailAlt: '',
  liveDemoUrl: '',
  repositoryUrl: '',
  role: '',
  keyFeatures: '',
  isFeatured: false,
  isVisible: true,
};

export default function ProjectManager() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleSelectThumbnail = (asset) => {
    setFormData((prev) => ({
      ...prev,
      thumbnailUrl: asset.secureUrl,
      thumbnailAlt: prev.thumbnailAlt || asset.altText || prev.title || '',
    }));
  };

  const [formData, setFormData] = useState(initialProjectState);

  const loadProjects = async () => {
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (categoryFilter) params.category = categoryFilter;

      const data = await adminApi.getAdminProjects(params);
      setProjects(data?.projects || []);
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (categoryFilter) params.category = categoryFilter;

    adminApi
      .getAdminProjects(params)
      .then((data) => {
        if (!isMounted) return;
        setProjects(data?.projects || []);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load projects');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [search, categoryFilter]);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData(initialProjectState);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (proj) => {
    setEditingProject(proj);
    setFormData({
      title: proj.title || '',
      slug: proj.slug || '',
      category: proj.category || 'web',
      shortDescription: proj.shortDescription || '',
      description: proj.description || '',
      technologies: Array.isArray(proj.technologies) ? proj.technologies.join(', ') : '',
      thumbnailUrl: proj.thumbnailUrl || '',
      thumbnailAlt: proj.thumbnailAlt || '',
      liveDemoUrl: proj.liveDemoUrl || '',
      repositoryUrl: proj.repositoryUrl || '',
      role: proj.role || '',
      keyFeatures: Array.isArray(proj.keyFeatures) ? proj.keyFeatures.join('\n') : '',
      isFeatured: Boolean(proj.isFeatured),
      isVisible: proj.isVisible !== false,
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

    // Prepare tech array and features array
    const techArray = formData.technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const featuresArray = formData.keyFeatures
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      technologies: techArray.length > 0 ? techArray : ['Web'],
      keyFeatures: featuresArray,
    };

    try {
      if (editingProject) {
        await adminApi.updateAdminProject(editingProject.id, payload);
        setToast({ type: 'success', message: 'Project updated successfully!' });
      } else {
        await adminApi.createAdminProject(payload);
        setToast({ type: 'success', message: 'Project created in draft!' });
      }
      setIsModalOpen(false);
      loadProjects();
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
      await adminApi.deleteAdminProject(deleteTarget.id);
      setToast({ type: 'success', message: 'Project deleted.' });
      setDeleteTarget(null);
      loadProjects();
    } catch (err) {
      setError(err.message || 'Delete failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (proj) => {
    try {
      if (proj.isPublished) {
        await adminApi.unpublishAdminProject(proj.id);
        setToast({ type: 'info', message: `Unpublished "${proj.title}".` });
      } else {
        await adminApi.publishAdminProject(proj.id);
        setToast({ type: 'success', message: `Published "${proj.title}" to live site!` });
      }
      loadProjects();
    } catch (err) {
      setError(err.message || 'Publish toggle failed');
    }
  };

  const handleToggleFeatured = async (proj) => {
    try {
      await adminApi.setAdminProjectFeatured(proj.id, !proj.isFeatured);
      setToast({ type: 'info', message: `Updated featured status for "${proj.title}".` });
      loadProjects();
    } catch (err) {
      setError(err.message || 'Featured toggle failed');
    }
  };

  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const reordered = [...projects];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const payload = reordered.map((item, idx) => ({
      id: item.id,
      displayOrder: idx,
    }));

    try {
      await adminApi.reorderAdminProjects(payload);
      setProjects(reordered);
      setToast({ type: 'success', message: 'Projects reordered.' });
    } catch (err) {
      setError(err.message || 'Reorder failed');
      loadProjects();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header & Controls */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-1)' }}>
            Projects Catalog
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            Manage portfolio projects, slugs, tech stacks, ordering, and live statuses.
          </p>
        </div>
        <button type="button" onClick={handleOpenCreate} className="btn btn-primary">
          + Add New Project
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center', padding: 'var(--space-4)' }}>
        <div style={{ flex: '1 1 240px' }}>
          <input
            type="search"
            placeholder="Search projects by title, tech, or summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ minWidth: '160px' }}>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {PROJECT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div role="alert" className="card" style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: 'var(--space-4)' }}>
          {error}
        </div>
      )}

      {/* Projects List Table */}
      {isLoading ? (
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }} role="status">
          Loading projects catalog...
        </div>
      ) : projects.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            No projects found.
          </p>
          <button type="button" onClick={handleOpenCreate} className="btn btn-primary">
            Create First Project
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
                <th style={{ padding: 'var(--space-3) var(--space-4)', width: '60px' }}>Order</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Title & Slug</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Category</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Status</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Featured</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((proj, idx) => (
                <tr key={proj.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, -1)}
                        disabled={idx === 0}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, fontSize: '10px' }}
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 1)}
                        disabled={idx === projects.length - 1}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, fontSize: '10px' }}
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>{proj.title}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>/{proj.slug}</div>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', textTransform: 'capitalize' }}>
                    <span className="badge badge-info">{proj.category}</span>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(proj)}
                      className={`badge ${proj.isPublished ? 'badge-success' : 'badge-warning'}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {proj.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(proj)}
                      className={`badge ${proj.isFeatured ? 'badge-success' : 'badge-warning'}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {proj.isFeatured ? '★ Featured' : '☆ Normal'}
                    </button>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                      <button type="button" onClick={() => handleOpenEdit(proj)} className="btn btn-outline" style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-2)' }}>
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(proj)}
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

      {/* Create / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProject ? 'Edit Project' : 'Add New Project'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <label htmlFor="proj-title">Project Title *</label>
              <input id="proj-title" name="title" type="text" value={formData.title} onChange={handleFormChange} required />
            </div>

            <div>
              <label htmlFor="proj-slug">Project Slug (leave blank to auto-generate)</label>
              <input id="proj-slug" name="slug" type="text" value={formData.slug} onChange={handleFormChange} placeholder="my-awesome-project" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <label htmlFor="proj-category">Category *</label>
              <select id="proj-category" name="category" value={formData.category} onChange={handleFormChange}>
                {PROJECT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="proj-role">Role</label>
              <input id="proj-role" name="role" type="text" value={formData.role} onChange={handleFormChange} placeholder="Lead Engineer, Creator, etc." />
            </div>
          </div>

          <div>
            <label htmlFor="proj-short">Short Description *</label>
            <input id="proj-short" name="shortDescription" type="text" value={formData.shortDescription} onChange={handleFormChange} required />
          </div>

          <div>
            <label htmlFor="proj-desc">Detailed Description</label>
            <textarea id="proj-desc" name="description" rows={4} value={formData.description} onChange={handleFormChange} />
          </div>

          <div>
            <label htmlFor="proj-tech">Technologies (comma-separated) *</label>
            <input id="proj-tech" name="technologies" type="text" value={formData.technologies} onChange={handleFormChange} placeholder="React, Node.js, MongoDB" required />
          </div>

          <div>
            <label htmlFor="proj-features">Key Features (one per line)</label>
            <textarea id="proj-features" name="keyFeatures" rows={3} value={formData.keyFeatures} onChange={handleFormChange} placeholder="Responsive layout&#10;CSRF protection&#10;Dark mode support" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <label htmlFor="proj-demo">Live Demo URL (HTTPS)</label>
              <input id="proj-demo" name="liveDemoUrl" type="url" value={formData.liveDemoUrl} onChange={handleFormChange} placeholder="https://..." />
            </div>

            <div>
              <label htmlFor="proj-repo">Repository URL (HTTPS)</label>
              <input id="proj-repo" name="repositoryUrl" type="url" value={formData.repositoryUrl} onChange={handleFormChange} placeholder="https://github.com/..." />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                <label htmlFor="proj-thumb">Thumbnail URL (HTTPS)</label>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="btn btn-outline"
                  style={{ fontSize: '11px', padding: '2px var(--space-2)' }}
                >
                  🖼 Choose from Library
                </button>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                {formData.thumbnailUrl && (
                  <img
                    src={formData.thumbnailUrl}
                    alt="Preview"
                    style={{ width: '40px', height: '28px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--color-primary)' }}
                  />
                )}
                <input
                  id="proj-thumb"
                  name="thumbnailUrl"
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={handleFormChange}
                  placeholder="https://res.cloudinary.com/..."
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="proj-alt">Thumbnail Alt Text</label>
              <input id="proj-alt" name="thumbnailAlt" type="text" value={formData.thumbnailAlt} onChange={handleFormChange} placeholder="Preview of the project" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-2)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
              <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleFormChange} style={{ width: 'auto' }} />
              <span>Featured Project</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
              <input type="checkbox" name="isVisible" checked={formData.isVisible} onChange={handleFormChange} style={{ width: 'auto' }} />
              <span>Visible on Portfolio</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn btn-primary">
              {isSaving ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"?`}
        isProcessing={isSaving}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <ImagePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectImage={handleSelectThumbnail}
        title="Select Project Thumbnail from Media Library"
      />
    </div>
  );
}
