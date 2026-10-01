import TechnicalDetails from './TechnicalDetails';

/**
 * SectionIntro component
 *
 * Displays a beginner-friendly title and plain-language explanation,
 * with optional collapsed technical details and action buttons.
 */
export default function SectionIntro({
  title,
  explanation,
  technicalDetails = null,
  actions = null,
  icon = null,
  style = {},
}) {
  return (
    <div
      className="section-header"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginBottom: '1.25rem',
        ...style,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {icon && <span>{icon}</span>}
            <span>{title}</span>
          </h3>
          {explanation && (
            <p className="section-description">
              {explanation}
            </p>
          )}
        </div>
        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {actions}
          </div>
        )}
      </div>

      {technicalDetails && (
        <TechnicalDetails summary="Architecture & schema details">
          {technicalDetails}
        </TechnicalDetails>
      )}
    </div>
  );
}
