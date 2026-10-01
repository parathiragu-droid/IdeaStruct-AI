import { useState } from 'react';
import HardwareWiringDiagram from './HardwareWiringDiagram';
import Parametric3DViewer from './Parametric3DViewer';
import ErrorBoundary from '../common/ErrorBoundary';
import { formatDimensions } from '../../utils/dimensions';

/**
 * Collapsible Hardware Plan Section.
 * Comprehensive physical engineering view: working principle, components table,
 * power budget, wiring diagram, block diagram, firmware logic, safety notes, and 3D prototype.
 */
export default function HardwarePlanSection({ hardware = {}, estimates = {}, blueprint = {}, defaultExpanded = true }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [selectedSubTab, setSelectedSubTab] = useState('components');
  const [selectedCompId, setSelectedCompId] = useState(null);

  const effectiveHardware = (blueprint && blueprint.hardware && blueprint.hardware.applicable)
    ? blueprint.hardware
    : hardware;

  if (!effectiveHardware || !effectiveHardware.applicable) {
    return null;
  }

  const components = effectiveHardware.components || [];
  const connections = effectiveHardware.connections || [];
  const powerReqs = effectiveHardware.powerRequirements || {};
  const firmware = effectiveHardware.firmwareLogic || {};
  const enclosure = effectiveHardware.enclosure || {};
  const threeDModel = effectiveHardware.threeDModel || {};

  return (
    <section
      className="card"
      aria-label="Hardware Engineering Plan"
      style={{
        border: '1px solid rgba(16, 185, 129, 0.35)',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Section Header with Expand/Collapse Toggle */}
      <div
        onClick={() => setIsExpanded((v) => !v)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 1.5rem',
          cursor: 'pointer',
          borderBottom: isExpanded ? '1px solid var(--border-subtle)' : 'none',
          backgroundColor: 'rgba(16, 185, 129, 0.05)',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>⚡</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge" style={{ backgroundColor: '#059669', color: '#fff', fontSize: '0.6875rem' }}>
                HARDWARE
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Hardware Plan & Circuit Architecture
              </h2>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
              Components bill of materials, circuit connections, wiring diagram, firmware logic, and interactive 3D model.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {components.length} Components • {connections.length} Connections
          </span>
          <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Sub-tab Navigation */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              borderBottom: '1px solid var(--border-default)',
              paddingBottom: '0.5rem',
            }}
          >
            {[
              { id: 'components', label: 'Required Components', icon: '📦' },
              { id: 'wiring', label: 'Wiring & Connections', icon: '🔌' },
              { id: '3d', label: 'Interactive 3D Prototype', icon: '🧊' },
              { id: 'firmware', label: 'Firmware Logic', icon: '💾' },
              { id: 'power', label: 'Power & Safety', icon: '⚡' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedSubTab(tab.id)}
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8125rem',
                  fontWeight: selectedSubTab === tab.id ? 700 : 500,
                  color: selectedSubTab === tab.id ? '#10b981' : 'var(--text-secondary)',
                  backgroundColor: selectedSubTab === tab.id ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  borderRadius: 'var(--radius-sm)',
                  border: selectedSubTab === tab.id ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 1. Working Principle Card (always visible at top of hardware plan) */}
          {hardware.workingPrinciple && (
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '4px solid #10b981',
                border: '1px solid var(--border-subtle)',
                borderLeftWidth: '4px',
                borderLeftColor: '#10b981',
              }}
            >
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>
                🔬 Working Principle
              </h4>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                {hardware.workingPrinciple}
              </p>
            </div>
          )}

          {/* TAB 1: Components Bill of Materials */}
          {selectedSubTab === 'components' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Bill of Materials (BOM)
                </h3>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Total Components:{' '}
                  <strong style={{ color: 'var(--accent-cyan)' }}>
                    {components.length} items
                  </strong>
                </div>
              </div>

              <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead style={{ backgroundColor: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-default)' }}>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>Component</th>
                      <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>Category</th>
                      <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>Purpose & Specs</th>
                      <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>Qty</th>
                      <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>Alternatives</th>
                    </tr>
                  </thead>
                  <tbody>
                    {components.map((comp) => (
                      <tr
                        key={comp.id}
                        onClick={() => setSelectedCompId(comp.id)}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          backgroundColor: selectedCompId === comp.id ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {comp.name}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(56, 189, 248, 0.12)',
                              color: 'var(--accent-cyan)',
                            }}
                          >
                            {comp.category || 'GENERIC'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                          <div>{comp.purpose}</div>
                          {comp.specification && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              <code>{comp.specification}</code>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                          {comp.quantity || 1}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {comp.alternatives?.length ? comp.alternatives.join(', ') : 'None listed'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Wiring Diagram & Pin Connections */}
          {selectedSubTab === 'wiring' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Deterministic Circuit Wiring Diagram
                </h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Hover lines or click components for interactive inspection
                </span>
              </div>

              {/* Pure React + SVG Wiring Diagram */}
              <ErrorBoundary sectionName="Circuit Wiring Diagram" level="section">
                <HardwareWiringDiagram
                  components={components}
                  connections={connections}
                  selectedComponentId={selectedCompId}
                  onSelectComponent={(node) => setSelectedCompId(node.id)}
                />
              </ErrorBoundary>

              {/* Pin Connections Structured Table */}
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Pin Connection Schedule
                </h4>
                <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                    <thead style={{ backgroundColor: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-default)' }}>
                      <tr>
                        <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>From Device</th>
                        <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>From Pin</th>
                        <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>To Device</th>
                        <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>To Pin</th>
                        <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>Signal Type</th>
                        <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>Voltage</th>
                        <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>Purpose / Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {connections.map((conn) => {
                        const fromComp = components.find((c) => c.id === conn.fromComponentId);
                        const toComp = components.find((c) => c.id === conn.toComponentId);
                        return (
                          <tr key={conn.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
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
            </div>
          )}

          {/* TAB 3: Interactive 3D Prototype */}
          {selectedSubTab === '3d' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Parametric 3D Physical Prototype
                </h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Interactive 3D view with rotate, zoom, pan, and component inspection
                </span>
              </div>

              {/* Three.js Viewer */}
              <ErrorBoundary sectionName="3D Physical Prototype" level="section">
                <Parametric3DViewer
                  threeDModel={threeDModel}
                  components={components}
                  connections={connections}
                  selectedComponentId={selectedCompId}
                  onSelectComponent={(comp) => setSelectedCompId(comp.id)}
                  blueprint={blueprint || {}}
                  enclosure={enclosure}
                  projectType={blueprint?.projectType || 'HARDWARE'}
                  onReturnToPlan={() => setSelectedSubTab('components')}
                />
              </ErrorBoundary>

              {/* Enclosure Specs summary */}
              {enclosure.dimensions && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    padding: '1rem',
                    backgroundColor: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Enclosure Type:</strong>{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>{enclosure.type || 'Custom Enclosure'}</span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Dimensions:</strong>{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>{formatDimensions(enclosure.dimensions)}</span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Material:</strong>{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>{enclosure.material || 'ABS / PETG 3D Printed'}</span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Ingress Rating:</strong>{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>{enclosure.protectionRating || 'IP40/IP54'}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Firmware Logic */}
          {selectedSubTab === 'firmware' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Firmware Architecture & Control Loop
              </h3>

              {firmware.mainLoopDescription && (
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '3px solid var(--accent-cyan)',
                  }}
                >
                  <strong style={{ fontSize: '0.8125rem', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                    Main Polling Loop
                  </strong>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                    {firmware.mainLoopDescription}
                  </p>
                </div>
              )}

              {firmware.setupSteps?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Initialization & Setup Steps
                  </h4>
                  <ol style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    {firmware.setupSteps.map((step, idx) => (
                      <li key={idx} style={{ marginBottom: '0.35rem' }}>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Power & Safety Notes */}
          {selectedSubTab === 'power' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Power Budget & Safety Guidelines
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>OPERATING VOLTAGE</div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--accent-orange)', marginTop: '0.2rem' }}>
                    {powerReqs.operatingVoltage || '5V DC Regulated'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>POWER SOURCE</div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {powerReqs.powerSource || '5V 2A DC Adapter'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>ESTIMATED CURRENT DRAW</div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
                    {powerReqs.estimatedCurrentDraw || 'Nominal 200mA, Peak 500mA'}
                  </div>
                </div>
              </div>

              {firmware.safetyNotes?.length > 0 && (
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--status-down)', margin: '0 0 0.5rem 0' }}>
                    ⚠️ Safety & Handling Instructions
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    {firmware.safetyNotes.map((note, idx) => (
                      <li key={idx} style={{ marginBottom: '0.35rem' }}>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
