import TechnicalDetails from './TechnicalDetails';

/**
 * FeedbackMessage component
 *
 * User-friendly feedback banner or toast replacement.
 * Uses role="alert" for errors and role="status" for non-error notifications.
 */
export default function FeedbackMessage({
  type = 'info', // 'success' | 'error' | 'warning' | 'info'
  message,
  details = null,
  onDismiss = null,
  style = {},
}) {
  if (!message) return null;

  const isAlert = type === 'error';

  const typeConfig = {
    success: {
      className: 'toast-success',
      icon: '✓',
    },
    error: {
      className: 'toast-error',
      icon: '✕',
    },
    warning: {
      className: 'toast-warning',
      style: {
        backgroundColor: 'var(--status-warn-bg)',
        border: '1px solid var(--status-warn-border)',
        color: 'var(--status-warn)',
      },
      icon: '!',
    },
    info: {
      className: 'toast-info',
      icon: 'ℹ',
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div
      role={isAlert ? 'alert' : 'status'}
      aria-live={isAlert ? 'assertive' : 'polite'}
      className={`toast ${config.className || ''}`.trim()}
      style={{
        ...config.style,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.375rem',
        marginBottom: '1rem',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: 'currentColor',
              color: '#FFFFFF',
              fontSize: '0.6875rem',
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {config.icon}
          </span>
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
            {message}
          </span>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss message"
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '1rem',
              lineHeight: 1,
              padding: '0.25rem',
              opacity: 0.8,
            }}
          >
            ×
          </button>
        )}
      </div>

      {details && (
        <TechnicalDetails
          summary="Technical details"
          style={{ width: '100%', marginTop: '0.25rem' }}
        >
          {typeof details === 'string' ? (
            <code style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{details}</code>
          ) : (
            details
          )}
        </TechnicalDetails>
      )}
    </div>
  );
}
