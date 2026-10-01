import SectionIntro from '../common/SectionIntro';
import TechnicalDetails from '../common/TechnicalDetails';
import { resolveRoleNames, resolveFeatureNames, resolveScreenName } from '../../utils/entityResolvers';

/**
 * ScreensTab Component
 *
 * Displays UI screen specifications with resolved role access, linked features,
 * UI components, possible screen states, and resolved navigation action targets.
 */
export default function ScreensTab({ blueprint }) {
  const screens = Array.isArray(blueprint?.uiScreens) ? blueprint.uiScreens : (Array.isArray(blueprint?.software?.screens) ? blueprint.software.screens : []);
  const roles = Array.isArray(blueprint?.roles) ? blueprint.roles : [];
  const features = Array.isArray(blueprint?.features) ? blueprint.features : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <SectionIntro
        title="App Screens"
        explanation="App Screens are the pages or views users may interact with."
        technicalDetails={
          <div>
            <div><strong>Schema Section:</strong> <code>blueprint.uiScreens</code></div>
            <div><strong>Interaction Model:</strong> Screen routes, states, and user navigation actions validated deterministically for broken transitions.</div>
          </div>
        }
      />

      {screens.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
          No App Screens are currently listed.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {screens.map((screen) => {
            const roleNames = resolveRoleNames(screen.roleIds, roles);
            const featureNames = resolveFeatureNames(screen.featureIds, features);

            return (
              <div
                key={screen.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: '3px solid var(--accent-purple)',
                  padding: '1.25rem',
                }}
              >
                <div>
                  {/* App Window Header Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem', opacity: 0.8 }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-red)' }} />
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-orange)' }} />
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-green)' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontFamily: 'var(--font-mono)' }}>Screen View</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {screen.name}
                    </h4>
                    {screen.route && (
                      <code style={{ fontSize: '0.8125rem', backgroundColor: 'var(--bg-elevated)', padding: '0.125rem 0.5rem', borderRadius: '4px', color: 'var(--accent-cyan)', border: '1px solid var(--border-default)' }}>
                        {screen.route}
                      </code>
                    )}
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    {screen.purpose}
                  </p>

                  {/* Used By & Related Features */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>
                    {roleNames.length > 0 && (
                      <div>
                        <strong>Used by:</strong> {roleNames.join(', ')}
                      </div>
                    )}
                    {featureNames.length > 0 && (
                      <div>
                        <strong>Related features:</strong> {featureNames.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Components */}
                  {screen.components && screen.components.length > 0 && (
                    <div style={{ marginBottom: '0.875rem' }}>
                      <h5 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                        Components
                      </h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {screen.components.map((comp, idx) => (
                          <span key={idx} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Possible Screen States */}
                  {screen.states && screen.states.length > 0 && (
                    <div style={{ marginBottom: '0.875rem' }}>
                      <h5 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                        Possible screen states
                      </h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {screen.states.map((st, idx) => (
                          <span key={idx} className="badge badge-purple badge-aqua" style={{ fontSize: '0.6875rem' }}>
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions with Resolved Target Screen Names */}
                <div>
                  {screen.actions && screen.actions.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                      <h5 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                        Navigation & User Actions
                      </h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        {screen.actions.map((act) => {
                          const targetName = act.targetScreenId
                            ? resolveScreenName(act.targetScreenId, screens)
                            : null;

                          return (
                            <div key={act.id} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span><strong>{act.label}</strong> ({act.kind})</span>
                              {targetName && (
                                <span style={{ color: 'var(--accent-aqua)', fontSize: '0.75rem', fontWeight: 600 }}>
                                  ➔ opens "{targetName}"
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Collapsed Technical Details */}
                  <TechnicalDetails summary="Screen technical details" style={{ marginTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div><strong>Screen ID:</strong> <code>{screen.id}</code></div>
                      <div><strong>Linked Role IDs:</strong> <code>{screen.roleIds?.join(', ') || 'none'}</code></div>
                      <div><strong>Linked Feature IDs:</strong> <code>{screen.featureIds?.join(', ') || 'none'}</code></div>
                    </div>
                  </TechnicalDetails>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
