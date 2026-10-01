export default function Notice({
  type = 'info',
  title,
  children,
  action,
  style = {}
}) {
  const getStyles = () => {
    switch (type) {
      case 'warning':
        return {
          bg: 'var(--status-warn-bg)',
          border: 'var(--status-warn-border)',
          color: 'var(--status-warn)',
        };
      case 'error':
        return {
          bg: 'var(--status-down-bg)',
          border: 'var(--status-down-border)',
          color: 'var(--status-down)',
        };
      case 'success':
        return {
          bg: 'var(--status-up-bg)',
          border: 'var(--status-up-border)',
          color: 'var(--status-up)',
        };
      case 'aqua':
        return {
          bg: 'var(--accent-aqua-light)',
          border: 'var(--accent-aqua-border)',
          color: 'var(--accent-aqua-active)',
        };
      default:
        return {
          bg: 'var(--bg-muted)',
          border: 'var(--border-subtle)',
          color: 'var(--text-secondary)',
        };
    }
  };

  const current = getStyles();

  return (
    <div style={{
      padding: '0.875rem 1.125rem',
      backgroundColor: current.bg,
      border: `1px solid ${current.border}`,
      borderRadius: 'var(--radius-md)',
      color: current.color,
      fontSize: '0.875rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '1rem',
      ...style
    }}>
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{title}</div>}
        <div>{children}</div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
