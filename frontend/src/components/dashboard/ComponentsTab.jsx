import { useState } from 'react';

export default function ComponentsTab({ blueprint = {} }) {
  const hardware = blueprint.hardware || {};
  const components = Array.isArray(hardware.components) ? hardware.components.filter(Boolean) : [];
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', ...new Set(components.map((c) => (c.category || 'OTHER').toUpperCase()))];

  const filteredComponents = selectedCategory === 'ALL'
    ? components
    : components.filter((c) => (c.category || 'OTHER').toUpperCase() === selectedCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Hardware Bill of Materials ({components.length} Components)
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
            Components, sensors, microcontrollers, and actuators selected for this circuit.
          </p>
        </div>

        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Total: <strong style={{ color: 'var(--accent-cyan)' }}>{components.length} components</strong>
        </div>
      </div>

      {/* Category Filter Pills */}
      {components.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.3rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: selectedCategory === cat ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: selectedCategory === cat ? '#10b981' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Components Grid or Empty State */}
      {components.length === 0 ? (
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
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            No hardware components defined.
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
            This project does not currently list specific electronic parts or sensors.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {filteredComponents.map((comp) => (
          <div
            key={comp.id}
            className="card"
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {comp.name}
              </h4>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                }}
              >
                {comp.category || 'COMPONENT'}
              </span>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, flex: 1, lineHeight: 1.4 }}>
              {comp.purpose}
            </p>

            {comp.specification && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <strong>Specification:</strong> <code>{comp.specification}</code>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.5rem',
                marginTop: '0.25rem',
                fontSize: '0.8125rem',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>
                Quantity: <strong style={{ color: 'var(--text-primary)' }}>{comp.quantity || 1}</strong>
              </span>
            </div>

            {comp.alternatives?.length > 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <strong>Alternatives:</strong> {comp.alternatives.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
