import { useState } from 'react';
import SectionIntro from '../common/SectionIntro';
import TechnicalDetails from '../common/TechnicalDetails';
import { resolveRoleName, resolveFeatureName, resolveScreenName } from '../../utils/entityResolvers';

/**
 * Helper to resolve an affected entity ID to a friendly name.
 */
function resolveEntityId(id, blueprint = {}) {
  if (!id || typeof id !== 'string') return '';
  const bp = blueprint || {};
  if (id.startsWith('role-')) {
    return resolveRoleName(id, bp.roles);
  }
  if (id.startsWith('feature-')) {
    return resolveFeatureName(id, bp.features);
  }
  if (id.startsWith('screen-')) {
    return resolveScreenName(id, bp.uiScreens || bp.software?.screens);
  }
  if (id.startsWith('col-')) {
    const rawCols = bp.database?.collections || bp.software?.database?.collections;
    const cols = Array.isArray(rawCols) ? rawCols : [];
    const col = cols.find((c) => c && c.id === id);
    return col ? `${col.name || id} collection` : id;
  }
  if (id.startsWith('api-')) {
    const rawApis = bp.apis || bp.software?.apis;
    const apis = Array.isArray(rawApis) ? rawApis : [];
    const api = apis.find((a) => a && a.id === id);
    return api ? `${api.method || 'API'} ${api.path || api.endpoint || ''}`.trim() : id;
  }
  if (id.startsWith('phase-')) {
    const phases = bp.roadmap?.phases || (Array.isArray(bp.roadmap) ? bp.roadmap : []);
    const ph = Array.isArray(phases) ? phases.find((p) => p && p.id === id) : null;
    return ph ? ph.title : id;
  }
  if (id.startsWith('comp-')) {
    const rawComps = bp.hardware?.components;
    const comps = Array.isArray(rawComps) ? rawComps : [];
    const comp = comps.find((c) => c && c.id === id);
    return comp ? comp.name : id;
  }
  if (id.startsWith('conn-')) {
    const rawConns = bp.hardware?.connections;
    const conns = Array.isArray(rawConns) ? rawConns : [];
    const conn = conns.find((c) => c && c.id === id);
    return conn ? `Wire ${conn.fromPin || ''} ↔ ${conn.toPin || ''}` : id;
  }
  return id;
}

export default function ValidationTab({ project, blueprint, onRevalidate, revalidating, onSelectTab }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const rawIssues = project?.validationIssues || [];
  const issues = Array.isArray(rawIssues)
    ? rawIssues.filter((i) => i && typeof i === 'object')
    : [];
  const checkedAt = project?.validationCheckedAt;
  const bp = blueprint || project?.blueprint || {};

  const errorCount = issues.filter((i) => (i.severity || '').toUpperCase() === 'ERROR').length;
  const warningCount = issues.filter((i) => (i.severity || '').toUpperCase() === 'WARNING').length;
  const infoCount = issues.filter((i) => (i.severity || '').toUpperCase() === 'INFO').length;
  const clarCount = issues.filter((i) => (i.severity || '').toUpperCase() === 'NEEDS_CLARIFICATION').length;

  const filteredIssues = filterSeverity === 'ALL'
    ? issues
    : issues.filter((i) => (i.severity || '').toUpperCase() === filterSeverity);

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'ERROR':
        return {
          bg: 'rgba(255, 94, 122, 0.12)',
          border: 'rgba(255, 94, 122, 0.35)',
          text: 'var(--accent-red)',
          icon: '🚨',
          label: 'Error',
          meaning: 'Something important is structurally broken.',
        };
      case 'WARNING':
        return {
          bg: 'rgba(255, 181, 71, 0.12)',
          border: 'rgba(255, 181, 71, 0.35)',
          text: 'var(--accent-orange)',
          icon: '⚠️',
          label: 'Warning',
          meaning: 'Something may need attention.',
        };
      case 'NEEDS_CLARIFICATION':
        return {
          bg: 'rgba(139, 92, 246, 0.12)',
          border: 'rgba(139, 92, 246, 0.35)',
          text: 'var(--accent-purple)',
          icon: '❓',
          label: 'Needs Clarification',
          meaning: 'More information is needed.',
        };
      case 'INFO':
      default:
        return {
          bg: 'rgba(22, 217, 227, 0.12)',
          border: 'rgba(22, 217, 227, 0.35)',
          text: 'var(--accent-cyan)',
          icon: 'ℹ️',
          label: 'Info',
          meaning: 'Useful planning note.',
        };
    }
  };

  const inferTargetTab = (ruleCode, affectedIds = []) => {
    if (ruleCode.includes('API')) return 'apis';
    if (ruleCode.includes('SCREEN') || ruleCode.includes('UI')) return 'screens';
    if (ruleCode.includes('RELATIONSHIP') || ruleCode.includes('COLLECTION') || ruleCode.includes('PERSISTENCE')) return 'database';
    if (ruleCode.includes('ROADMAP') || ruleCode.includes('PHASE')) return 'roadmap';
    if (ruleCode.includes('ROLE')) return 'roles';
    if (ruleCode.includes('REQUIREMENT')) return 'requirements';
    if (ruleCode.includes('FEATURE')) return 'features';
    if (ruleCode.includes('QUESTION') || ruleCode.includes('ASSUMPTION')) return 'overview';
    if (ruleCode.includes('ESTIMATE')) return 'estimates';
    if (ruleCode.includes('3D')) return 'threedmodel';
    if (ruleCode.includes('HW_UNKNOWN') || ruleCode.includes('CONN')) return 'connections';
    if (ruleCode.includes('HW') || ruleCode.includes('CONTROLLER') || ruleCode.includes('SENSOR') || ruleCode.includes('POWER')) return 'components';
    if (ruleCode.includes('HYBRID')) return 'architecture';

    for (const id of affectedIds) {
      if (id.startsWith('api-')) return 'apis';
      if (id.startsWith('screen-') || id.startsWith('act-')) return 'screens';
      if (id.startsWith('col-') || id.startsWith('rel-')) return 'database';
      if (id.startsWith('phase-')) return 'roadmap';
      if (id.startsWith('role-')) return 'roles';
      if (id.startsWith('req-')) return 'requirements';
      if (id.startsWith('feature-')) return 'features';
      if (id.startsWith('comp-')) return 'components';
      if (id.startsWith('conn-')) return 'connections';
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <SectionIntro
        title="Plan Check"
        explanation="Plan Check looks for missing links, conflicts, or unclear parts in your Project Plan."
        technicalDetails={
          <div>
            <div>
              <strong>Validation Rule Engine:</strong> Deterministic, reproducible, server-side rule engine validating cross-entity reference integrity, route collisions, and model completeness without external AI dependency.
            </div>
          </div>
        }
        actions={
          <button
            type="button"
            onClick={onRevalidate}
            disabled={revalidating}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
          >
            <span>{revalidating ? '⏳' : '🔄'}</span>
            <span>{revalidating ? 'Running Plan Check...' : 'Run Plan Check'}</span>
          </button>
        }
      />

      {checkedAt && (
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '-0.75rem' }}>
          Last evaluated: {new Date(checkedAt).toLocaleTimeString()} ({new Date(checkedAt).toLocaleDateString()})
        </div>
      )}

      {/* Severity Meaning Explanation Banner */}
      <div className="card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--bg-muted)' }}>
        <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Understanding Check Results:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.625rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div>
            <strong>🚨 Error:</strong> Something important is structurally broken.
          </div>
          <div>
            <strong>⚠️ Warning:</strong> Something may need attention.
          </div>
          <div>
            <strong>❓ Needs Clarification:</strong> More information is needed.
          </div>
          <div>
            <strong>ℹ️ Info:</strong> Useful planning note.
          </div>
        </div>
      </div>

      {/* Severity Filter Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.75rem'
      }}>
        {[
          { key: 'ALL', label: 'All Findings', count: issues.length, icon: '📋', color: 'var(--text-primary)' },
          { key: 'ERROR', label: 'Errors', count: errorCount, icon: '🚨', color: 'var(--accent-red)' },
          { key: 'WARNING', label: 'Warnings', count: warningCount, icon: '⚠️', color: 'var(--accent-orange)' },
          { key: 'NEEDS_CLARIFICATION', label: 'Needs Clarification', count: clarCount, icon: '❓', color: 'var(--accent-purple)' },
          { key: 'INFO', label: 'Info', count: infoCount, icon: 'ℹ️', color: 'var(--accent-cyan)' },
        ].map((item) => {
          const isSelected = filterSeverity === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilterSeverity(item.key)}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                border: isSelected ? `2px solid ${item.color}` : '1px solid var(--border-default)',
                backgroundColor: isSelected ? 'var(--bg-elevated)' : 'var(--bg-card)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: item.color, marginTop: '0.125rem' }}>
                  {item.count}
                </div>
              </div>
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
            </button>
          );
        })}
      </div>

      {/* Findings List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredIssues.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '2.5rem 1.5rem',
              backgroundColor: 'rgba(55, 217, 150, 0.08)',
              border: '1px solid rgba(55, 217, 150, 0.35)',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-green)', marginBottom: '0.5rem' }}>
              {filterSeverity === 'ALL'
                ? 'No issues were found by the currently implemented Plan Check rules.'
                : `No issues matching severity "${filterSeverity}"`}
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
              No issues were found by the currently implemented validation rules. Deterministic structural checks passed for all declared entities. Note: Passing automated validation rules does not guarantee product-market fit or replace human architectural review.
            </p>
            <div style={{
              display: 'inline-block',
              textAlign: 'left',
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              maxWidth: '560px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.25rem' }}>
                Executed Validation Categories:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', listStyleType: 'disc' }}>
                <li>Entity ID uniqueness across all blueprint sections</li>
                <li>Cross-entity reference integrity (roles, features, APIs, screens, roadmap, DB)</li>
                <li>Feature coverage verification (needsApi, needsUi, needsPersistence)</li>
                <li>Interactive role UI screen coverage</li>
                <li>Database relationship integrity, field mapping & cardinality allowlist</li>
                <li>Normalized API route and parameter collision detection</li>
                <li>UI screen navigation targets and action validity</li>
                <li>Roadmap dependency integrity, self-dependencies & cycle detection</li>
                <li>User-stated requirement acceptance criteria & feature linking</li>
                <li>Architectural assumptions & open questions tracking</li>
              </ul>
            </div>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const style = getSeverityStyle(issue.severity);
            const targetTab = inferTargetTab(issue.ruleCode, issue.affectedEntityIds);
            const resolvedEntityNames = (issue.affectedEntityIds || []).map((id) => resolveEntityId(id, bp));

            return (
              <div
                key={issue.id}
                className="card"
                style={{
                  borderLeft: `4px solid ${style.border}`,
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {/* Top header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: style.bg,
                        color: style.text,
                        border: `1px solid ${style.border}`,
                      }}
                    >
                      <span>{style.icon}</span>
                      <span>{style.label}</span>
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {style.meaning}
                    </span>
                  </div>

                  {targetTab && onSelectTab && (
                    <button
                      type="button"
                      onClick={() => onSelectTab(targetTab)}
                      className="btn btn-ghost"
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.625rem',
                        color: 'var(--accent-aqua)',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <span>Go to {targetTab}</span>
                      <span>→</span>
                    </button>
                  )}
                </div>

                {/* Plain Message First */}
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {issue.message}
                </div>

                {/* Resolved Affected Entities */}
                {resolvedEntityNames.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap', fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Related Items:
                    </span>
                    {resolvedEntityNames.map((name, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-muted)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Evidence & Suggested Action */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: issue.evidence && issue.suggestedAction ? 'repeat(auto-fit, minmax(260px, 1fr))' : '1fr',
                  gap: '0.75rem',
                  fontSize: '0.8125rem',
                }}>
                  {issue.evidence && (
                    <div style={{
                      padding: '0.625rem 0.75rem',
                      backgroundColor: 'var(--bg-muted)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        Why this was flagged:
                      </div>
                      <div style={{ color: 'var(--text-primary)', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                        {issue.evidence}
                      </div>
                    </div>
                  )}

                  {issue.suggestedAction && (
                    <div style={{
                      padding: '0.625rem 0.75rem',
                      backgroundColor: '#FEFCE8',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #FEF08A',
                    }}>
                      <div style={{ fontWeight: 600, color: '#854D0E', marginBottom: '0.25rem' }}>
                        Suggested action:
                      </div>
                      <div style={{ color: '#713F12', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                        {issue.suggestedAction}
                      </div>
                    </div>
                  )}
                </div>

                {/* Technical Rule Details Collapsed */}
                <TechnicalDetails summary="Technical rule details" style={{ marginTop: '0.25rem' }}>
                  <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div><strong>Rule Code:</strong> <code>{issue.ruleCode}</code></div>
                    <div><strong>Affected Entity IDs:</strong> <code>{issue.affectedEntityIds?.join(', ') || 'none'}</code></div>
                    <div><strong>Source:</strong> <code>{issue.source || 'SERVER_DETERMINISTIC'}</code></div>
                    <div><strong>Status:</strong> <code>{issue.status || 'ACTIVE'}</code></div>
                  </div>
                </TechnicalDetails>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
