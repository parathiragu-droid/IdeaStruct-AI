import SafePrototypeEngine from '../prototype/SafePrototypeEngine';
import ErrorBoundary from '../common/ErrorBoundary';

export default function SoftwarePrototypeTab({ blueprint = {} }) {
  const software = blueprint.software || {};
  const prototype = software.prototype || blueprint.prototype;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Interactive Software Prototype
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
          Simulated click-through interface testing screen navigation and workflows.
        </p>
      </div>

      <ErrorBoundary sectionName="Interactive Software Prototype" level="section">
        <SafePrototypeEngine prototype={prototype} projectName={blueprint.title || blueprint.overview?.projectName} />
      </ErrorBoundary>
    </div>
  );
}
