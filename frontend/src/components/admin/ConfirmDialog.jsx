import Modal from './Modal.jsx';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this record? This action cannot be undone.',
  isProcessing = false,
  confirmButtonText = 'Delete Permanently',
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="480px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)' }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="btn"
            style={{
              backgroundColor: 'var(--color-danger)',
              color: 'var(--color-text-inverse)',
            }}
          >
            {isProcessing ? 'Processing...' : confirmButtonText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
