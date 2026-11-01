import { useState, useEffect } from 'react';
import * as adminApi from '../../api/adminApi.js';
import Toast from '../../components/admin/Toast.jsx';

const AVAILABILITY_OPTIONS = [
  { value: 'open_to_opportunities', label: 'Open to Opportunities' },
  { value: 'open_to_full_time', label: 'Open to Full-Time' },
  { value: 'open_to_internships', label: 'Open to Internships' },
  { value: 'not_available', label: 'Not Available' },
];

export default function ProfileManager() {
  const [profile, setProfile] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    professionalTitle: '',
    shortIntroduction: '',
    about: '',
    location: '',
    publicEmail: '',
    profileImageUrl: '',
    profileImageAlt: '',
    availabilityStatus: 'open_to_opportunities',
    isVisible: true,
  });

  const populateForm = (data) => {
    setProfile(data);
    if (data) {
      setFormData({
        fullName: data.fullName || '',
        professionalTitle: data.professionalTitle || '',
        shortIntroduction: data.shortIntroduction || '',
        about: data.about || '',
        location: data.location || '',
        publicEmail: data.publicEmail || '',
        profileImageUrl: data.profileImageUrl || '',
        profileImageAlt: data.profileImageAlt || '',
        availabilityStatus: data.availabilityStatus || 'open_to_opportunities',
        isVisible: data.isVisible !== false,
      });
    }
  };

  useEffect(() => {
    let isMounted = true;
    adminApi
      .getAdminProfile()
      .then((data) => {
        if (!isMounted) return;
        populateForm(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err?.status === 404) {
          setProfile(null);
        } else {
          setError(err.message || 'Failed to load profile');
        }
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      let saved;
      if (!profile) {
        saved = await adminApi.createAdminProfile(formData);
        setToast({ type: 'success', message: 'Profile initialized successfully!' });
      } else {
        saved = await adminApi.updateAdminProfile(formData);
        setToast({ type: 'success', message: 'Profile updated successfully!' });
      }
      setProfile(saved);
      setIsInitializing(false);
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!profile) return;
    setIsSaving(true);
    setError(null);

    try {
      let updated;
      if (profile.isPublished) {
        updated = await adminApi.unpublishAdminProfile();
        setToast({ type: 'info', message: 'Profile unpublished.' });
      } else {
        updated = await adminApi.publishAdminProfile();
        setToast({ type: 'success', message: 'Profile published to live site!' });
      }
      setProfile(updated);
    } catch (err) {
      setError(err.message || 'Publication change failed');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="card" style={{ padding: 'var(--space-8)' }} role="status">Loading profile configuration...</div>;
  }

  if (!profile && !isInitializing) {
    return (
      <div className="card" style={{ padding: 'var(--space-10) var(--space-6)', textAlign: 'center' }}>
        <span className="badge badge-info" style={{ marginBottom: 'var(--space-3)' }}>Singleton Profile</span>
        <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>No Profile Found</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
          Your CMS singleton profile has not been initialized yet. Create your core developer profile now.
        </p>
        <button type="button" onClick={() => setIsInitializing(true)} className="btn btn-primary">
          Initialize Profile
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Top Header Card */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)' }}>Profile Manager</h1>
            {profile && (
              <span className={`badge ${profile.isPublished ? 'badge-success' : 'badge-warning'}`}>
                {profile.isPublished ? 'Published' : 'Draft'}
              </span>
            )}
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            Manage core biography, credentials, status, and public visibility.
          </p>
        </div>

        {profile && (
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              type="button"
              onClick={handleTogglePublish}
              disabled={isSaving}
              className={`btn ${profile.isPublished ? 'btn-outline' : 'btn-primary'}`}
            >
              {profile.isPublished ? 'Unpublish Profile' : 'Publish to Live Site'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div role="alert" className="card" style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: 'var(--space-4)' }}>
          {error}
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSave} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          <div>
            <label htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Tanish Mistry"
              required
            />
          </div>

          <div>
            <label htmlFor="professionalTitle">Professional Title *</label>
            <input
              id="professionalTitle"
              name="professionalTitle"
              type="text"
              value={formData.professionalTitle}
              onChange={handleChange}
              placeholder="Full Stack Software Engineer"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="shortIntroduction">Short Introduction * (10–300 chars)</label>
          <input
            id="shortIntroduction"
            name="shortIntroduction"
            type="text"
            value={formData.shortIntroduction}
            onChange={handleChange}
            placeholder="Specializing in scalable web architectures and dynamic CMS engines."
            required
          />
        </div>

        <div>
          <label htmlFor="about">About Description * (10–5000 chars)</label>
          <textarea
            id="about"
            name="about"
            rows={5}
            value={formData.about}
            onChange={handleChange}
            placeholder="Comprehensive background, expertise, and development philosophy..."
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          <div>
            <label htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              placeholder="Vadodara, Gujarat, India"
            />
          </div>

          <div>
            <label htmlFor="publicEmail">Public Email</label>
            <input
              id="publicEmail"
              name="publicEmail"
              type="email"
              value={formData.publicEmail}
              onChange={handleChange}
              placeholder="contact@example.com"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          <div>
            <label htmlFor="profileImageUrl">Profile Image URL (HTTPS)</label>
            <input
              id="profileImageUrl"
              name="profileImageUrl"
              type="url"
              value={formData.profileImageUrl}
              onChange={handleChange}
              placeholder="https://res.cloudinary.com/.../image.jpg"
            />
          </div>

          <div>
            <label htmlFor="profileImageAlt">Image Alt Text</label>
            <input
              id="profileImageAlt"
              name="profileImageAlt"
              type="text"
              value={formData.profileImageAlt}
              onChange={handleChange}
              placeholder="Tanish Mistry professional headshot"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', alignItems: 'center' }}>
          <div>
            <label htmlFor="availabilityStatus">Availability Status</label>
            <select
              id="availabilityStatus"
              name="availabilityStatus"
              value={formData.availabilityStatus}
              onChange={handleChange}
            >
              {AVAILABILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ paddingTop: 'var(--space-5)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="isVisible"
                checked={formData.isVisible}
                onChange={handleChange}
                style={{ width: 'auto' }}
              />
              <span>Profile Visible on Public Portfolio</span>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
          <button type="submit" disabled={isSaving} className="btn btn-primary">
            {isSaving ? 'Saving Profile...' : profile ? 'Save Changes' : 'Initialize Profile'}
          </button>
        </div>
      </form>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
