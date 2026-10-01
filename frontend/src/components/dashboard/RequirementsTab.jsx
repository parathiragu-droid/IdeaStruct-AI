import { useState } from 'react';
import SectionIntro from '../common/SectionIntro';
import TechnicalDetails from '../common/TechnicalDetails';
import { resolveFeatureNames } from '../../utils/entityResolvers';

/**
 * RequirementsTab Component
 *
 * Displays functional and non-functional requirements with friendly source provenance,
 * resolved linked feature names, and actionable verification criteria.
 */
export default function RequirementsTab({ blueprint }) {
  // Defensively normalize requirements and features arrays
  const rawRequirements = blueprint?.requirements;
  let requirements = [];
  if (Array.isArray(rawRequirements)) {
    requirements = rawRequirements.map((r, idx) => {
      if (!r) return null;
      if (typeof r === 'string') {
        return {
          id: `req-legacy-${idx + 1}`,
          description: r,
          type: 'FUNCTIONAL',
          source: 'SUGGESTED',
          acceptanceCriteria: [],
          featureIds: [],
        };
      }
      return r;
    }).filter(Boolean);
  } else if (rawRequirements && typeof rawRequirements === 'object') {
    const fn = Array.isArray(rawRequirements.functional) ? rawRequirements.functional : [];
    const nfn = Array.isArray(rawRequirements.nonFunctional) ? rawRequirements.nonFunctional : [];
    requirements = [
      ...fn.map((r, idx) => typeof r === 'string' ? { id: `req-fn-${idx + 1}`, description: r, type: 'FUNCTIONAL', source: 'SUGGESTED', acceptanceCriteria: [], featureIds: [] } : { ...r, type: 'FUNCTIONAL' }),
      ...nfn.map((r, idx) => typeof r === 'string' ? { id: `req-nfn-${idx + 1}`, description: r, type: 'NON_FUNCTIONAL', source: 'SUGGESTED', acceptanceCriteria: [], featureIds: [] } : { ...r, type: 'NON_FUNCTIONAL' }),
    ];
  }

  const rawFeatures = blueprint?.features;
  const features = Array.isArray(rawFeatures)
    ? rawFeatures.filter((f) => f && typeof f === 'object')
    : [];

  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'FUNCTIONAL', 'NON_FUNCTIONAL'

  const functionalCount = requirements.filter((r) => (r.type || 'FUNCTIONAL').toUpperCase() === 'FUNCTIONAL').length;
  const nonFunctionalCount = requirements.filter((r) => (r.type || '').toUpperCase() === 'NON_FUNCTIONAL').length;

  const filtered = requirements.filter((req) => {
    if (filterType === 'ALL') return true;
    const reqType = (req.type || 'FUNCTIONAL').toUpperCase();
    return reqType === filterType;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <SectionIntro
        title="Detailed Requirements"
        explanation="Requirements describe what the software should do and how well it should work."
        technicalDetails={
          <div>
            <div><strong>Schema Section:</strong> <code>blueprint.requirements</code></div>
            <div><strong>Traceability:</strong> Requirements must link to valid feature IDs and establish testable acceptance criteria.</div>
          </div>
        }
      />

      {/* Filter Bar with Plain-Language Descriptions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className="btn btn-secondary"
            style={{
              fontSize: '0.8125rem',
              padding: '0.375rem 0.875rem',
              backgroundColor: filterType === 'ALL' ? 'rgba(22, 217, 227, 0.15)' : 'var(--bg-elevated)',
              color: filterType === 'ALL' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              borderColor: filterType === 'ALL' ? 'var(--accent-cyan)' : 'var(--border-default)',
              fontWeight: filterType === 'ALL' ? 700 : 500,
            }}
          >
            All Requirements ({requirements.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('FUNCTIONAL')}
            className="btn btn-secondary"
            title="What the system should do."
            style={{
              fontSize: '0.8125rem',
              padding: '0.375rem 0.875rem',
              backgroundColor: filterType === 'FUNCTIONAL' ? 'rgba(51, 136, 255, 0.18)' : 'var(--bg-elevated)',
              color: filterType === 'FUNCTIONAL' ? 'var(--accent-blue)' : 'var(--text-secondary)',
              borderColor: filterType === 'FUNCTIONAL' ? 'var(--accent-blue)' : 'var(--border-default)',
              fontWeight: filterType === 'FUNCTIONAL' ? 700 : 500,
            }}
          >
            Functional ({functionalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('NON_FUNCTIONAL')}
            className="btn btn-secondary"
            title="How the system should perform or behave."
            style={{
              fontSize: '0.8125rem',
              padding: '0.375rem 0.875rem',
              backgroundColor: filterType === 'NON_FUNCTIONAL' ? 'rgba(139, 92, 246, 0.18)' : 'var(--bg-elevated)',
              color: filterType === 'NON_FUNCTIONAL' ? 'var(--accent-purple)' : 'var(--text-secondary)',
              borderColor: filterType === 'NON_FUNCTIONAL' ? 'var(--accent-purple)' : 'var(--border-default)',
              fontWeight: filterType === 'NON_FUNCTIONAL' ? 700 : 500,
            }}
          >
            Non-Functional ({nonFunctionalCount})
          </button>
        </div>

        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {filterType === 'FUNCTIONAL' && 'Functional: What the system should do.'}
          {filterType === 'NON_FUNCTIONAL' && 'Non-Functional: How the system should perform or behave.'}
          {filterType === 'ALL' && 'Showing all system specifications'}
        </div>
      </div>

      {/* Requirements List or Empty State */}
      {requirements.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-card)',
            border: '1px dashed var(--border-default)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            No requirements available for this project.
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
            This blueprint does not currently define specific functional or non-functional requirements.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
          No requirements match the selected filter.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((req, reqIdx) => {
            const rawReqFeatureIds = Array.isArray(req.featureIds)
              ? req.featureIds
              : typeof req.featureIds === 'string'
              ? [req.featureIds]
              : [];
            const featureNames = resolveFeatureNames(rawReqFeatureIds, features);
            const isUserStated = req.source === 'USER_STATED';
            const isFunctional = (req.type || 'FUNCTIONAL').toUpperCase() === 'FUNCTIONAL';

            const rawCriteria = Array.isArray(req.acceptanceCriteria)
              ? req.acceptanceCriteria
              : typeof req.acceptanceCriteria === 'string'
              ? [req.acceptanceCriteria]
              : [];

            const reqKey = req.id || `req-item-${reqIdx}`;

            return (
              <div
                key={reqKey}
                className="card"
                style={{
                  borderLeft: isFunctional ? '3px solid var(--accent-blue)' : '3px solid var(--accent-purple)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      className={`badge ${isFunctional ? 'badge-blue' : 'badge-purple'}`}
                      style={{ fontSize: '0.6875rem' }}
                    >
                      {isFunctional ? 'Functional' : 'Non-Functional'}
                    </span>
                  </div>

                  {/* Friendly Source Label */}
                  <span
                    className={`badge ${isUserStated ? 'badge-green badge-up' : 'badge-neutral'}`}
                    style={{ fontSize: '0.6875rem' }}
                  >
                    {isUserStated ? 'From your idea' : 'Suggested by AI'}
                  </span>
                </div>

                <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '0.875rem' }}>
                  {req.description || 'No requirement description provided.'}
                </p>

                {/* Acceptance Criteria */}
                {rawCriteria.length > 0 && (
                  <div style={{ marginBottom: '0.875rem' }}>
                    <h5 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                      How can we verify this?
                    </h5>
                    <ul style={{ paddingLeft: 0, listStyle: 'none', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                      {rawCriteria.map((ac, idx) => (
                        <li key={idx} style={{ marginBottom: '0.375rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                          <span style={{ color: 'var(--accent-green)', fontWeight: 700, fontSize: '0.875rem' }}>✓</span>
                          <span>{String(ac)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Linked Features Resolved */}
                {featureNames.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    <strong>Linked Features:</strong> {featureNames.join(', ')}
                  </div>
                )}

                {/* Technical Details Collapsed */}
                <TechnicalDetails summary="Technical details" style={{ marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div><strong>Requirement ID:</strong> <code>{req.id || 'N/A'}</code></div>
                    <div><strong>Raw Type:</strong> <code>{req.type || 'FUNCTIONAL'}</code></div>
                    <div><strong>Linked Feature IDs:</strong> <code>{rawReqFeatureIds.length > 0 ? rawReqFeatureIds.join(', ') : 'none'}</code></div>
                    <div><strong>Source Enum:</strong> <code>{req.source || 'SUGGESTED'}</code></div>
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
