import { useState, useEffect } from 'react';
import * as adminApi from '../../api/adminApi.js';
import Modal from '../../components/admin/Modal.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import Toast from '../../components/admin/Toast.jsx';

const EMPLOYMENT_TYPES = [
  { value: 'internship', label: 'Internship' },
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'other', label: 'Other' },
];

const WORK_MODES = [
  { value: 'onsite', label: 'Onsite' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
];

const formatDateForInput = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

const formatDateForDisplay = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
};

export default function ExperienceManager() {
  const [experiences, setExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    company: '',
    position: '',
    employmentType: 'internship',
    workMode: 'onsite',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    technologies: '',
    description: '',
    isVisible: true,
  });

  const loadExperiences = async () => {
    try {
      const data = await adminApi.getAdminExperience();
      setExperiences(data?.experience || []);
    } catch (err) {
      setError(err.message || 'Failed to load experience');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    adminApi
      .getAdminExperience()
      .then((data) => {
        if (!isMounted) return;
        setExperiences(data?.experience || []);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load experience');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenCreate = () => {
    setEditingExperience(null);
    setFormData({
      company: '',
      position: '',
      employmentType: 'internship',
      workMode: 'onsite',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      technologies: '',
      description: '',
      isVisible: true,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingExperience(exp);
    setFormData({
      company: exp.company || '',
      position: exp.position || '',
      employmentType: exp.employmentType || 'internship',
      workMode: exp.workMode || 'onsite',
      location: exp.location || '',
      startDate: formatDateForInput(exp.startDate),
      endDate: formatDateForInput(exp.endDate),
      isCurrent: exp.isCurrent || false,
      technologies: Array.isArray(exp.technologies) ? exp.technologies.join(', ') : '',
      description: exp.description || '',
      isVisible: exp.isVisible !== false,
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
      company: formData.company.trim(),
      position: formData.position.trim(),
      employmentType: formData.employmentType,
      workMode: formData.workMode || null,
      location: formData.location?.trim() || null,
      startDate: formData.startDate,
      isCurrent: formData.isCurrent,
      description: formData.description?.trim() || null,
      isVisible: formData.isVisible,
    };

    if (formData.isCurrent) {
      payload.endDate = null;
    } else {
      payload.endDate = formData.endDate;
    }

    if (formData.technologies?.trim()) {
      payload.technologies = formData.technologies
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    } else {
      payload.technologies = [];
    }

    try {
      if (editingExperience) {
        await adminApi.updateAdminExperience(editingExperience.id, payload);
        setToast({ type: 'success', message: 'Experience updated successfully!' });
      } else {
        await adminApi.createAdminExperience(payload);
        setToast({ type: 'success', message: 'Experience created successfully!' });
      }
      setIsModalOpen(false);
      loadExperiences();
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
      await adminApi.deleteAdminExperience(deleteTarget.id);
      setToast({ type: 'success', message: 'Experience entry deleted!' });
      setDeleteTarget(null);
      loadExperiences();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete experience' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (exp) => {
    try {
      if (exp.isPublished) {
        await adminApi.unpublishAdminExperience(exp.id);
        setToast({ type: 'success', message: `Unpublished "${exp.position} at ${exp.company}"` });
      } else {
        await adminApi.publishAdminExperience(exp.id);
        setToast({ type: 'success', message: `Published "${exp.position} at ${exp.company}"` });
      }
      loadExperiences();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to update publication status' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)' }}>
            Experience Management
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
            Manage career history, internships, roles, and technical responsibilities.
          </p>
        </div>
        <button type="button" onClick={handleOpenCreate} className="btn btn-primary">
          + Add Experience
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Loading experience history...
          </div>
        ) : experiences.length === 0 ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No work experience entries recorded yet. Click &quot;+ Add Experience&quot; to create one.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Role & Company</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Type & Mode</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Duration</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Status</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {experiences.map((exp) => (
                  <tr
                    key={exp.id}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      transition: 'background-color var(--transition-fast)',
                    }}
                  >
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
                        {exp.position}
                      </div>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)' }}>
                        {exp.company} {exp.location ? `• ${exp.location}` : ''}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: 'var(--space-1) var(--space-2)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--text-xs)',
                          backgroundColor: 'var(--color-bg-subtle)',
                          color: 'var(--color-text-secondary)',
                          textTransform: 'capitalize',
                        }}
                      >
                        {exp.employmentType?.replace('_', ' ')}
                      </span>
                      {exp.workMode && (
                        <span
                          style={{
                            marginLeft: 'var(--space-2)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text-muted)',
                            textTransform: 'capitalize',
                          }}
                        >
                          ({exp.workMode})
                        </span>
                      )}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                      {formatDateForDisplay(exp.startDate)} – {exp.isCurrent ? 'Present' : formatDateForDisplay(exp.endDate)}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(exp)}
                        className="btn btn-outline"
                        style={{
                          padding: 'var(--space-1) var(--space-2)',
                          fontSize: 'var(--text-xs)',
                          backgroundColor: exp.isPublished ? 'var(--color-success-subtle)' : 'var(--color-bg-subtle)',
                          color: exp.isPublished ? 'var(--color-success)' : 'var(--color-text-muted)',
                          borderColor: exp.isPublished ? 'var(--color-success)' : 'var(--color-border)',
                        }}
                      >
                        {exp.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(exp)}
                          className="btn btn-outline"
                          style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)' }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(exp)}
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExperience ? 'Edit Experience' : 'Add Experience'}
        maxWidth="600px"
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label htmlFor="exp-company" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}>
                Company *
              </label>
              <input
                id="exp-company"
                name="company"
                type="text"
                required
                maxLength={100}
                className="input"
                value={formData.company}
                onChange={handleFormChange}
                placeholder="e.g. Acme Labs"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label htmlFor="exp-position" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}>
                Position / Role *
              </label>
              <input
                id="exp-position"
                name="position"
                type="text"
                required
                maxLength={100}
                className="input"
                value={formData.position}
                onChange={handleFormChange}
                placeholder="e.g. Full-Stack Developer"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label htmlFor="exp-employmentType" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}>
                Employment Type *
              </label>
              <select
                id="exp-employmentType"
                name="employmentType"
                required
                className="input"
                value={formData.employmentType}
                onChange={handleFormChange}
                style={{ width: '100%' }}
              >
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="exp-workMode" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}>
                Work Mode
              </label>
              <select
                id="exp-workMode"
                name="workMode"
                className="input"
                value={formData.workMode}
                onChange={handleFormChange}
                style={{ width: '100%' }}
              >
                {WORK_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="exp-location" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}>
              Location (optional)
            </label>
            <input
              id="exp-location"
              name="location"
              type="text"
              maxLength={100}
              className="input"
              value={formData.location}
              onChange={handleFormChange}
              placeholder="e.g. Mumbai, India"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div>
              <label htmlFor="exp-startDate" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}>
                Start Date *
              </label>
              <input
                id="exp-startDate"
                name="startDate"
                type="date"
                required
                className="input"
                value={formData.startDate}
                onChange={handleFormChange}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                <label htmlFor="exp-endDate" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>
                  End Date {!formData.isCurrent && '*'}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="isCurrent"
                    checked={formData.isCurrent}
                    onChange={handleFormChange}
                  />
                  Current Role
                </label>
              </div>
              <input
                id="exp-endDate"
                name="endDate"
                type="date"
                disabled={formData.isCurrent}
                required={!formData.isCurrent}
                className="input"
                value={formData.isCurrent ? '' : formData.endDate}
                onChange={handleFormChange}
                style={{ width: '100%', opacity: formData.isCurrent ? 0.5 : 1 }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="exp-technologies" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}>
              Technologies (comma-separated)
            </label>
            <input
              id="exp-technologies"
              name="technologies"
              type="text"
              className="input"
              value={formData.technologies}
              onChange={handleFormChange}
              placeholder="e.g. React, Node.js, Express, MongoDB"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label htmlFor="exp-description" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}>
              Role Summary / Description (optional)
            </label>
            <textarea
              id="exp-description"
              name="description"
              rows={4}
              maxLength={2000}
              className="input"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Key responsibilities and achievements in this role..."
              style={{ width: '100%' }}
            />
          </div>

          <div>
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
              {isSaving ? 'Saving...' : editingExperience ? 'Update Experience' : 'Create Experience'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Experience Entry"
        message={`Are you sure you want to delete "${deleteTarget?.position} at ${deleteTarget?.company}"?`}
        isProcessing={isSaving}
      />
    </div>
  );
}
