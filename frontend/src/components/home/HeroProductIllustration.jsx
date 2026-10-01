/**
 * HeroProductIllustration.jsx
 * Simplified visual for Phase 3 — communicates Software + Hardware + Hybrid.
 * No API counts, no GPIO numbers, no long technical labels.
 */
export default function HeroProductIllustration() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '520px',
        margin: '0 auto',
        userSelect: 'none',
      }}
    >
      {/* Ambient glow blooms */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '220px',
          height: '220px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%)',
          filter: 'blur(40px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '5%',
          right: '5%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
          filter: 'blur(40px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Main glassmorphism card */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          borderRadius: '16px',
          backgroundColor: 'rgba(12, 18, 30, 0.88)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(22, 217, 227, 0.25)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 20px rgba(6,182,212,0.12)',
          padding: '1.5rem',
          overflow: 'hidden',
        }}
      >
        {/* Window chrome */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            marginBottom: '1.125rem',
          }}
        >
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span
            style={{
              marginLeft: '0.5rem',
              fontSize: '0.6875rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}
          >
            IdeaStruct AI
          </span>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '0.625rem',
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(6,182,212,0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(6,182,212,0.3)',
              fontWeight: 700,
            }}
          >
            ● Ready
          </span>
        </div>

        {/* Input idea */}
        <div
          style={{
            borderRadius: '10px',
            backgroundColor: 'rgba(15,23,42,0.7)',
            border: '1px solid rgba(6,182,212,0.3)',
            padding: '0.75rem 0.875rem',
            marginBottom: '0.875rem',
          }}
        >
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'var(--accent-cyan)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.3rem',
            }}
          >
            💡 Your Idea
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
            "Smart irrigation system with soil sensors and a mobile dashboard"
          </div>
        </div>

        {/* AI arrow */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '0.875rem',
          }}
        >
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: '#c084fc',
              padding: '0.3rem 0.875rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(139,92,246,0.2)',
              border: '1px solid rgba(139,92,246,0.4)',
              boxShadow: '0 0 14px rgba(139,92,246,0.2)',
            }}
          >
            ⚡ AI generates your plan
          </span>
        </div>

        {/* 3 output panels */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.625rem' }}>
          {/* SOFTWARE */}
          <div
            style={{
              borderRadius: '8px',
              backgroundColor: 'rgba(15,23,42,0.8)',
              border: '1px solid rgba(6,182,212,0.3)',
              padding: '0.75rem 0.625rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem',
            }}
          >
            <div style={{ fontSize: '1rem' }}>💻</div>
            <div
              style={{
                fontSize: '0.6875rem',
                fontWeight: 800,
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Software
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {['Features', 'APIs', 'UI Prototype'].map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '0.5625rem',
                    padding: '0.15rem 0.35rem',
                    borderRadius: '3px',
                    backgroundColor: 'rgba(6,182,212,0.12)',
                    color: '#38bdf8',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* HARDWARE */}
          <div
            style={{
              borderRadius: '8px',
              backgroundColor: 'rgba(15,23,42,0.8)',
              border: '1px solid rgba(245,158,11,0.3)',
              padding: '0.75rem 0.625rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem',
            }}
          >
            <div style={{ fontSize: '1rem' }}>🔌</div>
            <div
              style={{
                fontSize: '0.6875rem',
                fontWeight: 800,
                color: 'var(--accent-orange)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Hardware
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {['BOM', 'Wiring', '3D Model'].map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '0.5625rem',
                    padding: '0.15rem 0.35rem',
                    borderRadius: '3px',
                    backgroundColor: 'rgba(245,158,11,0.12)',
                    color: '#fbbf24',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* HYBRID */}
          <div
            style={{
              borderRadius: '8px',
              backgroundColor: 'rgba(15,23,42,0.8)',
              border: '1px solid rgba(139,92,246,0.3)',
              padding: '0.75rem 0.625rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem',
            }}
          >
            <div style={{ fontSize: '1rem' }}>⚡</div>
            <div
              style={{
                fontSize: '0.6875rem',
                fontWeight: 800,
                color: 'var(--accent-purple)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Hybrid
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {['Both', 'IoT Cloud', 'Full Plan'].map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '0.5625rem',
                    padding: '0.15rem 0.35rem',
                    borderRadius: '3px',
                    backgroundColor: 'rgba(139,92,246,0.12)',
                    color: '#c084fc',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom verified strip */}
        <div
          style={{
            marginTop: '0.875rem',
            padding: '0.45rem 0.75rem',
            borderRadius: '6px',
            backgroundColor: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.6875rem',
          }}
        >
          <span style={{ color: '#a7f3d0', fontWeight: 600 }}>
            ✓ Complete plan — ready to build
          </span>
          <span style={{ color: '#34d399', fontWeight: 700 }}>Plan Check ✓</span>
        </div>
      </div>
    </div>
  );
}
