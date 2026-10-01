import React from 'react';
import SectionIntro from '../common/SectionIntro';

/**
 * TechStackTab Component
 *
 * Displays dynamically generated technology stack recommendations with rationale,
 * evaluated alternatives, and engineering trade-offs.
 */
export default function TechStackTab({ blueprint, techStack: directTechStack }) {
  const software = blueprint?.software || {};
  const techStack = directTechStack || software?.recommendedTechStack || blueprint?.recommendedTechStack || {};

  const categories = [
    { key: 'frontend', label: 'Frontend Client', data: techStack.frontend, icon: '🖥️' },
    { key: 'backend', label: 'Backend Services', data: techStack.backend, icon: '⚙️' },
    { key: 'database', label: 'Database & Storage', data: techStack.database, icon: '🗄️' },
    { key: 'deployment', label: 'Deployment & Infrastructure', data: techStack.deployment, icon: '🚀' },
    { key: 'testing', label: 'Testing & Verification', data: techStack.testing, icon: '🧪' },
  ];

  const optionalServices = Array.isArray(techStack.optionalServices) ? techStack.optionalServices : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <SectionIntro
        title="Recommended Tech Stack"
        explanation="Dynamically evaluated technologies tailored to your project requirements with rationale and trade-offs."
        technicalDetails={
          <div>
            <div><strong>Schema Section:</strong> <code>blueprint.software.recommendedTechStack</code></div>
            <div><strong>Evaluation:</strong> AI-analyzed based on project domain, real-time needs, data scale, and team capabilities.</div>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {categories.map((cat) => {
          const item = cat.data;
          if (!item && !software.applicable) return null;

          return (
            <div
              key={cat.key}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: '3px solid var(--accent-blue, #3b82f6)',
                padding: '1.25rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{cat.icon}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {cat.label}
                  </span>
                </div>

                <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontSize: '1.2rem' }}>
                  {item?.technology || 'Tailored to requirements'}
                </h3>

                {item?.reason && (
                  <div style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <strong>Why this choice:</strong> {item.reason}
                  </div>
                )}

                {item?.tradeOffs && (
                  <div
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      fontSize: '0.8rem',
                      color: 'var(--accent-orange, #f59e0b)',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <strong>Trade-offs:</strong> {item.tradeOffs}
                  </div>
                )}
              </div>

              {item?.alternatives && item.alternatives.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Alternatives Considered:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {item.alternatives.map((alt, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-surface, #1e293b)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {optionalServices.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Supporting Services & Middleware</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {optionalServices.map((svc, idx) => (
              <div
                key={idx}
                className="card"
                style={{ padding: '1rem', borderLeft: '3px solid var(--accent-purple, #a855f7)' }}
              >
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>
                  {svc.technology}
                </div>
                {svc.reason && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>{svc.reason}</p>}
                {svc.tradeOffs && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trade-offs: {svc.tradeOffs}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
