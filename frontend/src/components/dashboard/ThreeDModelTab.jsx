import { useState } from 'react';
import Parametric3DViewer from '../hardware/Parametric3DViewer';
import ErrorBoundary from '../common/ErrorBoundary';

export default function ThreeDModelTab({ blueprint = {}, onSelectTab }) {
  const hardware = blueprint.hardware || {};
  const threeDModel = hardware.threeDModel || {};
  const components = Array.isArray(hardware.components) ? hardware.components.filter(Boolean) : [];
  const connections = Array.isArray(hardware.connections) ? hardware.connections.filter(Boolean) : [];
  const [selectedCompId, setSelectedCompId] = useState(null);

  const hasHardware = hardware.applicable || components.length > 0 || (threeDModel.components && threeDModel.components.length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Interactive 3D Hardware Prototype
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
          Parametric 3D layout showing enclosure, microcontroller, sensors, and actuator placement.
        </p>
      </div>

      {!hasHardware ? (
        <div
          className="card"
          style={{
            padding: '2.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
            border: '1px dashed var(--border-default)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>🧊</span>
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            3D model data is unavailable for this project.
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '520px', margin: '0.5rem auto 0' }}>
            This project does not include physical hardware specifications or 3D enclosure models.
          </p>
        </div>
      ) : (
        <ErrorBoundary sectionName="Interactive 3D Hardware Model" level="section">
          <Parametric3DViewer
            threeDModel={threeDModel}
            components={components}
            connections={connections}
            selectedComponentId={selectedCompId}
            onSelectComponent={(comp) => setSelectedCompId(comp.id)}
            blueprint={blueprint}
            enclosure={hardware.enclosure}
            projectType={blueprint.projectType}
            onReturnToPlan={onSelectTab ? () => onSelectTab('components') : null}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}
