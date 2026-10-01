/**
 * WorkflowVisualDiagram.jsx
 * Visual infographic diagram section for IdeaStruct AI:
 * Project Idea -> AI Classification -> Domain Branching -> Plan Generation -> Deliverables (Prototype / 3D Model).
 */
export default function WorkflowVisualDiagram() {
  const steps = [
    {
      num: '01',
      title: 'Project Idea',
      badge: 'Input',
      badgeColor: 'var(--accent-cyan, #06b6d4)',
      icon: '💡',
      subtitle: 'Plain Words Concept',
      desc: 'Type your idea freely—whether it is a mobile app, IoT irrigation controller, biometric wearable, or robotics chassis.',
      features: ['No jargon required', 'Auto-detected signals', 'Any domain'],
    },
    {
      num: '02',
      title: 'AI Classification',
      badge: 'Analysis',
      badgeColor: 'var(--accent-purple, #8b5cf6)',
      icon: '🧠',
      subtitle: 'Architecture Routing',
      desc: 'IdeaStruct AI analyzes sensors, controllers, databases, APIs, and screens to determine the optimal engineering structure.',
      branches: [
        { label: 'Software Only', color: '#06b6d4', icon: '💻' },
        { label: 'Hardware Only', color: '#f59e0b', icon: '🔌' },
        { label: 'Connected Hybrid', color: '#8b5cf6', icon: '⚡' },
      ],
    },
    {
      num: '03',
      title: 'Plan Generation',
      badge: 'Architecture',
      badgeColor: 'var(--accent-green, #10b981)',
      icon: '📐',
      subtitle: 'Complete Blueprint',
      desc: 'Generates structured specifications, bill of materials, database schemas, REST endpoints, and implementation roadmaps.',
      features: ['Component BOM & Specs', 'Database ERD Map', 'API Contracts'],
    },
    {
      num: '04',
      title: 'Interactive Output',
      badge: 'Execution',
      badgeColor: 'var(--accent-pink, #ec4899)',
      icon: '🚀',
      subtitle: 'Prototype & 3D Model',
      desc: 'Explore your project through clickable UI prototypes, physical 3D parametric enclosure models, and deterministic SVG wiring.',
      features: ['Clickable Screen Demo', 'Parametric 3D CAD Preview', 'SVG Circuit Wiring'],
    },
  ];

  return (
    <div
      style={{
        position: 'relative',
        padding: '2rem 1.5rem',
        borderRadius: 'var(--radius-lg, 16px)',
        backgroundColor: 'rgba(10, 16, 28, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient gradient line */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '5%',
          right: '5%',
          height: '2px',
          background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.4) 0%, rgba(139, 92, 246, 0.4) 50%, rgba(16, 185, 129, 0.4) 100%)',
          zIndex: 0,
          display: 'none', // shown on desktop via media queries or flex line
        }}
      />

      {/* 4 Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {steps.map((step, idx) => (
          <div
            key={step.num}
            className="card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              border: `1px solid ${idx === 0 ? 'rgba(6, 182, 212, 0.4)' : idx === 1 ? 'rgba(139, 92, 246, 0.4)' : idx === 2 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(236, 72, 153, 0.4)'}`,
              borderRadius: 'var(--radius-md, 12px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              position: 'relative',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
            }}
          >
            {/* Header: Number and Badge */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{step.icon}</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: 800, color: step.badgeColor }}>
                    {step.num}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '9999px',
                    backgroundColor: `${step.badgeColor}22`,
                    color: step.badgeColor,
                    border: `1px solid ${step.badgeColor}44`,
                  }}
                >
                  {step.badge}
                </span>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary, #f8fafc)', margin: '0 0 0.25rem' }}>
                {step.title}
              </h3>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)', marginBottom: '0.75rem' }}>
                {step.subtitle}
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #cbd5e1)', lineHeight: 1.5, margin: '0 0 1rem' }}>
                {step.desc}
              </p>
            </div>

            {/* Sub-features or Branches */}
            <div>
              {step.branches ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.25rem' }}>
                  {step.branches.map((b) => (
                    <div
                      key={b.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(2, 6, 23, 0.6)',
                        border: `1px solid ${b.color}33`,
                        fontSize: '0.75rem',
                        color: b.color,
                        fontWeight: 600,
                      }}
                    >
                      <span>{b.icon}</span>
                      <span>{b.label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.25rem' }}>
                  {step.features.map((f) => (
                    <div
                      key={f}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary, #94a3b8)',
                      }}
                    >
                      <span style={{ color: step.badgeColor, fontWeight: 700 }}>✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Connecting Arrow for sequential flow (except last) */}
            {idx < steps.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  right: '-14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-main, #0b1120)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-cyan, #06b6d4)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  zIndex: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                }}
              >
                →
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
