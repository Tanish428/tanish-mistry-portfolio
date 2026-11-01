import { useState, useEffect } from 'react';
import * as adminApi from '../../api/adminApi.js';
import Modal from './Modal.jsx';

export default function ImagePickerModal({
  isOpen,
  onClose,
  onSelectImage,
  title = 'Select Media Asset',
}) {
  const [mediaList, setMediaList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [error, setError] = useState(null);

  // Quick upload state
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadAltText, setUploadAltText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const loadMedia = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAdminMedia({ limit: 50 });
      setMediaList(data?.media || []);
    } catch (err) {
      setError(err?.message || 'Failed to load media records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    adminApi
      .getAdminMedia({ limit: 50 })
      .then((data) => {
        if (!isMounted) return;
        setMediaList(data?.media || []);
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
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid format. Please select JPEG, PNG, or WebP.');
      setUploadFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File exceeds 5 MB limit. Please select a smaller file.');
      setUploadFile(null);
      return;
    }

    setUploadError(null);
    setUploadFile(file);
  };

  const handleQuickUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('image', uploadFile);
    if (uploadAltText.trim()) {
      formData.append('altText', uploadAltText.trim());
    }

    try {
      const uploaded = await adminApi.uploadAdminMedia(formData);
      // Auto-select uploaded asset and refresh
      setSelectedAsset(uploaded);
      setShowUpload(false);
      setUploadFile(null);
      setUploadAltText('');
      loadMedia();
    } catch (err) {
      setUploadError(err?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedAsset) {
      onSelectImage(selectedAsset);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="780px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Header Tabs / Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            Choose an image from your Cloudinary library or upload a new one.
          </div>
          <button
            type="button"
            onClick={() => setShowUpload((prev) => !prev)}
            className="btn btn-outline"
            style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-3)' }}
          >
            {showUpload ? '← View Gallery' : '+ Upload New'}
          </button>
        </div>

        {/* Quick Upload Panel */}
        {showUpload ? (
          <form
            onSubmit={handleQuickUpload}
            className="card"
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px dashed var(--color-primary)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)' }}>
              Direct Media Upload
            </h3>

            {uploadError && (
              <div
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-danger-subtle)',
                  color: 'var(--color-danger)',
                  fontSize: 'var(--text-xs)',
                }}
              >
                {uploadError}
              </div>
            )}

            <div>
              <label
                htmlFor="picker-upload-file"
                style={{ display: 'block', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-1)' }}
              >
                Select Image (JPEG, PNG, WebP — max 5 MB) *
              </label>
              <input
                id="picker-upload-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
                onChange={handleFileChange}
                className="input"
                style={{ width: '100%', fontSize: 'var(--text-xs)' }}
              />
            </div>

            <div>
              <label
                htmlFor="picker-upload-alt"
                style={{ display: 'block', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-1)' }}
              >
                Alt Text (recommended for SEO & accessibility)
              </label>
              <input
                id="picker-upload-alt"
                type="text"
                placeholder="Descriptive image summary"
                value={uploadAltText}
                onChange={(e) => setUploadAltText(e.target.value)}
                className="input"
                style={{ width: '100%', fontSize: 'var(--text-xs)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="btn btn-outline"
                style={{ fontSize: 'var(--text-xs)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!uploadFile || isUploading}
                className="btn btn-primary"
                style={{ fontSize: 'var(--text-xs)' }}
              >
                {isUploading ? 'Uploading to Cloudinary...' : 'Upload & Select'}
              </button>
            </div>
          </form>
        ) : (
          <>
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

            {/* Gallery Grid */}
            <div
              style={{
                maxHeight: '360px',
                overflowY: 'auto',
                paddingRight: 'var(--space-1)',
              }}
            >
              {isLoading ? (
                <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Loading media library...
                </div>
              ) : mediaList.length === 0 ? (
                <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No media uploaded yet. Click &quot;+ Upload New&quot; above to add images.
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                    gap: 'var(--space-3)',
                  }}
                >
                  {mediaList.map((item) => {
                    const isSelected = selectedAsset?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedAsset(item)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setSelectedAsset(item);
                          }
                        }}
                        style={{
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          border: isSelected
                            ? '2px solid var(--color-primary)'
                            : '1px solid var(--color-border)',
                          boxShadow: isSelected ? '0 0 10px rgba(168, 85, 247, 0.4)' : 'none',
                          cursor: 'pointer',
                          backgroundColor: 'var(--color-bg-surface)',
                          transition: 'all var(--transition-fast)',
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            aspectRatio: '1',
                            overflow: 'hidden',
                            backgroundColor: '#0a0a0f',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <img
                            src={item.secureUrl}
                            alt={item.altText || item.originalFilename || 'Media'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            loading="lazy"
                          />
                        </div>
                        <div
                          style={{
                            padding: 'var(--space-2)',
                            fontSize: '11px',
                            color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={item.altText || item.originalFilename || item.publicId}
                        >
                          {item.altText || item.originalFilename || item.publicId}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selection Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--color-border)',
                paddingTop: 'var(--space-4)',
                marginTop: 'var(--space-2)',
              }}
            >
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                {selectedAsset ? (
                  <span>
                    Selected: <strong style={{ color: 'var(--color-primary)' }}>{selectedAsset.originalFilename || selectedAsset.publicId}</strong>
                  </span>
                ) : (
                  'Select an image above'
                )}
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button type="button" onClick={onClose} className="btn btn-outline">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSelection}
                  disabled={!selectedAsset}
                  className="btn btn-primary"
                >
                  Use Selected Image
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
