export default function ArchitectureTab({ blueprint = {} }) {
  const software = blueprint.software || {};
  const architecture = software.architecture || blueprint.architecture || {};
  const testingStrategy = software.testingStrategy || [];
  const deploymentPlan = software.deploymentPlan || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Software Architecture, Testing & Deployment
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
          Design patterns, automated quality verification tiers, and cloud delivery pipelines.
        </p>
      </div>

      {architecture.summary && (
        <div
          className="card"
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--bg-elevated)',
            borderLeft: '4px solid var(--accent-purple)',
          }}
        >
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-purple)', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>
            System Architecture Pattern
          </h4>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
            {architecture.summary}
          </p>
        </div>
      )}

      {testingStrategy?.length > 0 && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            🧪 Testing Strategy & Quality Assurance
          </h4>
          <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {testingStrategy.map((step, idx) => (
              <li key={idx} style={{ marginBottom: '0.35rem' }}>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}

      {deploymentPlan?.length > 0 && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            🚀 Deployment Plan & CI/CD Pipeline
          </h4>
          <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {deploymentPlan.map((step, idx) => (
              <li key={idx} style={{ marginBottom: '0.35rem' }}>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
