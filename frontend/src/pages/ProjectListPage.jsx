import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import FeedbackMessage from '../components/common/FeedbackMessage';
import TechnicalDetails from '../components/common/TechnicalDetails';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { formatUserFriendlyError } from '../utils/errorMessages';
import { api } from '../services/api';

export default function ProjectListPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [successFeedback, setSuccessFeedback] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProjects(0, 50);
      setProjects(data.content || []);
    } catch (err) {
      setError(err.message || 'Failed to load projects from backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    api.getProjects(0, 50)
      .then((data) => {
        if (isMounted) {
          setProjects(data.content || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load projects from backend.');
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Keyboard accessibility: Escape closes delete modal
  useEffect(() => {
    if (!projectToDelete) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setProjectToDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [projectToDelete]);

  // Summary counts computed strictly from loaded projects
  const counts = useMemo(() => {
    const total = projects.length;
    const ready = projects.filter((p) => p.hasBlueprint && !p.blueprintOutdated).length;
    const needsPlan = projects.filter((p) => !p.hasBlueprint).length;
    const needsUpdate = projects.filter((p) => p.hasBlueprint && p.blueprintOutdated).length;
    return { total, ready, needsPlan, needsUpdate };
  }, [projects]);

  // Client-side filtering and search
  const filteredProjects = useMemo(() => {
    let list = projects;

    if (statusFilter === 'READY') {
      list = list.filter((p) => p.hasBlueprint && !p.blueprintOutdated);
    } else if (statusFilter === 'NEEDS_PLAN') {
      list = list.filter((p) => !p.hasBlueprint);
    } else if (statusFilter === 'NEEDS_UPDATE') {
      list = list.filter((p) => p.hasBlueprint && p.blueprintOutdated);
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter((p) =>
        (p.title && p.title.toLowerCase().includes(query)) ||
        (p.idea && p.idea.toLowerCase().includes(query))
      );
    }

    return list;
  }, [projects, statusFilter, searchQuery]);

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    setDeleting(true);
    setActionError(null);
    try {
      const deletedTitle = projectToDelete.title;
      await api.deleteProject(projectToDelete.id, projectToDelete.revision);
      setProjectToDelete(null);
      setSuccessFeedback(`Project "${deletedTitle}" was deleted successfully.`);
      await fetchProjects();
    } catch (err) {
      const friendly = formatUserFriendlyError(err, 'deleting this project');
      setActionError(friendly);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ErrorBoundary level="page" sectionName="Projects List">
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
        <Navbar />

      <main className="container" style={{ flex: 1, paddingBottom: '3.5rem' }}>
        {/* =============================================================== */}
        {/* 1. PAGE HEADER                                                  */}
        {/* =============================================================== */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingTop: '1rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-aqua" style={{ fontSize: '0.6875rem' }}>Workspace</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
              My Projects
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', margin: 0 }}>
              Create, review, and continue your software, hardware, and hybrid planning projects.
            </p>
          </div>
          <Link
            to="/projects/new"
            className="btn btn-primary"
            id="btn-create-project-top"
            style={{ fontSize: '0.9375rem', padding: '0.625rem 1.25rem' }}
          >
            <span style={{ fontSize: '1.125rem', lineHeight: 1, marginRight: '0.25rem', fontWeight: 800 }}>+</span>
            New Project
          </Link>
        </div>

        {/* Global Feedback Banners */}
        {successFeedback && (
          <FeedbackMessage
            type="success"
            message={successFeedback}
            onDismiss={() => setSuccessFeedback(null)}
          />
        )}

        {actionError && (
          <FeedbackMessage
            type="error"
            message={actionError.message}
            details={actionError.technical}
            onDismiss={() => setActionError(null)}
          />
        )}

        {error && (
          <div style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--status-down-bg)',
            border: '1px solid var(--status-down-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--status-down)',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div><strong>Error loading projects:</strong> {error}</div>
            <button onClick={fetchProjects} className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>
              Retry
            </button>
          </div>
        )}

        {/* =============================================================== */}
        {/* 2. PROJECT SUMMARY AREA (Stat Cards)                            */}
        {/* =============================================================== */}
        {!loading && projects.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}>
            {/* Total Projects - Blue Accent */}
            <div className="card" style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              borderTop: '3px solid var(--accent-blue)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Projects
                </span>
                <span style={{ fontSize: '1.25rem' }}>📁</span>
              </div>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-blue)', marginTop: '0.375rem' }}>
                {counts.total}
              </span>
            </div>

            {/* Plans Ready - Green Accent */}
            <div className="card" style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              borderTop: '3px solid var(--accent-green)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Plans Ready
                </span>
                <span style={{ fontSize: '1.25rem' }}>✅</span>
              </div>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-green)', marginTop: '0.375rem' }}>
                {counts.ready}
              </span>
            </div>

            {/* Ideas Waiting for a Plan - Amber/Orange Accent */}
            <div className="card" style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              borderTop: '3px solid var(--accent-orange)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Ideas Waiting for a Plan
                </span>
                <span style={{ fontSize: '1.25rem' }}>💡</span>
              </div>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-orange)', marginTop: '0.375rem' }}>
                {counts.needsPlan}
              </span>
            </div>

            {/* Plans Needing Update - Purple Accent */}
            <div className="card" style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              borderTop: '3px solid var(--accent-purple)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Plans Needing Update
                </span>
                <span style={{ fontSize: '1.25rem' }}>🔄</span>
              </div>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-purple)', marginTop: '0.375rem' }}>
                {counts.needsUpdate}
              </span>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* 3. SEARCH & FILTER CONTROLS                                     */}
        {/* =============================================================== */}
        {!loading && projects.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem',
            padding: '0.875rem 1.25rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {/* Search Input */}
            <div style={{ flex: '1 1 280px', maxWidth: '420px', position: 'relative' }}>
              <label htmlFor="input-search-projects" className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                Search projects
              </label>
              <input
                id="input-search-projects"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by title or idea..."
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem 0.625rem 2.25rem',
                  fontSize: '0.875rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.15s ease'
                }}
              />
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', fontSize: '0.875rem' }}>
                🔍
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '0.625rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                  aria-label="Clear search text"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }} role="tablist" aria-label="Filter projects by status">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className="btn"
                style={{
                  fontSize: '0.8125rem',
                  padding: '0.4rem 0.875rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: statusFilter === 'ALL' ? 700 : 500,
                  backgroundColor: statusFilter === 'ALL' ? 'var(--accent-aqua-light)' : 'rgba(130, 170, 200, 0.08)',
                  color: statusFilter === 'ALL' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  border: statusFilter === 'ALL' ? '1px solid rgba(22, 217, 227, 0.4)' : '1px solid transparent',
                  boxShadow: statusFilter === 'ALL' ? 'var(--glow-cyan)' : 'none'
                }}
              >
                All ({counts.total})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('READY')}
                className="btn"
                style={{
                  fontSize: '0.8125rem',
                  padding: '0.4rem 0.875rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: statusFilter === 'READY' ? 700 : 500,
                  backgroundColor: statusFilter === 'READY' ? 'rgba(55, 217, 150, 0.16)' : 'rgba(130, 170, 200, 0.08)',
                  color: statusFilter === 'READY' ? 'var(--accent-green)' : 'var(--text-secondary)',
                  border: statusFilter === 'READY' ? '1px solid rgba(55, 217, 150, 0.4)' : '1px solid transparent',
                  boxShadow: statusFilter === 'READY' ? 'var(--glow-green)' : 'none'
                }}
              >
                Plan Ready ({counts.ready})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('NEEDS_PLAN')}
                className="btn"
                style={{
                  fontSize: '0.8125rem',
                  padding: '0.4rem 0.875rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: statusFilter === 'NEEDS_PLAN' ? 700 : 500,
                  backgroundColor: statusFilter === 'NEEDS_PLAN' ? 'rgba(255, 181, 71, 0.16)' : 'rgba(130, 170, 200, 0.08)',
                  color: statusFilter === 'NEEDS_PLAN' ? 'var(--accent-orange)' : 'var(--text-secondary)',
                  border: statusFilter === 'NEEDS_PLAN' ? '1px solid rgba(255, 181, 71, 0.4)' : '1px solid transparent'
                }}
              >
                Needs Plan ({counts.needsPlan})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('NEEDS_UPDATE')}
                className="btn"
                style={{
                  fontSize: '0.8125rem',
                  padding: '0.4rem 0.875rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: statusFilter === 'NEEDS_UPDATE' ? 700 : 500,
                  backgroundColor: statusFilter === 'NEEDS_UPDATE' ? 'rgba(139, 92, 246, 0.16)' : 'rgba(130, 170, 200, 0.08)',
                  color: statusFilter === 'NEEDS_UPDATE' ? 'var(--accent-purple)' : 'var(--text-secondary)',
                  border: statusFilter === 'NEEDS_UPDATE' ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid transparent'
                }}
              >
                Needs Update ({counts.needsUpdate})
              </button>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* 4. MAIN CONTENT AREA (Loading / Empty / Cards)                   */}
        {/* =============================================================== */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>⏳</span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Loading your saved projects...</p>
          </div>
        ) : projects.length === 0 ? (
          /* True Zero Projects Empty State */
          <div style={{
            textAlign: 'center',
            padding: '4.5rem 1.5rem',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-strong)',
            maxWidth: '580px',
            margin: '2rem auto',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(22, 217, 227, 0.15)',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto 1.5rem',
              boxShadow: 'var(--glow-cyan)'
            }}>
              💡
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              No projects yet
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.6 }}>
              Start with a software, hardware, or hybrid idea and IdeaStruct AI will help turn it into a structured development plan.
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
              You only need a project name and a short description of your idea.
            </p>
            <Link to="/projects/new" className="btn btn-primary" id="btn-empty-create" style={{ padding: '0.75rem 1.75rem' }}>
              Create your first project
            </Link>
          </div>
        ) : filteredProjects.length === 0 ? (
          /* Search / Filter Zero Results */
          <div style={{
            textAlign: 'center',
            padding: '3.5rem 1.5rem',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            maxWidth: '520px',
            margin: '2rem auto',
          }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>🔍</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              No projects match your search
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              We could not find any projects matching &ldquo;{searchQuery}&rdquo;. Try another term or clear the filter.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
              className="btn btn-secondary"
              style={{ fontSize: '0.875rem' }}
            >
              Clear Search &amp; Filters
            </button>
          </div>
        ) : (
          /* Grid of Project Cards */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}>
            {filteredProjects.map((proj) => {
              const hasPlan = proj.hasBlueprint;
              const isOutdated = proj.blueprintOutdated;

              return (
                <div
                  key={proj.id}
                  className="card card-clickable"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                    position: 'relative',
                    borderTop: hasPlan
                      ? (isOutdated ? '3px solid var(--accent-purple)' : '3px solid var(--accent-green)')
                      : '3px solid var(--accent-orange)'
                  }}
                >
                  <div>
                    {/* Header: Status Badge + Date */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.5rem' }}>
                      {hasPlan && !isOutdated && (
                        <span className="badge badge-up" style={{ fontSize: '0.6875rem' }}>
                          ✓ Project Plan ready
                        </span>
                      )}
                      {!hasPlan && (
                        <span className="badge badge-orange" style={{ fontSize: '0.6875rem' }}>
                          ⏳ Plan not generated yet
                        </span>
                      )}
                      {hasPlan && isOutdated && (
                        <span className="badge badge-purple" style={{ fontSize: '0.6875rem' }}>
                          ⚠️ Plan may need updating
                        </span>
                      )}

                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {proj.updatedAt ? new Date(proj.updatedAt).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 style={{
                      fontSize: '1.1875rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      lineHeight: 1.3,
                      marginBottom: '0.625rem',
                    }}>
                      <Link to={`/projects/${proj.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {proj.title}
                      </Link>
                    </h3>

                    {/* Idea Snippet */}
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.55,
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {proj.idea}
                    </p>

                    {/* Next step hint */}
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      {!hasPlan && <span>Next step: Create your first Project Plan.</span>}
                      {hasPlan && !isOutdated && <span>Next step: Continue reviewing your Project Plan.</span>}
                      {hasPlan && isOutdated && <span>Next step: Your idea changed after the last plan was generated.</span>}
                    </div>

                    {/* Technical details disclosure */}
                    <TechnicalDetails summary="Technical details">
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <div>Internal ID: <code>{proj.id}</code></div>
                        <div>Revision: <code>{proj.revision}</code></div>
                        {proj.generationMetadata && (
                          <div style={{ marginTop: '0.25rem' }}>
                            Source: <strong>{proj.generationMetadata.source === 'LIVE_AI' ? 'Generated with Live AI' : proj.generationMetadata.source === 'USER_EDITED' ? 'Edited by you' : 'Generated with Demo data'}</strong>
                          </div>
                        )}
                      </div>
                    </TechnicalDetails>
                  </div>

                  {/* Footer Actions */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '1.25rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-default)',
                  }}>
                    <Link
                      to={`/projects/${proj.id}`}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8125rem', padding: '0.45rem 1rem' }}
                    >
                      Open Project →
                    </Link>

                    <button
                      type="button"
                      onClick={() => setProjectToDelete(proj)}
                      className="btn btn-ghost"
                      style={{ fontSize: '0.8125rem', color: 'var(--status-down)', padding: '0.45rem 0.625rem' }}
                      aria-label={`Delete ${proj.title}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* =============================================================== */}
        {/* 5. DELETE CONFIRMATION MODAL                                    */}
        {/* =============================================================== */}
        {projectToDelete && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(3, 8, 14, 0.75)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '1rem',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
          >
            <div className="card" style={{
              maxWidth: '460px',
              width: '100%',
              backgroundColor: 'var(--bg-card)',
              borderColor: 'rgba(255, 94, 122, 0.35)',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem', color: 'var(--status-down)' }}>⚠️</span>
                <h2 id="delete-dialog-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Delete Project?
                </h2>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Are you sure you want to delete <strong>&ldquo;{projectToDelete.title}&rdquo;</strong>? This will permanently remove this project and its saved Project Plan from IdeaStruct AI.
              </p>
              {actionError && (
                <FeedbackMessage
                  type="error"
                  message={actionError.message}
                  details={actionError.technical}
                  onDismiss={() => setActionError(null)}
                />
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setProjectToDelete(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDeleteConfirm}
                  className="btn"
                  style={{ backgroundColor: 'var(--status-down)', color: '#FFFFFF', fontWeight: 700 }}
                  id="btn-confirm-delete"
                >
                  {deleting ? 'Deleting project...' : 'Delete Project'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>
    </ErrorBoundary>
  );
}
