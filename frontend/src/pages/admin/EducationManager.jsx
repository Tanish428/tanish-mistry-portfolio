import { useState, useEffect } from 'react';
import * as adminApi from '../../api/adminApi.js';
import Modal from '../../components/admin/Modal.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import Toast from '../../components/admin/Toast.jsx';

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

export default function EducationManager() {
  const [educationList, setEducationList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    grade: '',
    description: '',
    isVisible: true,
  });

  const loadEducation = async () => {
    try {
      const data = await adminApi.getAdminEducation();
      setEducationList(data?.education || []);
    } catch (err) {
      setError(err.message || 'Failed to load education history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    adminApi
      .getAdminEducation()
      .then((data) => {
        if (!isMounted) return;
        setEducationList(data?.education || []);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load education history');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenCreate = () => {
    setEditingEducation(null);
    setFormData({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      grade: '',
      description: '',
      isVisible: true,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (edu) => {
    setEditingEducation(edu);
    setFormData({
      institution: edu.institution || '',
      degree: edu.degree || '',
      fieldOfStudy: edu.fieldOfStudy || '',
      location: edu.location || '',
      startDate: formatDateForInput(edu.startDate),
      endDate: formatDateForInput(edu.endDate),
      isCurrent: edu.isCurrent || false,
      grade: edu.grade || '',
      description: edu.description || '',
      isVisible: edu.isVisible !== false,
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
      institution: formData.institution.trim(),
      degree: formData.degree.trim(),
      fieldOfStudy: formData.fieldOfStudy?.trim() || null,
      location: formData.location?.trim() || null,
      startDate: formData.startDate,
      isCurrent: formData.isCurrent,
      grade: formData.grade?.trim() || null,
      description: formData.description?.trim() || null,
      isVisible: formData.isVisible,
    };

    if (formData.isCurrent) {
      payload.endDate = null;
    } else {
      payload.endDate = formData.endDate;
    }

    try {
      if (editingEducation) {
        await adminApi.updateAdminEducation(editingEducation.id, payload);
        setToast({ type: 'success', message: 'Education updated successfully!' });
      } else {
        await adminApi.createAdminEducation(payload);
        setToast({ type: 'success', message: 'Education entry created successfully!' });
      }
      setIsModalOpen(false);
      loadEducation();
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
      await adminApi.deleteAdminEducation(deleteTarget.id);
      setToast({ type: 'success', message: 'Education record deleted!' });
      setDeleteTarget(null);
      loadEducation();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete education entry' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (edu) => {
    try {
      if (edu.isPublished) {
        await adminApi.unpublishAdminEducation(edu.id);
        setToast({ type: 'success', message: `Unpublished "${edu.degree} from ${edu.institution}"` });
      } else {
        await adminApi.publishAdminEducation(edu.id);
        setToast({ type: 'success', message: `Published "${edu.degree} from ${edu.institution}"` });
      }
      loadEducation();
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
            Education Management
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
            Manage degrees, academic background, universities, and milestones.
          </p>
        </div>
        <button type="button" onClick={handleOpenCreate} className="btn btn-primary">
          + Add Education
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Loading education records...
          </div>
        ) : educationList.length === 0 ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No education records found. Click &quot;+ Add Education&quot; to add one.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Degree & Institution</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Field of Study</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Duration</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Grade</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Status</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {educationList.map((edu) => (
                  <tr
                    key={edu.id}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      transition: 'background-color var(--transition-fast)',
                    }}
                  >
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
                        {edu.degree}
                      </div>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)' }}>
                        {edu.institution} {edu.location ? `• ${edu.location}` : ''}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)' }}>
                      {edu.fieldOfStudy || '—'}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                      {formatDateForDisplay(edu.startDate)} – {edu.isCurrent ? 'Present' : formatDateForDisplay(edu.endDate)}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                      {edu.grade || '—'}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(edu)}
                        className="btn btn-outline"
                        style={{
                          padding: 'var(--space-1) var(--space-2)',
                          fontSize: 'var(--text-xs)',
                          backgroundColor: edu.isPublished ? 'var(--color-success-subtle)' : 'var(--color-bg-subtle)',
                          color: edu.isPublished ? 'var(--color-success)' : 'var(--color-text-muted)',
                          borderColor: edu.isPublished ? 'var(--color-success)' : 'var(--color-border)',
                        }}
                      >
                        {edu.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(edu)}
                          className="btn btn-outline"
                          style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)' }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(edu)}
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
        title={editingEducation ? 'Edit Education' : 'Add Education'}
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
              <label htmlFor="edu-institution" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}>
                Institution / University *
              </label>
              <input
                id="edu-institution"
                name="institution"
                type="text"
                required
                maxLength={120}
                className="input"
                value={formData.institution}
                onChange={handleFormChange}
                placeholder="e.g. University of Mumbai"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label htmlFor="edu-degree" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}>
                Degree / Diploma *
              </label>
              <input
                id="edu-degree"
                name="degree"
                type="text"
                required
                maxLength={100}
                className="input"
                value={formData.degree}
                onChange={handleFormChange}
                placeholder="e.g. B.Tech / Bachelor of Science"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label htmlFor="edu-fieldOfStudy" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}>
                Field of Study
              </label>
              <input
                id="edu-fieldOfStudy"
                name="fieldOfStudy"
                type="text"
                maxLength={100}
                className="input"
                value={formData.fieldOfStudy}
                onChange={handleFormChange}
                placeholder="e.g. Computer Science"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label htmlFor="edu-grade" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}>
                Grade / CGPA / Honors
              </label>
              <input
                id="edu-grade"
                name="grade"
                type="text"
                maxLength={50}
                className="input"
                value={formData.grade}
                onChange={handleFormChange}
                placeholder="e.g. 9.1 CGPA"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="edu-location" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}>
              Location (optional)
            </label>
            <input
              id="edu-location"
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
              <label htmlFor="edu-startDate" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}>
                Start Date *
              </label>
              <input
                id="edu-startDate"
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
                <label htmlFor="edu-endDate" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>
                  End Date {!formData.isCurrent && '*'}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="isCurrent"
                    checked={formData.isCurrent}
                    onChange={handleFormChange}
                  />
                  Currently Enrolled
                </label>
              </div>
              <input
                id="edu-endDate"
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
            <label htmlFor="edu-description" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}>
              Description / Activities (optional)
            </label>
            <textarea
              id="edu-description"
              name="description"
              rows={3}
              maxLength={2000}
              className="input"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Notable coursework, extracurricular activities, or achievements..."
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
              {isSaving ? 'Saving...' : editingEducation ? 'Update Education' : 'Create Education'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Education Record"
        message={`Are you sure you want to delete "${deleteTarget?.degree} from ${deleteTarget?.institution}"?`}
        isProcessing={isSaving}
      />
    </div>
  );
}
