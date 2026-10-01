/**
 * HybridIntegrationSection Component.
 * Illustrates the end-to-end telemetry and command architecture connecting
 * physical hardware devices to cloud backends, databases, and client dashboards.
 */
export default function HybridIntegrationSection({ integrations = [] }) {
  if (!integrations || integrations.length === 0) return null;

  return (
    <section
      className="card"
      aria-label="Hybrid Hardware-Software Integration"
      style={{
        border: '1px solid rgba(168, 85, 247, 0.35)',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🔄</span>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge" style={{ backgroundColor: '#9333ea', color: '#fff', fontSize: '0.6875rem' }}>
              HYBRID ARCHITECTURE
            </span>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Device-to-Cloud Integration Architecture
            </h3>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
            End-to-end communication pipeline bridging physical sensors, protocol brokers, backend services, and web/mobile dashboards.
          </p>
        </div>
      </div>

      {/* Visual Pipeline Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.5rem',
          padding: '1rem',
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1.5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ padding: '0.5rem' }}>
          <div style={{ fontSize: '1.25rem' }}>📡</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', marginTop: '0.25rem' }}>HARDWARE DEVICE</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Edge Sensors / MCU</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-purple)' }}>
          ➔
        </div>

        <div style={{ padding: '0.5rem' }}>
          <div style={{ fontSize: '1.25rem' }}>📶</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a855f7', marginTop: '0.25rem' }}>PROTOCOL LAYER</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MQTT / HTTP / BLE</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-purple)' }}>
          ➔
        </div>

        <div style={{ padding: '0.5rem' }}>
          <div style={{ fontSize: '1.25rem' }}>⚙️</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', marginTop: '0.25rem' }}>BACKEND SERVICE</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ingestion & APIs</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-purple)' }}>
          ➔
        </div>

        <div style={{ padding: '0.5rem' }}>
          <div style={{ fontSize: '1.25rem' }}>💻</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.25rem' }}>USER INTERFACE</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Web & Mobile App</div>
        </div>
      </div>

      {/* Integration Connections Table */}
      <div>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
          Configured Data Bridges & Protocols ({integrations.length})
        </h4>
        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead style={{ backgroundColor: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-default)' }}>
              <tr>
                <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>Source Node</th>
                <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>Destination</th>
                <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>Protocol</th>
                <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>Transmitted Payload</th>
                <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>Architectural Purpose</th>
              </tr>
            </thead>
            <tbody>
              {integrations.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.source}
                  </td>
                  <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.destination}
                  </td>
                  <td style={{ padding: '0.6rem 0.8rem' }}>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(168, 85, 247, 0.15)',
                        color: 'var(--accent-purple)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {item.protocol}
                    </span>
                  </td>
                  <td style={{ padding: '0.6rem 0.8rem', color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
                    {item.data}
                  </td>
                  <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>
                    {item.purpose}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
