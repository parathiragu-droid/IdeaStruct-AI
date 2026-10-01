import React from 'react';
import TechnicalDetails from './TechnicalDetails';

/**
 * Universal React ErrorBoundary
 *
 * Catches JavaScript runtime errors in child component trees, logs error details,
 * and renders a polished, user-friendly fallback card instead of crashing into a blank screen.
 *
 * Supports multiple levels:
 * - 'app': Global application fallback (includes Navbar and return home)
 * - 'page': Page-level fallback (retains Navbar)
 * - 'tab': Tab-level isolation (retains Navbar, project header, tabs navigation)
 * - 'section': Component-level isolation (retains surrounding page content)
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Keep technical diagnostics in console for developers
    console.error(`[ErrorBoundary caught error in "${this.props.sectionName || 'Section'}"]:`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const {
      sectionName = 'Section',
      level = 'section',
      fallback,
      onBack,
    } = this.props;

    const { error, errorInfo } = this.state;

    // Custom fallback if provided
    if (typeof fallback === 'function') {
      return fallback({ error, errorInfo, reset: this.handleReset });
    }
    if (fallback) {
      return fallback;
    }

    const isAppLevel = level === 'app';
    const isPageLevel = level === 'page';
    const isTabLevel = level === 'tab';

    const cardContent = (
      <div
        className="card"
        style={{
          padding: isTabLevel ? '2rem' : '2.5rem',
          maxWidth: isAppLevel || isPageLevel ? '640px' : '100%',
          margin: isAppLevel || isPageLevel ? '3rem auto' : '0',
          textAlign: 'center',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid rgba(255, 94, 122, 0.35)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
        }}
        role="alert"
        aria-live="assertive"
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
          }}
        >
          Something went wrong while loading {sectionName}.
        </h3>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            maxWidth: '520px',
            margin: '0 auto 1.5rem',
          }}
        >
          {isTabLevel
            ? 'This section encountered an unexpected error. The rest of your project plan and navigation remain fully functional.'
            : 'An unexpected error occurred while rendering this view. You can retry loading or return to a previous screen.'}
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            marginBottom: '1.25rem',
          }}
        >
          <button
            type="button"
            onClick={this.handleReset}
            className="btn btn-primary"
            style={{ fontSize: '0.8125rem', padding: '0.45rem 1rem' }}
          >
            🔄 Try Again
          </button>

          {onBack ? (
            <button
              type="button"
              onClick={() => {
                this.handleReset();
                onBack();
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.45rem 1rem' }}
            >
              ⬅️ Back to Project
            </button>
          ) : (
            <a
              href={isTabLevel ? '#' : '/projects'}
              onClick={(e) => {
                if (isTabLevel) {
                  e.preventDefault();
                  this.handleReset();
                }
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.45rem 1rem', textDecoration: 'none' }}
            >
              {isTabLevel ? '⬅️ Back to Project' : '⬅️ Return to Projects'}
            </a>
          )}
        </div>

        {error && (
          <TechnicalDetails
            summary="Technical diagnostic details"
            style={{ textAlign: 'left', marginTop: '1rem' }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div><strong>Message:</strong> <code>{error.message || String(error)}</code></div>
            </div>
          </TechnicalDetails>
        )}
      </div>
    );

    if (isAppLevel || isPageLevel) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
          <header style={{
            backgroundColor: 'rgba(13, 28, 43, 0.95)',
            borderBottom: '1px solid var(--border-default)',
            padding: '0.875rem 1.5rem',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                IdeaStruct <span style={{ color: 'var(--accent-cyan)' }}>AI</span>
              </span>
            </a>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a href="/" className="btn btn-ghost" style={{ fontSize: '0.875rem', textDecoration: 'none' }}>Home</a>
              <a href="/projects" className="btn btn-ghost" style={{ fontSize: '0.875rem', textDecoration: 'none' }}>My Projects</a>
              <a href="/health" className="btn btn-ghost" style={{ fontSize: '0.875rem', textDecoration: 'none' }}>System Status</a>
              <a href="/projects/new" className="btn btn-primary" style={{ fontSize: '0.8125rem', textDecoration: 'none' }}>+ New Project</a>
            </nav>
          </header>
          <main style={{ flex: 1, padding: '1rem' }}>
            {cardContent}
          </main>
        </div>
      );
    }

    return cardContent;
  }
}
