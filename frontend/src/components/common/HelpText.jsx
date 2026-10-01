/**
 * HelpText component
 *
 * For short beginner explanations, input guidance, or clarifying tips.
 */
export default function HelpText({
  children,
  icon = '💡',
  variant = 'muted', // 'muted' or 'box'
  style = {},
}) {
  if (!children) return null;

  if (variant === 'box') {
    return (
      <div className="beginner-help" style={style}>
        {icon && <span style={{ fontSize: '1rem', lineHeight: 1 }}>{icon}</span>}
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <p
      className="helper-text"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        marginTop: '0.375rem',
        ...style,
      }}
    >
      {icon && <span style={{ fontSize: '0.875rem' }}>{icon}</span>}
      <span>{children}</span>
    </p>
  );
}
