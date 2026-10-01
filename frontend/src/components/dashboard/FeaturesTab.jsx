import SectionIntro from '../common/SectionIntro';
import TechnicalDetails from '../common/TechnicalDetails';
import { resolveRoleNames } from '../../utils/entityResolvers';

/**
 * FeaturesTab Component
 *
 * Displays prioritized system features with plain-language capability indicators
 * and resolved linked role names. Technical IDs and booleans are collapsed.
 */
export default function FeaturesTab({ blueprint }) {
  const features = Array.isArray(blueprint?.features) ? blueprint.features.filter(Boolean) : [];
  const roles = Array.isArray(blueprint?.roles) ? blueprint.roles.filter(Boolean) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <SectionIntro
        title="Main Features"
        explanation="Core functional capabilities planned for this software application."
        technicalDetails={
          <div>
            <div><strong>Schema Section:</strong> <code>blueprint.features</code></div>
            <div><strong>Capability Flags:</strong> Evaluated by deterministic validation engine to ensure matching APIs, screens, and database schemas exist.</div>
          </div>
        }
      />

      {features.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
          No system features are currently proposed.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {features.map((feat) => {
            const roleNames = resolveRoleNames(feat.roleIds, roles);
            return (
              <div
                key={feat.id}
                className="card"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {feat.name}
                    </h4>
                    {feat.priority && (
                      <span
                        className={`badge ${
                          feat.priority === 'HIGH'
                            ? 'badge-coral badge-down'
                            : feat.priority === 'MEDIUM'
                            ? 'badge-amber badge-warn'
                            : 'badge-green badge-aqua'
                        }`}
                        style={{ fontSize: '0.6875rem', fontWeight: 700 }}
                      >
                        {feat.priority}
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                    {feat.description}
                  </p>
                </div>

                <div>
                  {/* Friendly Capability Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.75rem' }}>
                    {feat.needsUi && (
                      <span className="badge badge-cyan badge-aqua" style={{ fontSize: '0.6875rem' }}>
                        Needs App Screen
                      </span>
                    )}
                    {feat.needsApi && (
                      <span className="badge badge-blue" style={{ fontSize: '0.6875rem' }}>
                        Needs Backend API
                      </span>
                    )}
                    {feat.needsPersistence && (
                      <span className="badge badge-purple" style={{ fontSize: '0.6875rem' }}>
                        Needs Data Storage
                      </span>
                    )}
                  </div>

                  {/* Resolved Role Names */}
                  {roleNames.length > 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      <strong>Used by:</strong> {roleNames.join(', ')}
                    </div>
                  )}

                  {/* Technical Details Collapsed */}
                  <TechnicalDetails summary="Technical details" style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem' }}>
                      <div><strong>Feature ID:</strong> <code>{feat.id}</code></div>
                      <div><strong>Linked Role IDs:</strong> <code>{feat.roleIds?.join(', ') || 'none'}</code></div>
                      <div><strong>needsApi:</strong> {String(feat.needsApi)}</div>
                      <div><strong>needsUi:</strong> {String(feat.needsUi)}</div>
                      <div><strong>needsPersistence:</strong> {String(feat.needsPersistence)}</div>
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
