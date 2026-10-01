export default function FirmwareTab({ blueprint = {} }) {
  const hardware = blueprint.hardware || {};
  const firmware = hardware.firmwareLogic || {};
  const power = hardware.powerRequirements || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Firmware Architecture & Control Loop
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
          Embedded lifecycle, state transitions, peripheral initialization, and safety routines.
        </p>
      </div>

      {/* Main Polling Loop Card */}
      {firmware.mainLoopDescription && (
        <div
          className="card"
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--bg-elevated)',
            borderLeft: '4px solid var(--accent-cyan)',
          }}
        >
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>
            🔄 Main Execution & Polling Loop
          </h4>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
            {firmware.mainLoopDescription}
          </p>
        </div>
      )}

      {/* Setup Steps List */}
      {firmware.setupSteps?.length > 0 && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Device Boot & Setup Sequence
          </h4>
          <ol style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
            {firmware.setupSteps.map((step, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem' }}>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Power Budget & Safety Notes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Power Requirements
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>Operating Voltage:</strong>{' '}
              <span style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>{power.operatingVoltage || '5V DC'}</span>
            </div>
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>Power Source:</strong>{' '}
              <span style={{ color: 'var(--text-primary)' }}>{power.powerSource || 'External Adapter / USB'}</span>
            </div>
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>Estimated Current Draw:</strong>{' '}
              <span style={{ color: 'var(--accent-cyan)' }}>{power.estimatedCurrentDraw || '200–500mA'}</span>
            </div>
          </div>
        </div>

        {firmware.safetyNotes?.length > 0 && (
          <div
            className="card"
            style={{
              padding: '1.25rem',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
            }}
          >
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--status-down)', marginBottom: '0.75rem' }}>
              ⚠️ Safety & Precautions
            </h4>
            <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {firmware.safetyNotes.map((note, idx) => (
                <li key={idx} style={{ marginBottom: '0.35rem' }}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
