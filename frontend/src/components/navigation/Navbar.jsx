import { Link, useLocation } from 'react-router-dom';
import logoSrc from '../../assets/brand/ideastruct-ai-logo.png';
import { useTheme } from '../../utils/themeContext';

export default function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path === '/projects') {
      return location.pathname === '/projects' || (location.pathname.startsWith('/projects/') && location.pathname !== '/projects/new');
    }
    return location.pathname === path;
  };

  return (
    <header style={{
      backgroundColor: 'var(--bg-navbar, rgba(13, 28, 43, 0.85))',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-default)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: 'var(--navbar-shadow, 0 4px 20px rgba(0, 0, 0, 0.4))'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '0.875rem',
        paddingBottom: '0.875rem',
        flexWrap: 'wrap',
        gap: '0.875rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {/* Brand Logo */}
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            color: 'inherit'
          }}>
            <img
              src={logoSrc}
              alt="IdeaStruct AI logo"
              style={{
                width: 'clamp(38px, 4vw, 52px)',
                height: 'clamp(38px, 4vw, 52px)',
                borderRadius: '50%',
                objectFit: 'contain',
                aspectRatio: '1 / 1',
                boxShadow: '0 0 12px rgba(22, 217, 227, 0.45), 0 0 24px rgba(22, 217, 227, 0.2)',
                flexShrink: 0,
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                aria-label="IdeaStruct AI"
                style={{
                  fontSize: '1.1875rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  color: 'var(--text-primary)'
                }}
              >
                IdeaStruct <span style={{ color: 'var(--accent-cyan)' }}>AI</span>
              </span>
              <span style={{
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}>
                AI Project Planner
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
            <Link
              to="/"
              className="btn btn-ghost"
              style={{
                fontSize: '0.875rem',
                padding: '0.45rem 0.875rem',
                borderRadius: 'var(--radius-sm)',
                color: isActive('/') ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                backgroundColor: isActive('/') ? 'var(--accent-aqua-light)' : 'transparent',
                border: isActive('/') ? '1px solid var(--accent-aqua-border)' : '1px solid transparent',
                fontWeight: isActive('/') ? 700 : 500,
                transition: 'all 0.15s ease'
              }}
            >
              Home
            </Link>
            <Link
              to="/projects"
              className="btn btn-ghost"
              style={{
                fontSize: '0.875rem',
                padding: '0.45rem 0.875rem',
                borderRadius: 'var(--radius-sm)',
                color: isActive('/projects') ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                backgroundColor: isActive('/projects') ? 'var(--accent-aqua-light)' : 'transparent',
                border: isActive('/projects') ? '1px solid var(--accent-aqua-border)' : '1px solid transparent',
                fontWeight: isActive('/projects') ? 700 : 500,
                transition: 'all 0.15s ease'
              }}
            >
              My Projects
            </Link>
            <Link
              to="/health"
              className="btn btn-ghost"
              style={{
                fontSize: '0.875rem',
                padding: '0.45rem 0.875rem',
                borderRadius: 'var(--radius-sm)',
                color: isActive('/health') ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                backgroundColor: isActive('/health') ? 'var(--accent-aqua-light)' : 'transparent',
                border: isActive('/health') ? '1px solid var(--accent-aqua-border)' : '1px solid transparent',
                fontWeight: isActive('/health') ? 700 : 500,
                transition: 'all 0.15s ease'
              }}
            >
              System Status
            </Link>
          </nav>
        </div>

        {/* Action Buttons & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {/* Theme Toggle Button */}
          <button
            type="button"
            id="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
            className="btn btn-secondary theme-toggle-btn"
            style={{
              padding: '0.45rem 0.75rem',
              fontSize: '0.875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <span aria-hidden="true" style={{ fontSize: '0.95rem', lineHeight: 1 }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </span>
            <span className="theme-toggle-label" style={{ fontSize: '0.8125rem' }}>
              {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>

          <Link
            to="/projects/new"
            className="btn btn-primary"
            id="nav-btn-new-project"
            style={{ fontSize: '0.875rem', padding: '0.5rem 1.125rem' }}
          >
            <span style={{ fontSize: '1.125rem', lineHeight: 1, marginRight: '0.25rem', fontWeight: 800 }}>+</span>
            New Project
          </Link>
        </div>
      </div>
    </header>
  );
}
