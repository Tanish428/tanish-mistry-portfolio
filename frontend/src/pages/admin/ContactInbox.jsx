import { useState, useEffect, useCallback } from 'react';
import * as adminApi from '../../api/adminApi.js';
import Modal from '../../components/admin/Modal.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import Toast from '../../components/admin/Toast.jsx';

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function ContactInbox() {
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'new', 'read', 'archived'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Detail Modal state
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Deletion state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMessages = useCallback(async (page = 1, status = statusFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { page, limit: 10 };
      if (status !== 'all') {
        params.status = status;
      }
      const data = await adminApi.getAdminContactMessages(params);
      setMessages(data?.messages || []);
      if (data?.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load contact messages');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    let isMounted = true;
    const params = { page: 1, limit: 10 };
    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }

    adminApi
      .getAdminContactMessages(params)
      .then((data) => {
        if (!isMounted) return;
        setMessages(data?.messages || []);
        if (data?.pagination) {
          setPagination(data.pagination);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || 'Failed to load contact messages');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [statusFilter]);

  const handleFilterChange = (newStatus) => {
    if (newStatus === statusFilter) return;
    setStatusFilter(newStatus);
  };

  const handleOpenMessage = async (msg) => {
    setSelectedMessage(msg);
    // If message is 'new', automatically mark as 'read' on open
    if (msg.status === 'new') {
      try {
        const updated = await adminApi.updateAdminContactMessageStatus(msg.id, 'read');
        const resolved = updated || { ...msg, status: 'read' };
        setSelectedMessage(resolved);
        setMessages((prev) =>
          prev.map((item) => (item.id === msg.id ? resolved : item))
        );
      } catch (err) {
        // Silent failure or light notification so view is not interrupted
        console.error('Failed to auto-update status to read:', err);
      }
    }
  };

  const handleUpdateStatus = async (msgId, nextStatus) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await adminApi.updateAdminContactMessageStatus(msgId, nextStatus);
      const resolved = updated || { ...selectedMessage, status: nextStatus };
      if (selectedMessage && selectedMessage.id === msgId) {
        setSelectedMessage(resolved);
      }
      setMessages((prev) =>
        prev.map((item) => (item.id === msgId ? resolved : item))
      );
      setToast({
        type: 'success',
        message: `Message marked as ${nextStatus}`,
      });
    } catch (err) {
      setToast({
        type: 'danger',
        message: err?.message || 'Failed to update message status',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteAdminContactMessage(deleteTarget.id);
      setToast({
        type: 'success',
        message: 'Message permanently deleted',
      });
      if (selectedMessage && selectedMessage.id === deleteTarget.id) {
        setSelectedMessage(null);
      }
      setDeleteTarget(null);
      // Reload current page
      await fetchMessages(pagination.page);
    } catch (err) {
      setToast({
        type: 'danger',
        message: err?.message || 'Failed to delete message',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return (
          <span
            className="badge"
            style={{
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              color: 'var(--color-primary-light)',
              border: '1px solid rgba(168, 85, 247, 0.35)',
            }}
          >
            New
          </span>
        );
      case 'read':
        return <span className="badge badge-success">Read</span>;
      case 'archived':
        return (
          <span
            className="badge"
            style={{
              backgroundColor: 'var(--color-bg-subtle)',
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
            }}
          >
            Archived
          </span>
        );
      default:
        return <span className="badge badge-info">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Header */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)' }}>
            Contact Messages Inbox
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            Review inbound communications from the public portfolio contact form.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchMessages(pagination.page)}
          disabled={isLoading}
          className="btn btn-outline"
          aria-label="Refresh contact messages"
        >
          {isLoading ? 'Refreshing...' : 'Refresh Inbox'}
        </button>
      </div>

      {/* Filter Tabs */}
      <nav
        aria-label="Filter contact messages"
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: 'var(--space-2)',
        }}
      >
        {[
          { key: 'all', label: 'All Messages' },
          { key: 'new', label: 'New' },
          { key: 'read', label: 'Read' },
          { key: 'archived', label: 'Archived' },
        ].map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleFilterChange(tab.key)}
              aria-current={isActive ? 'page' : undefined}
              className="btn"
              style={{
                backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? 'var(--color-primary-contrast)' : 'var(--color-text-secondary)',
                border: '1px solid',
                borderColor: isActive ? 'var(--color-primary)' : 'transparent',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-1) var(--space-3)',
                fontSize: 'var(--text-xs)',
                fontWeight: isActive ? 'var(--weight-semibold)' : 'var(--weight-medium)',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="card"
          style={{
            borderColor: 'var(--color-danger)',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchMessages(pagination.page)}
            className="btn btn-outline"
            style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Messages List / Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <p style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-2)' }}>No messages found.</p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              {statusFilter === 'all'
                ? 'Your inbox has not received any contact submissions yet.'
                : `There are currently no messages marked as '${statusFilter}'.`}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 'var(--text-sm)',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-subtle)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <th style={{ padding: 'var(--space-3) var(--space-4)', width: '90px' }}>Status</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>From</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Subject</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', width: '180px' }}>Received</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right', width: '220px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => {
                  const isUnread = msg.status === 'new';
                  return (
                    <tr
                      key={msg.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        backgroundColor: isUnread ? 'rgba(168, 85, 247, 0.04)' : 'transparent',
                        transition: 'background-color var(--transition-fast)',
                      }}
                    >
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        {getStatusBadge(msg.status)}
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <div style={{ fontWeight: isUnread ? 'var(--weight-bold)' : 'var(--weight-medium)', color: 'var(--color-text-primary)' }}>
                          {msg.name}
                        </div>
                        <a
                          href={`mailto:${msg.email}`}
                          style={{
                            color: 'var(--color-text-secondary)',
                            fontSize: 'var(--text-xs)',
                            textDecoration: 'none',
                          }}
                        >
                          {msg.email}
                        </a>
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenMessage(msg)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            textAlign: 'left',
                            color: isUnread ? 'var(--color-primary-light)' : 'var(--color-text-primary)',
                            fontWeight: isUnread ? 'var(--weight-bold)' : 'var(--weight-normal)',
                            cursor: 'pointer',
                            textDecoration: 'none',
                          }}
                        >
                          {msg.subject}
                        </button>
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
                        {formatDate(msg.createdAt)}
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenMessage(msg)}
                            className="btn btn-outline"
                            style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)' }}
                            aria-label={`View message from ${msg.name}`}
                          >
                            View
                          </button>

                          {msg.status === 'new' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(msg.id, 'read')}
                              className="btn btn-outline"
                              style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)' }}
                              aria-label={`Mark message from ${msg.name} as read`}
                            >
                              Mark Read
                            </button>
                          ) : msg.status === 'read' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(msg.id, 'new')}
                              className="btn btn-outline"
                              style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)' }}
                              aria-label={`Mark message from ${msg.name} as unread`}
                            >
                              Mark Unread
                            </button>
                          ) : null}

                          {msg.status !== 'archived' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(msg.id, 'archived')}
                              className="btn btn-outline"
                              style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)' }}
                              aria-label={`Archive message from ${msg.name}`}
                            >
                              Archive
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(msg.id, 'read')}
                              className="btn btn-outline"
                              style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)' }}
                              aria-label={`Restore message from ${msg.name}`}
                            >
                              Restore
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(msg)}
                            className="btn btn-outline"
                            style={{
                              padding: 'var(--space-1) var(--space-2)',
                              fontSize: 'var(--text-xs)',
                              borderColor: 'var(--color-danger)',
                              color: 'var(--color-danger)',
                            }}
                            aria-label={`Delete message from ${msg.name}`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.total > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--space-3) var(--space-4)',
              borderTop: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-subtle)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <span>
              Showing {messages.length} of {pagination.total} message{pagination.total === 1 ? '' : 's'} (Page {pagination.page} of {pagination.totalPages})
            </span>

            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={() => fetchMessages(pagination.page - 1)}
                disabled={!pagination.hasPrevPage || isLoading}
                className="btn btn-outline"
                style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)' }}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => fetchMessages(pagination.page + 1)}
                disabled={!pagination.hasNextPage || isLoading}
                className="btn btn-outline"
                style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <Modal
          isOpen={Boolean(selectedMessage)}
          onClose={() => setSelectedMessage(null)}
          title={selectedMessage.subject || 'Message Details'}
          maxWidth="700px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Header info */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: 'var(--space-3)',
                paddingBottom: 'var(--space-3)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  From:{' '}
                  <strong style={{ color: 'var(--color-text-primary)' }}>{selectedMessage.name}</strong>{' '}
                  &lt;
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    style={{ color: 'var(--color-primary-light)', textDecoration: 'none' }}
                  >
                    {selectedMessage.email}
                  </a>
                  &gt;
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                  Received on {formatDate(selectedMessage.createdAt)}
                </div>
              </div>

              <div>{getStatusBadge(selectedMessage.status)}</div>
            </div>

            {/* Message Body */}
            <div>
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--space-2)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Message Content
              </div>
              <div
                style={{
                  backgroundColor: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)',
                  fontSize: 'var(--text-sm)',
                  lineHeight: 'var(--leading-relaxed)',
                  color: 'var(--color-text-primary)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  minHeight: '120px',
                }}
              >
                {selectedMessage.message}
              </div>
            </div>

            {/* Modal Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--space-2)',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {selectedMessage.status === 'read' ? (
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'new')}
                    className="btn btn-outline"
                  >
                    Mark as Unread
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'read')}
                    className="btn btn-outline"
                  >
                    Mark as Read
                  </button>
                )}

                {selectedMessage.status !== 'archived' ? (
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'archived')}
                    className="btn btn-outline"
                  >
                    Archive
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'read')}
                    className="btn btn-outline"
                  >
                    Move to Inbox
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setDeleteTarget(selectedMessage)}
                  className="btn btn-outline"
                  style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                >
                  Delete
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isProcessing={isDeleting}
        title="Delete Contact Message"
        message={`Are you sure you want to delete the message from "${deleteTarget?.name}" (${deleteTarget?.email}) with subject "${deleteTarget?.subject}"? This action cannot be undone.`}
        confirmButtonText="Delete Message"
      />
    </div>
  );
}
