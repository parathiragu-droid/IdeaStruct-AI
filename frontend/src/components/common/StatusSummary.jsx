import TechnicalDetails from './TechnicalDetails';

/**
 * StatusSummary component
 *
 * Provides human-readable, beginner-friendly status banners.
 * Avoids raw technical HTTP status codes or DB terms in the main view.
 */
export default function StatusSummary({
  type = 'info', // 'good' | 'warning' | 'error' | 'info'
  headline,
  description = null,
  action = null,
  technicalDetails = null,
  style = {},
}) {
  const getStyles = () => {
    switch (type) {
      case 'good':
      case 'success':
        return {
          bg: 'var(--status-up-bg)',
          border: 'var(--status-up-border)',
          color: 'var(--status-up)',
          icon: '✅',
        };
      case 'warning':
      case 'warn':
        return {
          bg: 'var(--status-warn-bg)',
          border: 'var(--status-warn-border)',
          color: 'var(--status-warn)',
          icon: '⚠️',
        };
      case 'error':
      case 'down':
        return {
          bg: 'var(--status-down-bg)',
          border: 'var(--status-down-border)',
          color: 'var(--status-down)',
          icon: '🛑',
        };
      case 'info':
      default:
        return {
          bg: 'var(--accent-aqua-light)',
          border: 'var(--accent-aqua-border)',
          color: 'var(--text-primary)',
          icon: 'ℹ️',
        };
    }
  };

  const current = getStyles();

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      style={{
        padding: '0.875rem 1.125rem',
        backgroundColor: current.bg,
        border: `1px solid ${current.border}`,
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.25rem',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', flex: 1, minWidth: '240px' }}>
          <span style={{ fontSize: '1.125rem', lineHeight: 1.2 }}>{current.icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: current.color, lineHeight: 1.3 }}>
              {headline}
            </div>
            {description && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                {description}
              </div>
            )}
          </div>
        </div>

        {action && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {action}
          </div>
        )}
      </div>

      {technicalDetails && (
        <TechnicalDetails
          summary="Technical details"
          style={{ marginTop: '0.625rem', backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
        >
          {technicalDetails}
        </TechnicalDetails>
      )}
    </div>
  );
}
