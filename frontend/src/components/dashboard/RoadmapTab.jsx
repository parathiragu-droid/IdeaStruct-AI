import SectionIntro from '../common/SectionIntro';
import TechnicalDetails from '../common/TechnicalDetails';
import { resolveFeatureNames, resolvePhaseTitles } from '../../utils/entityResolvers';
import { normalizeRoadmap, safeString } from '../../utils/roadmapNormalizer';

/**
 * RoadmapTab Component
 *
 * Displays recommended build roadmap phases ordered by architectural dependency,
 * avoiding artificial delivery dates or fake progress bars.
 * Resilient against all valid roadmap data shapes (Software, Hardware, Hybrid).
 */
export default function RoadmapTab({ blueprint }) {
  const roadmap = normalizeRoadmap(blueprint?.roadmap);
  const features = Array.isArray(blueprint?.features) ? blueprint.features.filter(Boolean) : [];

  const ACCENT_COLORS = ['var(--accent-cyan)', 'var(--accent-purple)', 'var(--accent-orange)', 'var(--accent-green)'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <SectionIntro
        title="Build Roadmap"
        explanation="The roadmap suggests a practical order for building the project."
        technicalDetails={
          <div>
            <div>
              💡 <strong>Development Roadmap:</strong> Organized by dependency ordering and testable completion criteria, avoiding artificial delivery dates.
            </div>
            <div style={{ marginTop: '0.375rem' }}>
              <strong>Schema Section:</strong> <code>blueprint.roadmap</code> (Phased milestone and dependency graph).
            </div>
          </div>
        }
      />

      {roadmap.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
          <p style={{ margin: 0, fontWeight: 500, fontSize: '0.9375rem' }}>
            Roadmap information is not available for this project.
          </p>
          <p style={{ margin: '0.375rem 0 0 0', fontSize: '0.8125rem' }}>
            No roadmap phases are currently defined.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {roadmap.map((phase, idx) => {
            const featureNames = resolveFeatureNames(phase.featureIds, features);
            const dependencyTitles = resolvePhaseTitles(phase.dependsOnPhaseIds, roadmap);
            const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];

            return (
              <div key={phase.id || `phase-${idx}`} className="card" style={{ borderLeft: `4px solid ${accent}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span
                      aria-label={`Phase ${idx + 1}`}
                      title={`Phase ${idx + 1}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: accent,
                        color: '#08131F',
                        fontSize: '0.8125rem',
                        fontWeight: 800,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {phase.title}
                    </h4>
                    {phase.duration && (
                      <span className="badge badge-purple" style={{ fontSize: '0.6875rem' }}>
                        ⏱️ {phase.duration}
                      </span>
                    )}
                  </div>

                  {/* Resolved Dependencies */}
                  {dependencyTitles.length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Depends on:</span>
                      {dependencyTitles.map((depTitle, i) => (
                        <span key={i} className="badge badge-purple badge-aqua" style={{ fontSize: '0.6875rem' }}>
                          {safeString(depTitle)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="badge badge-green badge-up" style={{ fontSize: '0.6875rem' }}>
                      No previous phase required.
                    </span>
                  )}
                </div>

                {phase.description ? (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                    {phase.description}
                  </p>
                ) : null}

                {featureNames.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    <strong>Linked Features:</strong> {featureNames.join(', ')}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {/* Tasks List */}
                  <div style={{ padding: '0.875rem', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                    <h5 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Main Tasks
                    </h5>
                    {phase.tasks && phase.tasks.length > 0 ? (
                      <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                        {phase.tasks.map((task, tIdx) => (
                          <li key={tIdx} style={{ marginBottom: '0.25rem' }}>{safeString(task)}</li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>No explicit tasks listed.</p>
                    )}
                  </div>

                  {/* Completion Criteria */}
                  <div style={{ padding: '0.875rem', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                    <h5 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Completion Criteria
                    </h5>
                    {phase.completionCriteria && phase.completionCriteria.length > 0 ? (
                      <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                        {phase.completionCriteria.map((crit, cIdx) => (
                          <li key={cIdx} style={{ marginBottom: '0.25rem' }}>{safeString(crit)}</li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Standard test passage & review.</p>
                    )}
                  </div>
                </div>

                {/* Optional Milestones / Deliverables */}
                {phase.milestones && phase.milestones.length > 0 && (
                  <div style={{ marginTop: '0.75rem', padding: '0.625rem 0.875rem', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                    <h5 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                      Deliverables & Milestones
                    </h5>
                    <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                      {phase.milestones.map((m, mIdx) => (
                        <li key={mIdx} style={{ marginBottom: '0.25rem' }}>{safeString(m)}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Collapsed Technical Details */}
                <TechnicalDetails summary="Phase technical details" style={{ marginTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div><strong>Phase ID:</strong> <code>{safeString(phase.id)}</code></div>
                    <div><strong>Depends on Phase IDs:</strong> <code>{Array.isArray(phase.dependsOnPhaseIds) && phase.dependsOnPhaseIds.length > 0 ? phase.dependsOnPhaseIds.join(', ') : 'none'}</code></div>
                    <div><strong>Linked Feature IDs:</strong> <code>{Array.isArray(phase.featureIds) && phase.featureIds.length > 0 ? phase.featureIds.join(', ') : 'none'}</code></div>
                  </div>
                </TechnicalDetails>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
