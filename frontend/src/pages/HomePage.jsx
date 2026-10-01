import { Link } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import HeroProductIllustration from '../components/home/HeroProductIllustration';
import ErrorBoundary from '../components/common/ErrorBoundary';
import logoSrc from '../assets/brand/ideastruct-ai-logo.png';

export default function HomePage() {
  return (
    <ErrorBoundary level="page" sectionName="Home">
      <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-main)',
      }}
    >
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* ================================================================= */}
        {/* SECTION A — HERO                                                   */}
        {/* ================================================================= */}
        <section
          style={{
            padding: 'clamp(2.5rem, 5vw, 4rem) 1.25rem clamp(2rem, 4vw, 3.5rem)',
            borderBottom: '1px solid var(--border-default)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle background glow */}
          <div
            style={{
              position: 'absolute',
              top: '-80px',
              right: '10%',
              width: '480px',
              height: '480px',
              background:
                'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 65%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          <div
            className="container"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2.5rem',
              alignItems: 'center',
              padding: 0,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Left: Text + CTAs */}
            <div>
              {/* Domain badge */}
              <span
                className="badge badge-aqua"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  marginBottom: '1.25rem',
                  padding: '0.35rem 0.875rem',
                }}
              >
                SOFTWARE&nbsp;•&nbsp;HARDWARE&nbsp;•&nbsp;HYBRID
              </span>

              <h1
                style={{
                  fontSize: 'clamp(1.875rem, 4.5vw, 2.75rem)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.18,
                  marginBottom: '1rem',
                }}
              >
                Turn your idea into a{' '}
                <span className="gradient-text">complete project plan.</span>
              </h1>

              <p
                style={{
                  fontSize: 'clamp(0.9375rem, 1.8vw, 1.0625rem)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  marginBottom: '2rem',
                  maxWidth: '480px',
                }}
              >
                Plan software, hardware, or hybrid projects with AI-generated
                prototypes, wiring, and 3D visualization.
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <Link
                  to="/projects/new"
                  className="btn btn-primary"
                  id="hero-btn-new-project"
                  style={{
                    fontSize: '1rem',
                    padding: '0.75rem 1.75rem',
                    fontWeight: 700,
                  }}
                >
                  New Project
                </Link>

                <Link
                  to="/projects"
                  className="btn btn-secondary"
                  id="hero-btn-my-projects"
                  style={{
                    fontSize: '1rem',
                    padding: '0.75rem 1.5rem',
                  }}
                >
                  My Projects
                </Link>
              </div>
            </div>

            {/* Right: Simplified Illustration */}
            <div>
              <HeroProductIllustration />
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION B — CHOOSE PROJECT TYPE                                    */}
        {/* ================================================================= */}
        <section
          style={{
            padding: 'clamp(3rem, 5vw, 4.5rem) 1.25rem',
            borderBottom: '1px solid var(--border-default)',
          }}
        >
          <div className="container" style={{ padding: 0 }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2
                style={{
                  fontSize: 'clamp(1.375rem, 3vw, 1.75rem)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  marginBottom: '0.375rem',
                }}
              >
                What do you want to build?
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', margin: 0 }}>
                Pick a project type to get started.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem',
                maxWidth: '860px',
                margin: '0 auto',
              }}
            >
              {/* SOFTWARE CARD */}
              <div
                className="card"
                style={{
                  borderTop: '3px solid var(--accent-cyan)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.875rem',
                  padding: '1.75rem',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg), 0 0 20px rgba(6,182,212,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div style={{ fontSize: '2rem' }}>💻</div>
                <div>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    SOFTWARE
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Plan + UI Prototype
                  </div>
                </div>
                <Link
                  to="/projects/new?type=SOFTWARE"
                  className="btn btn-secondary"
                  id="card-btn-software"
                  style={{ fontSize: '0.875rem', marginTop: 'auto' }}
                >
                  Start Software Project
                </Link>
              </div>

              {/* HARDWARE CARD */}
              <div
                className="card"
                style={{
                  borderTop: '3px solid var(--accent-orange)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.875rem',
                  padding: '1.75rem',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg), 0 0 20px rgba(245,158,11,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div style={{ fontSize: '2rem' }}>🔌</div>
                <div>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    HARDWARE
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Plan + Wiring + 3D Model
                  </div>
                </div>
                <Link
                  to="/projects/new?type=HARDWARE"
                  className="btn btn-secondary"
                  id="card-btn-hardware"
                  style={{ fontSize: '0.875rem', marginTop: 'auto' }}
                >
                  Start Hardware Project
                </Link>
              </div>

              {/* HYBRID CARD */}
              <div
                className="card"
                style={{
                  borderTop: '3px solid var(--accent-purple)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.875rem',
                  padding: '1.75rem',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg), 0 0 20px rgba(139,92,246,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div style={{ fontSize: '2rem' }}>⚡</div>
                <div>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    HYBRID
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Software + Hardware Together
                  </div>
                </div>
                <Link
                  to="/projects/new?type=HYBRID"
                  className="btn btn-secondary"
                  id="card-btn-hybrid"
                  style={{ fontSize: '0.875rem', marginTop: 'auto' }}
                >
                  Start Hybrid Project
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION C — COMPACT CTA                                            */}
        {/* ================================================================= */}
        <section
          style={{
            padding: 'clamp(2.5rem, 4vw, 3.5rem) 1.25rem',
            textAlign: 'center',
          }}
        >
          <div className="container" style={{ maxWidth: '560px', margin: '0 auto', padding: 0 }}>
            <h2
              style={{
                fontSize: 'clamp(1.25rem, 3vw, 1.625rem)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                marginBottom: '0.5rem',
              }}
            >
              Have an idea?
            </h2>
            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--text-secondary)',
                marginBottom: '1.75rem',
              }}
            >
              Turn it into a project plan.
            </p>
            <Link
              to="/projects/new"
              className="btn btn-primary"
              id="cta-btn-create"
              style={{
                fontSize: '1rem',
                padding: '0.75rem 2rem',
                fontWeight: 700,
              }}
            >
              Create New Project
            </Link>
          </div>
        </section>
      </main>

      {/* ================================================================= */}
      {/* FOOTER                                                              */}
      {/* ================================================================= */}
      <footer
        style={{
          borderTop: '1px solid var(--border-default)',
          padding: '1.25rem 1.25rem',
          backgroundColor: 'var(--bg-secondary)',
          textAlign: 'center',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <img
            src={logoSrc}
            alt="IdeaStruct AI logo"
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              objectFit: 'contain',
              flexShrink: 0,
              opacity: 0.9,
            }}
          />
          <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>IdeaStruct AI</span>
          <span style={{ color: 'var(--text-muted)' }}>—</span>
          <span style={{ color: 'var(--accent-cyan)' }}>Software</span>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span style={{ color: 'var(--accent-orange)' }}>Hardware</span>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span style={{ color: 'var(--accent-purple)' }}>Hybrid</span>
        </div>
      </footer>
      </div>
    </ErrorBoundary>
  );
}
