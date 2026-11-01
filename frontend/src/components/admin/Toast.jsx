export default function Toast({ toast, onDismiss, type: propType, message: propMessage, onClose }) {
  const activeToast = toast || (propMessage ? { type: propType || 'info', message: propMessage } : null);
  if (!activeToast) return null;

  const { type = 'info', message } = activeToast;
  const handleDismiss = onDismiss || onClose;

  const styles = {
    success: { bg: 'var(--color-success-bg)', border: 'var(--color-success)', text: 'var(--color-success)' },
    danger: { bg: 'var(--color-danger-bg)', border: 'var(--color-danger)', text: 'var(--color-danger)' },
    warning: { bg: 'var(--color-warning-bg)', border: 'var(--color-warning)', text: 'var(--color-warning)' },
    info: { bg: 'var(--color-info-bg)', border: 'var(--color-info)', text: 'var(--color-info)' },
  }[type] || { bg: 'var(--color-info-bg)', border: 'var(--color-info)', text: 'var(--color-info)' };

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 'var(--space-6)',
        right: 'var(--space-6)',
        zIndex: 'var(--z-toast)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
        padding: 'var(--space-3) var(--space-5)',
        backgroundColor: styles.bg,
        border: `1px solid ${styles.border}`,
        color: styles.text,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        maxWidth: '420px',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--weight-medium)',
      }}
    >
      <span>{message}</span>
      {handleDismiss && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss notification"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: 'var(--text-base)',
            padding: 0,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
