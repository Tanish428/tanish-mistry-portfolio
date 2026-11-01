import { useState, useEffect } from 'react';
import * as adminApi from '../../api/adminApi.js';
import Modal from '../../components/admin/Modal.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import Toast from '../../components/admin/Toast.jsx';

const ALL_SECTION_TYPES = [
  { value: 'hero', label: 'Hero (Welcome & Main Banner)' },
  { value: 'about', label: 'About (Bio & Professional Overview)' },
  { value: 'projects', label: 'Projects (Showcase & Case Studies)' },
  { value: 'skills', label: 'Skills (Technical Proficiencies)' },
  { value: 'experience', label: 'Experience (Career Timeline)' },
  { value: 'education', label: 'Education (Academic Credentials)' },
  { value: 'social_links', label: 'Social Links (Online Presence)' },
  { value: 'contact', label: 'Contact (Inquiries & Messaging)' },
];

const ALLOWED_PROJECT_CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'web', label: 'Web' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'fullstack', label: 'Fullstack' },
  { value: 'backend', label: 'Backend' },
  { value: 'ai-ml', label: 'AI & Machine Learning' },
  { value: 'devops', label: 'DevOps & Cloud' },
  { value: 'other', label: 'Other' },
];

export default function HomepageSectionManager() {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    type: 'hero',
    title: '',
    subtitle: '',
    displayOrder: 0,
    isVisible: true,
    config: {},
  });

  const loadSections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAdminHomepageSections();
      const list = data?.sections || [];
      // Sort in ascending displayOrder
      list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      setSections(list);
    } catch (err) {
      setError(err?.message || 'Failed to load homepage sections');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    adminApi
      .getAdminHomepageSections()
      .then((data) => {
        if (!isMounted) return;
        const list = data?.sections || [];
        list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
        setSections(list);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || 'Failed to load homepage sections');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const existingTypes = new Set(sections.map((s) => s.type));
  const availableTypesToCreate = ALL_SECTION_TYPES.filter((t) => !existingTypes.has(t.value));

  const handleOpenCreate = () => {
    if (availableTypesToCreate.length === 0) return;
    const defaultType = availableTypesToCreate[0].value;
    setEditingSection(null);
    setFormData({
      type: defaultType,
      title: '',
      subtitle: '',
      displayOrder: sections.length,
      isVisible: true,
      config: getDefaultConfigForType(defaultType),
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sec) => {
    setEditingSection(sec);
    setFormData({
      type: sec.type,
      title: sec.title || '',
      subtitle: sec.subtitle || '',
      displayOrder: sec.displayOrder ?? 0,
      isVisible: sec.isVisible !== false,
      config: sec.config ? { ...sec.config } : getDefaultConfigForType(sec.type),
    });
    setError(null);
    setIsModalOpen(true);
  };

  const getDefaultConfigForType = (type) => {
    switch (type) {
      case 'hero':
        return {
          showProfileImage: true,
          showAvailability: true,
          primaryCtaLabel: 'View Projects',
          primaryCtaUrl: '#projects',
          secondaryCtaLabel: 'Contact Me',
          secondaryCtaUrl: '#contact',
        };
      case 'about':
        return {
          showProfileImage: true,
          maxTextLength: 1000,
        };
      case 'projects':
        return {
          featuredOnly: false,
          limit: 6,
          category: '',
        };
      case 'skills':
        return {
          featuredOnly: false,
          limit: 30,
        };
      case 'experience':
        return {
          limit: 10,
        };
      case 'education':
        return {
          limit: 10,
        };
      case 'social_links':
        return {
          limit: 10,
        };
      case 'contact':
        return {
          showContactForm: true,
          heading: "Let's Connect",
          supportingText: 'Feel free to reach out for collaborations, inquiries, or opportunities.',
        };
      default:
        return {};
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleConfigChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (editingSection) {
        const payload = {
          title: formData.title?.trim() || null,
          subtitle: formData.subtitle?.trim() || null,
          isVisible: formData.isVisible,
          config: formData.config,
        };
        await adminApi.updateAdminHomepageSection(editingSection.id, payload);
        setToast({ type: 'success', message: `Section "${formData.title || editingSection.type}" updated!` });
      } else {
        const payload = {
          type: formData.type,
          title: formData.title?.trim() || null,
          subtitle: formData.subtitle?.trim() || null,
          displayOrder: Number(formData.displayOrder) || 0,
          isVisible: formData.isVisible,
          config: formData.config,
        };
        await adminApi.createAdminHomepageSection(payload);
        setToast({ type: 'success', message: `Section "${formData.type}" created successfully!` });
      }

      setIsModalOpen(false);
      loadSections();
    } catch (err) {
      setError(err?.message || 'Operation failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);
    try {
      await adminApi.deleteAdminHomepageSection(deleteTarget.id);
      setToast({ type: 'success', message: `Section "${deleteTarget.type}" deleted.` });
      setDeleteTarget(null);
      loadSections();
    } catch (err) {
      setToast({ type: 'danger', message: err?.message || 'Failed to delete section' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (sec) => {
    try {
      if (sec.isPublished) {
        await adminApi.unpublishAdminHomepageSection(sec.id);
        setToast({ type: 'info', message: `Section "${sec.title || sec.type}" unpublished.` });
      } else {
        await adminApi.publishAdminHomepageSection(sec.id);
        setToast({ type: 'success', message: `Section "${sec.title || sec.type}" published!` });
      }
      loadSections();
    } catch (err) {
      setToast({ type: 'danger', message: err?.message || 'Failed to toggle publication' });
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const reordered = [...sections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    // Reassign sequential display orders: 0, 1, 2...
    const payload = reordered.map((sec, idx) => ({
      id: sec.id,
      displayOrder: idx,
    }));

    // Optimistic UI update
    setSections(reordered.map((sec, idx) => ({ ...sec, displayOrder: idx })));

    try {
      await adminApi.reorderAdminHomepageSections(payload);
      setToast({ type: 'success', message: 'Homepage section order updated!' });
    } catch (err) {
      setToast({ type: 'danger', message: err?.message || 'Failed to update section order' });
      loadSections(); // Rollback to server state
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)' }}>
            Homepage Sections Manager
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
            Configure dynamic homepage blocks, ordering, titles, CTA buttons, and publication state.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            type="button"
            onClick={loadSections}
            className="btn btn-outline"
            disabled={isLoading}
          >
            ↻ Refresh
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            disabled={availableTypesToCreate.length === 0}
            className="btn btn-primary"
            title={availableTypesToCreate.length === 0 ? 'All 8 section types are already created' : 'Add new section'}
          >
            + Add Section
          </button>
        </div>
      </div>

      {/* Sections Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Loading homepage sections...
          </div>
        ) : sections.length === 0 ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No homepage sections found in database. Click &quot;+ Add Section&quot; to configure your homepage blocks.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', width: '64px' }}>Order</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Type</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Title & Subtitle</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Status</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Visibility</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((sec, idx) => (
                  <tr
                    key={sec.id}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      transition: 'background-color var(--transition-fast)',
                    }}
                  >
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(idx, -1)}
                          disabled={idx === 0}
                          title="Move Up"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: idx === 0 ? 'var(--color-text-muted)' : 'var(--color-primary)',
                            cursor: idx === 0 ? 'default' : 'pointer',
                            fontSize: '12px',
                            lineHeight: 1,
                            padding: '2px',
                          }}
                        >
                          ▲
                        </button>
                        <span style={{ fontSize: '11px', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-secondary)' }}>
                          {sec.displayOrder ?? idx}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(idx, 1)}
                          disabled={idx === sections.length - 1}
                          title="Move Down"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: idx === sections.length - 1 ? 'var(--color-text-muted)' : 'var(--color-primary)',
                            cursor: idx === sections.length - 1 ? 'default' : 'pointer',
                            fontSize: '12px',
                            lineHeight: 1,
                            padding: '2px',
                          }}
                        >
                          ▼
                        </button>
                      </div>
                    </td>

                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: 'var(--space-1) var(--space-2)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 'var(--weight-bold)',
                          backgroundColor: 'var(--color-primary-subtle)',
                          color: 'var(--color-primary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {sec.type}
                      </span>
                    </td>

                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
                        {sec.title || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Default Title</span>}
                      </div>
                      {sec.subtitle && (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {sec.subtitle}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(sec)}
                        className="btn btn-outline"
                        style={{
                          padding: 'var(--space-1) var(--space-2)',
                          fontSize: 'var(--text-xs)',
                          backgroundColor: sec.isPublished ? 'var(--color-success-subtle)' : 'var(--color-bg-subtle)',
                          color: sec.isPublished ? 'var(--color-success)' : 'var(--color-text-muted)',
                          borderColor: sec.isPublished ? 'var(--color-success)' : 'var(--color-border)',
                        }}
                      >
                        {sec.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>

                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <span
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: sec.isVisible !== false ? 'var(--color-success)' : 'var(--color-text-muted)',
                        }}
                      >
                        {sec.isVisible !== false ? '● Visible' : '○ Hidden'}
                      </span>
                    </td>

                    <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(sec)}
                          className="btn btn-outline"
                          style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)' }}
                        >
                          Configure
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(sec)}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Configuration / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSection ? `Configure Section: ${editingSection.type.toUpperCase()}` : 'Add Homepage Section'}
        maxWidth="640px"
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

          {!editingSection && (
            <div>
              <label
                htmlFor="section-type"
                style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}
              >
                Section Type *
              </label>
              <select
                id="section-type"
                name="type"
                value={formData.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    type: newType,
                    config: getDefaultConfigForType(newType),
                  }));
                }}
                className="input"
                style={{ width: '100%' }}
              >
                {availableTypesToCreate.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label
              htmlFor="section-title"
              style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}
            >
              Section Title (optional, max 100 chars)
            </label>
            <input
              id="section-title"
              name="title"
              type="text"
              maxLength={100}
              value={formData.title}
              onChange={handleFormChange}
              placeholder="e.g. Featured Projects / About Me"
              className="input"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label
              htmlFor="section-subtitle"
              style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}
            >
              Section Subtitle (optional, max 300 chars)
            </label>
            <textarea
              id="section-subtitle"
              name="subtitle"
              rows={2}
              maxLength={300}
              value={formData.subtitle}
              onChange={handleFormChange}
              placeholder="Short supporting description under the heading..."
              className="input"
              style={{ width: '100%' }}
            />
          </div>

          {/* Type-Specific Structured Config Controls */}
          <div
            style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
              {formData.type} Specific Configuration
            </div>

            {formData.type === 'hero' && (
              <>
                <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.config?.showProfileImage ?? true}
                      onChange={(e) => handleConfigChange('showProfileImage', e.target.checked)}
                    />
                    Display Avatar / Hero Image
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.config?.showAvailability ?? true}
                      onChange={(e) => handleConfigChange('showAvailability', e.target.checked)}
                    />
                    Display Availability Badge
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                      Primary CTA Label
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formData.config?.primaryCtaLabel || ''}
                      onChange={(e) => handleConfigChange('primaryCtaLabel', e.target.value)}
                      placeholder="e.g. View Projects"
                      style={{ width: '100%', fontSize: 'var(--text-xs)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                      Primary CTA URL / Anchor
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formData.config?.primaryCtaUrl || ''}
                      onChange={(e) => handleConfigChange('primaryCtaUrl', e.target.value)}
                      placeholder="e.g. #projects"
                      style={{ width: '100%', fontSize: 'var(--text-xs)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                      Secondary CTA Label
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formData.config?.secondaryCtaLabel || ''}
                      onChange={(e) => handleConfigChange('secondaryCtaLabel', e.target.value)}
                      placeholder="e.g. Contact Me"
                      style={{ width: '100%', fontSize: 'var(--text-xs)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                      Secondary CTA URL / Anchor
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formData.config?.secondaryCtaUrl || ''}
                      onChange={(e) => handleConfigChange('secondaryCtaUrl', e.target.value)}
                      placeholder="e.g. #contact"
                      style={{ width: '100%', fontSize: 'var(--text-xs)' }}
                    />
                  </div>
                </div>
              </>
            )}

            {formData.type === 'about' && (
              <>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.config?.showProfileImage ?? true}
                    onChange={(e) => handleConfigChange('showProfileImage', e.target.checked)}
                  />
                  Display About Portrait Image
                </label>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                    Maximum Text Length (50–5000 characters)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={5000}
                    className="input"
                    value={formData.config?.maxTextLength || 1000}
                    onChange={(e) => handleConfigChange('maxTextLength', Number(e.target.value))}
                    style={{ width: '100%', fontSize: 'var(--text-xs)' }}
                  />
                </div>
              </>
            )}

            {formData.type === 'projects' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                      Category Filter
                    </label>
                    <select
                      className="input"
                      value={formData.config?.category || ''}
                      onChange={(e) => handleConfigChange('category', e.target.value)}
                      style={{ width: '100%', fontSize: 'var(--text-xs)' }}
                    >
                      {ALLOWED_PROJECT_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                      Max Projects Displayed (1–50)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      className="input"
                      value={formData.config?.limit || 6}
                      onChange={(e) => handleConfigChange('limit', Number(e.target.value))}
                      style={{ width: '100%', fontSize: 'var(--text-xs)' }}
                    />
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.config?.featuredOnly ?? false}
                    onChange={(e) => handleConfigChange('featuredOnly', e.target.checked)}
                  />
                  Featured Projects Only
                </label>
              </>
            )}

            {formData.type === 'skills' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                    Max Skills Displayed (1–100)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    className="input"
                    value={formData.config?.limit || 30}
                    onChange={(e) => handleConfigChange('limit', Number(e.target.value))}
                    style={{ width: '100%', fontSize: 'var(--text-xs)' }}
                  />
                </div>
                <div style={{ paddingTop: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.config?.featuredOnly ?? false}
                      onChange={(e) => handleConfigChange('featuredOnly', e.target.checked)}
                    />
                    Featured Skills Only
                  </label>
                </div>
              </div>
            )}

            {(formData.type === 'experience' || formData.type === 'education' || formData.type === 'social_links') && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                  Max Items Displayed (1–50)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  className="input"
                  value={formData.config?.limit || 10}
                  onChange={(e) => handleConfigChange('limit', Number(e.target.value))}
                  style={{ width: '100%', fontSize: 'var(--text-xs)' }}
                />
              </div>
            )}

            {formData.type === 'contact' && (
              <>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.config?.showContactForm ?? true}
                    onChange={(e) => handleConfigChange('showContactForm', e.target.checked)}
                  />
                  Display Interactive Contact Form
                </label>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                    Contact Heading
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    className="input"
                    value={formData.config?.heading || ''}
                    onChange={(e) => handleConfigChange('heading', e.target.value)}
                    placeholder="e.g. Let's Connect"
                    style={{ width: '100%', fontSize: 'var(--text-xs)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                    Supporting Text
                  </label>
                  <textarea
                    rows={2}
                    maxLength={300}
                    className="input"
                    value={formData.config?.supportingText || ''}
                    onChange={(e) => handleConfigChange('supportingText', e.target.value)}
                    placeholder="e.g. Feel free to reach out..."
                    style={{ width: '100%', fontSize: 'var(--text-xs)' }}
                  />
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
              <input
                type="checkbox"
                name="isVisible"
                checked={formData.isVisible}
                onChange={handleFormChange}
              />
              Section Visible on Public Portfolio
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
              {isSaving ? 'Saving...' : editingSection ? 'Update Section' : 'Create Section'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Homepage Section"
        message={`Are you sure you want to permanently delete the "${deleteTarget?.type}" section block from the homepage? You can re-create it later from the available section types.`}
        isProcessing={isSaving}
      />
    </div>
  );
}
