import { Link, useLocation } from 'react-router-dom';
import logoSrc from '../../assets/brand/ideastruct-ai-logo.png';

export default function Navbar() {
  const location = useLocation();

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
      backgroundColor: 'rgba(13, 28, 43, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-default)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
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
                backgroundColor: isActive('/') ? 'rgba(22, 217, 227, 0.12)' : 'transparent',
                border: isActive('/') ? '1px solid rgba(22, 217, 227, 0.3)' : '1px solid transparent',
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
                backgroundColor: isActive('/projects') ? 'rgba(22, 217, 227, 0.12)' : 'transparent',
                border: isActive('/projects') ? '1px solid rgba(22, 217, 227, 0.3)' : '1px solid transparent',
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
                backgroundColor: isActive('/health') ? 'rgba(22, 217, 227, 0.12)' : 'transparent',
                border: isActive('/health') ? '1px solid rgba(22, 217, 227, 0.3)' : '1px solid transparent',
                fontWeight: isActive('/health') ? 700 : 500,
                transition: 'all 0.15s ease'
              }}
            >
              System Status
            </Link>
          </nav>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
