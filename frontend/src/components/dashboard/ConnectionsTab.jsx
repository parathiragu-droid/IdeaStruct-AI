import { useState } from 'react';
import HardwareWiringDiagram from '../hardware/HardwareWiringDiagram';
import ErrorBoundary from '../common/ErrorBoundary';

export default function ConnectionsTab({ blueprint = {} }) {
  const hardware = blueprint.hardware || {};
  const components = Array.isArray(hardware.components) ? hardware.components.filter(Boolean) : [];
  const connections = Array.isArray(hardware.connections) ? hardware.connections.filter(Boolean) : [];
  const [selectedCompId, setSelectedCompId] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Circuit Connections & Deterministic Wiring
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
          Interactive schematic diagram generated directly from pin-level connection definitions.
        </p>
      </div>

      {connections.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '2.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
            border: '1px dashed var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            No circuit wiring connections available for this project.
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
            This project does not currently define pin-level circuit wiring or connections.
          </p>
        </div>
      ) : (
        <>
          {/* SVG Wiring Diagram */}
          <ErrorBoundary sectionName="Circuit Wiring Diagram" level="section">
            <HardwareWiringDiagram
              components={components}
              connections={connections}
              selectedComponentId={selectedCompId}
              onSelectComponent={(node) => setSelectedCompId(node.id)}
            />
          </ErrorBoundary>

          {/* Full Connection Table */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Pin Connection Schedule ({connections.length} Connections)
            </h4>

            <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                <thead style={{ backgroundColor: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-default)' }}>
                  <tr>
                    <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>ID</th>
                    <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>From Component</th>
                    <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>From Pin</th>
                    <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>To Component</th>
                    <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>To Pin</th>
                    <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>Signal Type</th>
                    <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>Voltage</th>
                    <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>Purpose / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {connections.map((conn, idx) => {
                    const fromComp = components.find((c) => c && c.id === conn.fromComponentId);
                    const toComp = components.find((c) => c && c.id === conn.toComponentId);
                    return (
                      <tr key={conn.id || `conn-row-${idx}`} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.6rem 0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                          {conn.id || `C-${idx + 1}`}
                        </td>
                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {fromComp?.name || conn.fromComponentId}
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem', color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
                      {conn.fromPin}
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {toComp?.name || conn.toComponentId}
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem', color: 'var(--accent-orange)', fontFamily: 'monospace' }}>
                      {conn.toPin}
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem' }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.4rem',
                          borderRadius: '3px',
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {conn.signalType}
                      </span>
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)' }}>
                      {conn.voltage || 'N/A'}
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>
                      {conn.purpose} {conn.notes && <span style={{ color: 'var(--text-muted)' }}>({conn.notes})</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )}
</div>
  );
}
