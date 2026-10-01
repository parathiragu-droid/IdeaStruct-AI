/**
 * TechnicalDetails component
 *
 * Uses native accessible <details> and <summary> disclosure behavior.
 * Collapsed by default so beginner users are not overwhelmed by raw IDs,
 * rule codes, schema details, or revision counters.
 */
export default function TechnicalDetails({
  summary = 'Technical details',
  children,
  badge = null,
  style = {},
  className = '',
}) {
  if (!children) return null;

  return (
    <details
      className={`technical-details ${className}`.trim()}
      style={style}
    >
      <summary>
        <span>{summary}</span>
        {badge && (
          <span className="badge badge-technical" style={{ marginLeft: 'auto' }}>
            {badge}
          </span>
        )}
      </summary>
      <div className="technical-details-content">
        {children}
      </div>
    </details>
  );
}
