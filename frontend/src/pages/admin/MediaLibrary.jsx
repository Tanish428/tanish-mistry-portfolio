import { useState, useEffect } from 'react';
import * as adminApi from '../../api/adminApi.js';
import Modal from '../../components/admin/Modal.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import Toast from '../../components/admin/Toast.jsx';

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function MediaLibrary() {
  const [mediaList, setMediaList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Upload state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadAltText, setUploadAltText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Inspection & Deletion state
  const [inspectingAsset, setInspectingAsset] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadMedia = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAdminMedia({ page, limit: 12 });
      setMediaList(data?.media || []);
      if (data?.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load media records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    adminApi
      .getAdminMedia({ page: 1, limit: 12 })
      .then((data) => {
        if (!isMounted) return;
        setMediaList(data?.media || []);
        if (data?.pagination) {
          setPagination(data.pagination);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || 'Failed to load media records');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setUploadError('Invalid format. Only JPEG, PNG, and WebP images are allowed.');
      setUploadFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File exceeds maximum size limit of 5 MB.');
      setUploadFile(null);
      return;
    }

    setUploadError(null);
    setUploadFile(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('image', uploadFile);
    if (uploadAltText.trim()) {
      formData.append('altText', uploadAltText.trim());
    }

    try {
      await adminApi.uploadAdminMedia(formData);
      setToast({ type: 'success', message: 'Image uploaded to Cloudinary successfully!' });
      setIsUploadOpen(false);
      setUploadFile(null);
      setUploadAltText('');
      loadMedia(1);
    } catch (err) {
      setUploadError(err?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteAdminMedia(deleteTarget.id);
      setToast({ type: 'success', message: 'Media asset deleted successfully.' });
      setDeleteTarget(null);
      if (inspectingAsset?.id === deleteTarget.id) {
        setInspectingAsset(null);
      }
      loadMedia(pagination.page);
    } catch (err) {
      setToast({
        type: 'danger',
        message: err?.message || 'Failed to delete media asset. It may be referenced by existing content.',
      });
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyUrl = (url) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setToast({ type: 'info', message: 'Image URL copied to clipboard!' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)' }}>
            Media Library
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
            Upload, inspect, and manage Cloudinary image assets used across your portfolio.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            type="button"
            onClick={() => loadMedia(pagination.page)}
            className="btn btn-outline"
            disabled={isLoading}
          >
            ↻ Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              setUploadFile(null);
              setUploadAltText('');
              setUploadError(null);
              setIsUploadOpen(true);
            }}
            className="btn btn-primary"
          >
            + Upload Image
          </button>
        </div>
      </div>

      {error && (
        <div
          className="card"
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-danger-subtle)',
            color: 'var(--color-danger)',
            fontSize: 'var(--text-sm)',
          }}
        >
          {error}
        </div>
      )}

      {/* Media Grid Card */}
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        {isLoading ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Loading Cloudinary media...
          </div>
        ) : mediaList.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-2)' }}>No media assets found</p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
              Upload your first project screenshot, avatar, or banner to get started.
            </p>
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="btn btn-primary"
            >
              + Upload First Image
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 'var(--space-4)',
              }}
            >
              {mediaList.map((item) => (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
                  }}
                >
                  <div
                    style={{
                      aspectRatio: '16/10',
                      backgroundColor: '#07070d',
                      overflow: 'hidden',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => setInspectingAsset(item)}
                  >
                    <img
                      src={item.secureUrl}
                      alt={item.altText || item.originalFilename || 'Media'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: 'var(--space-2)',
                        right: 'var(--space-2)',
                        fontSize: '10px',
                        fontWeight: 'var(--weight-semibold)',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'var(--color-text-primary)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.format}
                    </span>
                  </div>

                  <div style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flex: 1 }}>
                    <div
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--weight-semibold)',
                        color: 'var(--color-text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={item.originalFilename || item.publicId}
                    >
                      {item.originalFilename || item.publicId}
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{item.width && item.height ? `${item.width}×${item.height}` : 'Vector/Image'}</span>
                      <span>{formatBytes(item.bytes)}</span>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: 'var(--space-2)', display: 'flex', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(item.secureUrl)}
                        className="btn btn-outline"
                        style={{ fontSize: '11px', padding: 'var(--space-1) var(--space-2)', flex: 1 }}
                        title="Copy secure HTTPS URL"
                      >
                        Copy URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setInspectingAsset(item)}
                        className="btn btn-outline"
                        style={{ fontSize: '11px', padding: 'var(--space-1) var(--space-2)' }}
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="btn btn-outline"
                        style={{
                          fontSize: '11px',
                          padding: 'var(--space-1) var(--space-2)',
                          color: 'var(--color-danger)',
                          borderColor: 'var(--color-danger-subtle)',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 'var(--space-6)',
                  paddingTop: 'var(--space-4)',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total assets)
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button
                    type="button"
                    onClick={() => loadMedia(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage || isLoading}
                    className="btn btn-outline"
                    style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-3)' }}
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => loadMedia(pagination.page + 1)}
                    disabled={!pagination.hasNextPage || isLoading}
                    className="btn btn-outline"
                    style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-3)' }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => !isUploading && setIsUploadOpen(false)}
        title="Upload Image to Cloudinary"
        maxWidth="540px"
      >
        <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {uploadError && (
            <div
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-danger-subtle)',
                color: 'var(--color-danger)',
                fontSize: 'var(--text-sm)',
              }}
            >
              {uploadError}
            </div>
          )}

          <div>
            <label
              htmlFor="upload-image-file"
              style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}
            >
              Select Image File * (JPEG, PNG, or WebP up to 5 MB)
            </label>
            <input
              id="upload-image-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={handleFileSelect}
              className="input"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label
              htmlFor="upload-image-alt"
              style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-1)' }}
            >
              Alt Text / Caption (optional)
            </label>
            <input
              id="upload-image-alt"
              type="text"
              placeholder="e.g. Hero portfolio banner illustration"
              value={uploadAltText}
              onChange={(e) => setUploadAltText(e.target.value)}
              className="input"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              disabled={isUploading}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!uploadFile || isUploading}
              className="btn btn-primary"
            >
              {isUploading ? 'Uploading to Cloudinary...' : 'Upload Asset'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Inspect Media Modal */}
      <Modal
        isOpen={Boolean(inspectingAsset)}
        onClose={() => setInspectingAsset(null)}
        title="Asset Inspection"
        maxWidth="680px"
      >
        {inspectingAsset && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div
              style={{
                width: '100%',
                maxHeight: '320px',
                backgroundColor: '#07070d',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={inspectingAsset.secureUrl}
                alt={inspectingAsset.altText || 'Inspection preview'}
                style={{ maxWidth: '100%', maxHeight: '320px', objectFit: 'contain' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Filename:</span>
                <strong style={{ color: 'var(--color-text-primary)' }}>{inspectingAsset.originalFilename || '—'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Cloudinary Public ID:</span>
                <code style={{ fontSize: '11px' }}>{inspectingAsset.publicId}</code>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Dimensions:</span>
                <strong style={{ color: 'var(--color-text-primary)' }}>
                  {inspectingAsset.width && inspectingAsset.height ? `${inspectingAsset.width} × ${inspectingAsset.height} px` : 'Unknown'}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>File Size:</span>
                <strong style={{ color: 'var(--color-text-primary)' }}>{formatBytes(inspectingAsset.bytes)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Uploaded On:</span>
                <strong style={{ color: 'var(--color-text-primary)' }}>{formatDate(inspectingAsset.createdAt)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Alt Text:</span>
                <strong style={{ color: 'var(--color-text-primary)' }}>{inspectingAsset.altText || 'None provided'}</strong>
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-1)' }}>
                Secure URL:
              </span>
              <input
                type="text"
                readOnly
                value={inspectingAsset.secureUrl}
                className="input"
                style={{ width: '100%', fontSize: '11px', color: 'var(--color-primary)' }}
                onClick={(e) => e.target.select()}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(inspectingAsset);
                  setInspectingAsset(null);
                }}
                className="btn btn-outline"
                style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger-subtle)' }}
              >
                Delete from Cloudinary
              </button>

              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button
                  type="button"
                  onClick={() => handleCopyUrl(inspectingAsset.secureUrl)}
                  className="btn btn-outline"
                >
                  Copy URL
                </button>
                <button
                  type="button"
                  onClick={() => setInspectingAsset(null)}
                  className="btn btn-primary"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Media Asset"
        message={`Are you sure you want to permanently delete "${deleteTarget?.originalFilename || deleteTarget?.publicId}" from Cloudinary and your database? Note: If this asset is referenced by your Profile or a Project, deletion will be rejected.`}
        isProcessing={isDeleting}
      />
    </div>
  );
}
