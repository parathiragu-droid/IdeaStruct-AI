import { useState } from 'react';
import SectionIntro from '../common/SectionIntro';
import TechnicalDetails from '../common/TechnicalDetails';
import { resolveRoleNames, resolveFeatureNames } from '../../utils/entityResolvers';

/**
 * ApisTab Component
 *
 * Displays REST API architecture specifications leading with human-friendly purpose,
 * authorized roles, linked features, and collapsed request/response examples.
 */
export default function ApisTab({ blueprint }) {
  const apis = Array.isArray(blueprint?.apis) ? blueprint.apis : (Array.isArray(blueprint?.software?.apis) ? blueprint.software.apis : []);
  const roles = Array.isArray(blueprint?.roles) ? blueprint.roles : [];
  const features = Array.isArray(blueprint?.features) ? blueprint.features : [];
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getMethodBadgeClass = (method) => {
    switch (method) {
      case 'GET': return 'badge-blue';
      case 'POST': return 'badge-green badge-up';
      case 'PUT':
      case 'PATCH': return 'badge-amber badge-warn';
      case 'DELETE': return 'badge-coral badge-down';
      default: return 'badge';
    }
  };

  const getMethodBorder = (method) => {
    switch (method) {
      case 'GET': return '3px solid var(--accent-blue)';
      case 'POST': return '3px solid var(--accent-green)';
      case 'PUT':
      case 'PATCH': return '3px solid var(--accent-orange)';
      case 'DELETE': return '3px solid var(--accent-red)';
      default: return '1px solid var(--border-default)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <SectionIntro
        title="Backend APIs"
        explanation="Backend APIs describe how the app may request or update information."
        technicalDetails={
          <div>
            <div>
              💡 <strong>REST Architecture Specification:</strong> These endpoints specify the contract for your future backend service. They are architectural blueprints, not currently deployed live endpoints.
            </div>
            <div style={{ marginTop: '0.375rem' }}>
              <strong>Schema Section:</strong> <code>blueprint.apis</code> (REST endpoint architecture contracts).
            </div>
          </div>
        }
      />

      {apis.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
          No Backend APIs are currently proposed.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {apis.map((api) => {
            const roleNames = resolveRoleNames(api.roleIds, roles);
            const featureNames = resolveFeatureNames(api.featureIds, features);

            return (
              <div
                key={api.id}
                className="card"
                style={{ borderLeft: getMethodBorder(api.method) }}
              >
                {/* Purpose First */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {api.purpose || 'Backend Endpoint'}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.375rem' }}>
                      <span className={`badge ${getMethodBadgeClass(api.method)}`} style={{ fontWeight: 800, fontSize: '0.75rem' }}>
                        {api.method}
                      </span>
                      <code style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {api.path}
                      </code>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className={`badge ${api.authRequired ? 'badge-amber badge-warn' : 'badge-green badge-up'}`} style={{ fontSize: '0.6875rem' }}>
                      {api.authRequired ? 'Authentication: Required' : 'Authentication: Not required'}
                    </span>
                    <span className="badge badge-cyan badge-aqua" style={{ fontSize: '0.6875rem' }}>
                      Success: HTTP {api.successStatus}
                    </span>
                  </div>
                </div>

                {/* Who Can Use It & Related Features */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.75rem 0 1rem' }}>
                  <div>
                    <strong>Who can use it?</strong> {roleNames.length > 0 ? roleNames.join(', ') : 'Any authorized user'}
                  </div>
                  {featureNames.length > 0 && (
                    <div>
                      <strong>Related feature:</strong> {featureNames.join(', ')}
                    </div>
                  )}
                </div>

                {/* Error Cases (Friendly list first) */}
                {api.errorCases && api.errorCases.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h5 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                      Documented Error Cases
                    </h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {api.errorCases.map((ec, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '0.375rem 0.625rem',
                            backgroundColor: 'var(--bg-muted)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem'
                          }}
                        >
                          <span className="badge badge-down" style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem' }}>
                            {ec.status}
                          </span>
                          <strong style={{ fontFamily: 'var(--font-mono)' }}>{ec.code || 'ERROR'}:</strong>
                          <span style={{ color: 'var(--text-secondary)' }}>{ec.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Collapsed Request & Response Examples */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <TechnicalDetails summary="Request Example">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.25rem' }}>
                      {api.requestExample && (
                        <button
                          type="button"
                          onClick={() => handleCopy(JSON.stringify(api.requestExample, null, 2), `${api.id}-req`)}
                          aria-label={`Copy request JSON for ${api.path}`}
                          style={{ fontSize: '0.6875rem', color: 'var(--accent-aqua)', fontWeight: 600 }}
                        >
                          {copiedId === `${api.id}-req` ? '✓ Copied' : 'Copy JSON'}
                        </button>
                      )}
                    </div>
                    <pre className="code-block" style={{ maxHeight: '160px', overflowY: 'auto', margin: 0 }}>
                      {api.requestExample ? JSON.stringify(api.requestExample, null, 2) : 'No request payload (GET / query only)'}
                    </pre>
                  </TechnicalDetails>

                  <TechnicalDetails summary="Response Example">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.25rem' }}>
                      {api.responseExample && (
                        <button
                          type="button"
                          onClick={() => handleCopy(JSON.stringify(api.responseExample, null, 2), `${api.id}-res`)}
                          aria-label={`Copy response JSON for ${api.path}`}
                          style={{ fontSize: '0.6875rem', color: 'var(--accent-aqua)', fontWeight: 600 }}
                        >
                          {copiedId === `${api.id}-res` ? '✓ Copied' : 'Copy JSON'}
                        </button>
                      )}
                    </div>
                    <pre className="code-block" style={{ maxHeight: '160px', overflowY: 'auto', margin: 0 }}>
                      {api.responseExample ? JSON.stringify(api.responseExample, null, 2) : 'Empty / status-only response'}
                    </pre>
                  </TechnicalDetails>
                </div>

                {/* Collapsed Technical Details */}
                <TechnicalDetails summary="API technical details" style={{ marginTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div><strong>API ID:</strong> <code>{api.id}</code></div>
                    <div><strong>Allowed Role IDs:</strong> <code>{api.roleIds?.join(', ') || 'none'}</code></div>
                    <div><strong>Linked Feature IDs:</strong> <code>{api.featureIds?.join(', ') || 'none'}</code></div>
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
