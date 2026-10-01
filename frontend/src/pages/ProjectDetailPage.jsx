import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import Notice from '../components/Notice';
import DashboardTabs from '../components/dashboard/DashboardTabs';
import OverviewTab from '../components/dashboard/OverviewTab';
import FeaturesTab from '../components/dashboard/FeaturesTab';
import RolesTab from '../components/dashboard/RolesTab';
import RequirementsTab from '../components/dashboard/RequirementsTab';
import DatabaseTab from '../components/dashboard/DatabaseTab';
import ApisTab from '../components/dashboard/ApisTab';
import ScreensTab from '../components/dashboard/ScreensTab';
import RoadmapTab from '../components/dashboard/RoadmapTab';
import DiagramTab from '../components/dashboard/DiagramTab';
import ValidationTab from '../components/dashboard/ValidationTab';
import EstimatesTab from '../components/dashboard/EstimatesTab';
import ArchitectureTab from '../components/dashboard/ArchitectureTab';
import TechStackTab from '../components/dashboard/TechStackTab';
import SoftwarePrototypeTab from '../components/dashboard/SoftwarePrototypeTab';
import ComponentsTab from '../components/dashboard/ComponentsTab';
import ConnectionsTab from '../components/dashboard/ConnectionsTab';
import FirmwareTab from '../components/dashboard/FirmwareTab';
import ThreeDModelTab from '../components/dashboard/ThreeDModelTab';
import SimplePlanDashboard from '../components/dashboard/SimplePlanDashboard';
import EditBlueprintModal from '../components/dashboard/EditBlueprintModal';
import RegenerateModal from '../components/dashboard/RegenerateModal';
import FeedbackMessage from '../components/common/FeedbackMessage';
import TechnicalDetails from '../components/common/TechnicalDetails';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { formatUserFriendlyError } from '../utils/errorMessages';
import { api } from '../services/api';

const GENERATION_STAGES = [
  'Understanding your idea...',
  'Identifying project type...',
  'Structuring requirements...',
  'Planning architecture...',
  'Preparing estimates...',
  'Building prototype definition...',
  'Checking the plan...',
];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  // View Mode: 'simple' (default for beginners) or 'advanced' (developer dashboard)
  const [viewMode, setViewMode] = useState('simple');
  const [activeTab, setActiveTab] = useState('overview');

  // Metadata Edit state (title/idea)
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editIdea, setEditIdea] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState(null);
  const [conflictNotice, setConflictNotice] = useState(null);

  // Blueprint Editing & Regeneration Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [savingBlueprint, setSavingBlueprint] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('IDLE'); // 'IDLE' | 'GENERATING' | 'SUCCESS' | 'ERROR'
  const [genError, setGenError] = useState(null);
  const [genErrorDetails, setGenErrorDetails] = useState(null);
  const [genStageIndex, setGenStageIndex] = useState(0);
  const generationCardRef = useRef(null);

  // Cycle real generation stage labels without fake percentages
  useEffect(() => {
    if (!generating) {
      setGenStageIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setGenStageIndex((idx) => (idx + 1) % GENERATION_STAGES.length);
    }, 1500);
    return () => clearInterval(timer);
  }, [generating]);

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Validation state
  const [revalidating, setRevalidating] = useState(false);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    setError(null);
    setConflictNotice(null);
    try {
      const data = await api.getProject(id);
      setProject(data);
      setEditTitle(data.title);
      setEditIdea(data.idea);
    } catch (err) {
      if (err.status === 404) {
        setError('Project not found. It may have been deleted.');
      } else {
        setError(err.message || 'Failed to load project details.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setProject(null);
    setError(null);
    setConflictNotice(null);
    setActionError(null);

    api.getProject(id)
      .then((data) => {
        if (!isMounted) return;
        setProject(data);
        setEditTitle(data.title || '');
        setEditIdea(data.idea || '');
        setError(null);
        setConflictNotice(null);

        // Sanitize activeTab if previous tab belongs to another project type
        const pType = (data.blueprint?.projectType || data.projectType || 'SOFTWARE').toUpperCase();
        const hwTabs = ['components', 'connections', 'firmware', 'threedmodel'];
        const swTabs = ['architecture', 'techstack', 'database', 'apis', 'screens', 'prototype'];

        setActiveTab((currTab) => {
          if (pType === 'SOFTWARE' && hwTabs.includes(currTab)) return 'overview';
          if (pType === 'HARDWARE' && swTabs.includes(currTab)) return 'overview';
          return currTab;
        });
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err.status === 404) {
          setError('Project not found. It may have been deleted.');
        } else {
          setError(err.message || 'Failed to load project details.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSaveMetadata = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    setEditError(null);
    setConflictNotice(null);

    try {
      const updated = await api.updateProject(
        id,
        {
          title: editTitle.trim(),
          idea: editIdea.trim(),
          expectedRevision: project.revision,
        },
        project.revision
      );
      setProject(updated);
      setIsEditing(false);
    } catch (err) {
      if (err.status === 409) {
        setConflictNotice(
          'This project was modified concurrently by another request. Please reload to review the latest changes.'
        );
      } else {
        setEditError(err.message || 'Failed to update project metadata.');
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const handleGenerateBlueprint = async (mode = 'AUTO') => {
    if (generating) return;
    setGenerating(true);
    setGenerationStatus('GENERATING');
    setGenError(null);
    setGenErrorDetails(null);
    setConflictNotice(null);

    try {
      const updated = await api.generateBlueprint(id, project.revision, mode);
      setProject(updated);
      setViewMode('simple');
      setGenerationStatus('SUCCESS');
      setGenerating(false);
    } catch (err) {
      console.error('[Live AI Generation Error]', err);
      let friendlyMsg = 'Live AI generation failed.';
      const rawMsg = err.message || '';

      if (err.status === 409) {
        friendlyMsg = 'This project changed while the plan was being generated. Please reload and try again.';
        setConflictNotice(friendlyMsg);
      } else if (err.status === 503 || rawMsg.includes('503') || rawMsg.includes('high demand') || rawMsg.includes('UNAVAILABLE')) {
        friendlyMsg = 'The AI service is temporarily experiencing high demand. Spikes are temporary — please try again in a few moments, or explore using Demo Plan.';
      } else if (err.status === 429 || rawMsg.includes('429') || rawMsg.includes('Resource has been exhausted') || rawMsg.includes('quota')) {
        friendlyMsg = 'AI quota or rate limit reached. Please wait a moment before trying again, or explore using Demo Plan.';
      } else if (err.status === 400 || rawMsg.includes('API key') || rawMsg.includes('GEMINI_API_KEY') || rawMsg.includes('not configured')) {
        friendlyMsg = 'Live AI is not configured yet. Configure GEMINI_API_KEY or explore with Demo Plan.';
      } else if (err.status === 408 || rawMsg.includes('timed out') || rawMsg.includes('timeout')) {
        friendlyMsg = 'AI generation request timed out. The model took too long to complete the plan. Please try again or explore with Demo Plan.';
      } else if (err.status === 0 || rawMsg.includes('Network') || rawMsg.includes('Failed to fetch')) {
        friendlyMsg = 'Network connection error. Could not reach IdeaStruct AI backend server.';
      } else if (rawMsg) {
        friendlyMsg = rawMsg;
      }

      const techInfo = `HTTP ${err.status || 'ERR'} (${err.code || 'UNKNOWN'}): ${rawMsg || 'No detail available'}`;
      setGenError(friendlyMsg);
      setGenErrorDetails(techInfo);
      setGenerationStatus('ERROR');
      setGenerating(false);

      setTimeout(() => {
        generationCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  };

  const handleSaveBlueprint = async (newBlueprint) => {
    setSavingBlueprint(true);
    setActionError(null);
    try {
      const updated = await api.updateBlueprint(id, newBlueprint, project.revision);
      setProject(updated);
      setShowEditModal(false);
    } catch (err) {
      if (err.status === 409) {
        setConflictNotice('This project changed while you were editing it. Reload the latest version before trying again.');
      } else {
        setActionError(formatUserFriendlyError(err, 'saving the blueprint'));
      }
    } finally {
      setSavingBlueprint(false);
    }
  };

  const handleApplyProposal = async (candidate, baseRevision) => {
    setSavingBlueprint(true);
    setActionError(null);
    try {
      const updated = await api.updateBlueprint(id, candidate, baseRevision);
      setProject(updated);
      setShowRegenModal(false);
    } catch (err) {
      if (err.status === 409) {
        setConflictNotice('This project changed while you were editing it. Reload the latest version before trying again.');
      } else {
        setActionError(formatUserFriendlyError(err, 'applying the blueprint proposal'));
      }
    } finally {
      setSavingBlueprint(false);
    }
  };

  const handleRevalidate = async () => {
    if (revalidating) return;
    setRevalidating(true);
    setActionError(null);
    try {
      const updated = await api.validateBlueprint(id, project.revision);
      setProject(updated);
    } catch (err) {
      if (err.status === 409) {
        setConflictNotice('This project changed while you were editing it. Reload the latest version before trying again.');
      } else {
        setActionError(formatUserFriendlyError(err, 'running validation'));
      }
    } finally {
      setRevalidating(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setActionError(null);
    try {
      await api.deleteProject(id, project.revision);
      navigate('/projects');
    } catch (err) {
      setActionError(formatUserFriendlyError(err, 'deleting this project'));
    } finally {
      setDeleting(false);
    }
  };

  // Keyboard accessibility: Escape key closes delete modal
  useEffect(() => {
    if (!showDeleteModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowDeleteModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDeleteModal]);

  // Helper to switch to Advanced View and focus a specific section
  const openAdvancedSection = (sectionId) => {
    setActiveTab(sectionId);
    setViewMode('advanced');
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main className="container" style={{ flex: 1, padding: '3.5rem 1rem' }}>
          <div className="card" style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center', padding: '3rem 1.5rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Loading your project...
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
              Fetching project details and plan from the server.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    const is404 = error.includes('not found') || error.includes('404');
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main className="container" style={{ flex: 1, padding: '3.5rem 1rem' }}>
          <div
            style={{
              maxWidth: '600px',
              margin: '0 auto',
              padding: '2rem',
              backgroundColor: 'var(--status-down-bg)',
              border: '1px solid var(--status-down-border)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--status-down)',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {is404 ? 'This project could not be found.' : 'Unable to load this project because IdeaStruct AI cannot connect to the backend.'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {is404
                ? 'The project ID may be invalid or it may have been deleted.'
                : 'Please check that the IdeaStruct AI backend server is running and try again.'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/projects" className="btn btn-secondary">
                ← Back to Projects
              </Link>
              <button type="button" onClick={fetchProject} className="btn btn-primary">
                Try Again
              </button>
            </div>
            <TechnicalDetails summary="Technical error details" style={{ marginTop: '1.25rem' }}>
              <code>{error}</code>
            </TechnicalDetails>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main className="container" style={{ flex: 1, padding: '3.5rem 1rem' }}>
          <div className="card text-center" style={{ maxWidth: '600px', margin: '0 auto', padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Project Not Available
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              No project data was returned from the server.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Link to="/projects" className="btn btn-secondary">
                ← Back to Projects
              </Link>
              <button type="button" onClick={fetchProject} className="btn btn-primary">
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const bp = project.blueprint;
  const hasBlueprint = bp && Object.keys(bp).length > 0;
  const genSource = project.generationMetadata?.source;

  // Friendly generation source label
  const friendlySourceLabel =
    genSource === 'LIVE_AI'
      ? 'Generated with Live AI'
      : genSource === 'DEMO'
      ? 'Generated with Demo data'
      : genSource === 'USER_EDITED'
      ? 'Edited by you'
      : null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main className="container" style={{ flex: 1, paddingBottom: '3.5rem' }}>
        <ErrorBoundary sectionName="Project Detail Content" level="page">
          {/* Navigation & Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
            <Link
              to="/projects"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
              }}
            >
              ← Back to Projects
            </Link>

            {/* Status & Provenance Badges (preserves exact test IDs and strings) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-aqua">Revision {project.revision}</span>

              {/* Project Type Badge (Honors Override & Stored Blueprint Type) */}
              {(() => {
                const effectiveType = project.blueprint?.projectType
                  || project.blueprint?.classification?.type
                  || (project.typeOverride && project.typeOverride !== 'AUTO' ? project.typeOverride : null);
                if (!effectiveType) return null;
                const isHw = effectiveType === 'HARDWARE';
                const isHy = effectiveType === 'HYBRID';
                return (
                  <span
                    id="badge-project-type"
                    className="badge"
                    style={{
                      backgroundColor: isHw ? 'rgba(16, 185, 129, 0.15)' : isHy ? 'rgba(168, 85, 247, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                      color: isHw ? '#10b981' : isHy ? '#a855f7' : 'var(--accent-cyan)',
                      fontWeight: 700,
                    }}
                  >
                    {effectiveType}{project.typeOverride && project.typeOverride !== 'AUTO' ? ' (Override)' : ''}
                  </span>
                );
              })()}

              {genSource === 'DEMO' && (
                <span className="badge badge-warn" id="badge-demo-mode">
                  Demo blueprint — sample data
                </span>
              )}
              {genSource === 'LIVE_AI' && (
                <span className="badge badge-up" id="badge-live-ai">
                  Live AI Generated (Gemini)
                </span>
              )}
              {genSource === 'USER_EDITED' && (
                <span className="badge badge-aqua" id="badge-user-edited">
                  User Edited
                </span>
              )}

              {project.blueprintOutdated && (
                <span className="badge badge-warn">Plan needs update</span>
              )}
            </div>
          </div>

          {/* Step Context */}
          <div style={{ marginBottom: '0.625rem' }}>
            {!hasBlueprint ? (
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--accent-aqua)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Step 2 of 2 · Generate your Project Plan
              </span>
            ) : (
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--status-up)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Project Plan ready
              </span>
            )}
          </div>

          {/* Project Title & Idea */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>
                {project.title}
              </h1>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.75rem', maxWidth: '800px' }}>
                {project.idea}
              </p>

              {/* Human-friendly Plan Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                <span>
                  <strong>Plan status:</strong>{' '}
                  {!hasBlueprint
                    ? 'No Project Plan yet'
                    : project.blueprintOutdated
                    ? 'Your idea changed — the Project Plan may need updating'
                    : 'Project Plan ready'}
                </span>
                {friendlySourceLabel && (
                  <>
                    <span>•</span>
                    <span>{friendlySourceLabel}</span>
                  </>
                )}
              </div>

              {/* Collapsed Technical Details */}
              <TechnicalDetails summary="Technical details" style={{ marginTop: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.8125rem' }}>
                  <div><strong>Project ID:</strong> <code>{project.id}</code></div>
                  <div><strong>Project Version:</strong> Revision {project.revision}</div>
                  <div><strong>Project Type:</strong> {project.blueprint?.projectType || project.projectType || 'AUTO'}</div>
                  <div><strong>Type Override:</strong> {project.typeOverride || 'AUTO'}</div>
                  <div><strong>Generation source:</strong> {genSource || 'None'}</div>
                  <div><strong>Provider:</strong> {project.generationMetadata?.provider || 'N/A'}</div>
                  <div><strong>Model:</strong> {project.generationMetadata?.model || 'N/A'}</div>
                  <div><strong>Generated at:</strong> {project.generationMetadata?.generatedAt || new Date(project.updatedAt).toLocaleString()}</div>
                </div>
              </TechnicalDetails>
            </div>

            {/* Header Actions & View Mode Toggle */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8125rem', padding: '0.375rem 0.875rem' }}
                  >
                    ✏️ Edit Idea
                  </button>
                )}
              </div>

              {/* View Switcher: Simple View (default) vs Advanced View */}
              {hasBlueprint && (
                <div
                  role="tablist"
                  aria-label="View Mode"
                  style={{
                    display: 'inline-flex',
                    padding: '0.25rem',
                    backgroundColor: 'var(--bg-muted)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <button
                    type="button"
                    id="btn-view-simple"
                    role="tab"
                    aria-selected={viewMode === 'simple'}
                    onClick={() => setViewMode('simple')}
                    className="btn"
                    style={{
                      padding: '0.375rem 0.875rem',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: viewMode === 'simple' ? 'var(--bg-surface)' : 'transparent',
                      color: viewMode === 'simple' ? 'var(--accent-aqua)' : 'var(--text-secondary)',
                      boxShadow: viewMode === 'simple' ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    Simple View
                  </button>
                  <button
                    type="button"
                    id="btn-view-advanced"
                    role="tab"
                    aria-selected={viewMode === 'advanced'}
                    onClick={() => setViewMode('advanced')}
                    className="btn"
                    style={{
                      padding: '0.375rem 0.875rem',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: viewMode === 'advanced' ? 'var(--bg-surface)' : 'transparent',
                      color: viewMode === 'advanced' ? 'var(--accent-aqua)' : 'var(--text-secondary)',
                      boxShadow: viewMode === 'advanced' ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    Advanced View
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Error Feedback */}
        {actionError && (
          <FeedbackMessage
            type="error"
            message={actionError.message}
            details={actionError.technical}
            onDismiss={() => setActionError(null)}
          />
        )}

        {/* Conflict Notice */}
        {conflictNotice && (
          <Notice
            type="warning"
            title="This project changed while you were editing it"
            style={{ marginBottom: '1.5rem' }}
            action={
              <button onClick={fetchProject} className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>
                Reload Project
              </button>
            }
          >
            <div>
              <p style={{ marginBottom: '0.5rem' }}>
                {conflictNotice}
              </p>
              <TechnicalDetails summary="Technical conflict details">
                <code>HTTP 409 Conflict: Project revision mismatch. Reload latest version to sync changes.</code>
              </TechnicalDetails>
            </div>
          </Notice>
        )}

        {/* Metadata Editing Card */}
        {isEditing && (
          <form onSubmit={handleSaveMetadata} className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Edit Project Title & Idea
            </h2>

            {editError && (
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--status-down-bg)', color: 'var(--status-down)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                {editError}
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                Project Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.9375rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                Project Idea (min 50 chars)
              </label>
              <textarea
                rows={6}
                value={editIdea}
                onChange={(e) => setEditIdea(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'inherit',
                  fontSize: '0.9375rem',
                  lineHeight: 1.5,
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                disabled={savingEdit}
                onClick={() => {
                  setIsEditing(false);
                  setEditTitle(project.title);
                  setEditIdea(project.idea);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="btn btn-primary"
              >
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* NO-PLAN STATE: Beginner-Focused Card                                     */}
        {/* ========================================================================= */}
        {!hasBlueprint ? (
          <div className="card" style={{ padding: '2.5rem 1.75rem', maxWidth: '820px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-aqua-light)',
                  color: 'var(--accent-aqua)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  margin: '0 auto 1rem',
                }}
              >
                ✨
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Your project idea is saved
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.6 }}>
                Now create your Project Plan.
                <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Now create a Project Plan from your idea.
                </span>
              </p>
            </div>

            {/* Plan Contents Explanation */}
            <div
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem 1.5rem',
                marginBottom: '2rem',
                border: '1px solid var(--border-default)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Your Project Plan will include:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <div>• Main Features</div>
                <div>• Users & Roles</div>
                <div>• Detailed Requirements</div>
                <div>• Data Structure</div>
                <div>• Backend APIs</div>
                <div>• App Screens</div>
                <div>• Build Roadmap</div>
                <div>• Data Map</div>
                <div>• Plan Check</div>
              </div>
            </div>

            {/* Two Generation Choices: Live AI vs Demo Plan */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {/* PRIMARY: Live AI */}
              <div
                style={{
                  border: '1px solid rgba(22, 217, 227, 0.4)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'var(--bg-card)',
                  background: 'linear-gradient(135deg, rgba(22, 217, 227, 0.05) 0%, rgba(168, 85, 247, 0.07) 100%)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(22, 217, 227, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span className="badge badge-aqua" style={{ fontSize: '0.6875rem' }}>Recommended</span>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Generate with Live AI
                  </h3>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', flex: 1, marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  Use Gemini to create a Project Plan from your project idea.
                </p>
                <button
                  type="button"
                  disabled={generating}
                  onClick={() => handleGenerateBlueprint('LIVE_AI')}
                  className="btn btn-primary"
                  id="btn-generate-live"
                  style={{ width: '100%' }}
                >
                  {generating ? 'Generating Blueprint...' : 'Generate with Live AI'}
                </button>
              </div>

              {/* SECONDARY: Demo Plan */}
              <div
                style={{
                  border: '1px solid rgba(255, 181, 71, 0.35)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'var(--bg-card)',
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.04) 0%, rgba(255, 181, 71, 0.05) 100%)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span className="badge badge-warn" style={{ fontSize: '0.6875rem' }}>Sample Data</span>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Use Demo Plan
                  </h3>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', flex: 1, marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  Explore IdeaStruct AI using sample planning data.
                </p>
                <button
                  type="button"
                  disabled={generating}
                  onClick={() => handleGenerateBlueprint('DEMO')}
                  className="btn btn-secondary"
                  id="btn-generate-demo"
                  style={{ width: '100%' }}
                >
                  {generating ? 'Generating Blueprint...' : 'Use Demo Plan'}
                </button>
              </div>
            </div>

            {generating && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '1.5rem',
                  backgroundColor: 'rgba(22, 217, 227, 0.08)',
                  border: '1px solid rgba(22, 217, 227, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '1rem' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '18px',
                      height: '18px',
                      border: '2px solid var(--accent-cyan)',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <span>{GENERATION_STAGES[genStageIndex % GENERATION_STAGES.length]}</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Creating your Project Plan... This may take a few seconds.
                </div>
              </div>
            )}

            {/* In-Card Prominent Generation Error State */}
            {genError && (
              <div
                ref={generationCardRef}
                id="generation-error-card"
                data-generation-status={generationStatus}
                style={{
                  marginTop: '1.25rem',
                  padding: '1.5rem',
                  backgroundColor: 'var(--status-down-bg)',
                  border: '1px solid var(--status-down-border)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-primary)',
                  boxShadow: '0 4px 20px rgba(255, 94, 122, 0.15)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>⚠️</span>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--status-down)', margin: '0 0 0.35rem 0' }}>
                      Live AI generation failed
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      {genError}
                    </p>
                  </div>
                </div>

                {genErrorDetails && (
                  <TechnicalDetails summary="Technical diagnostics" style={{ marginBottom: '1.25rem' }}>
                    <code>{genErrorDetails}</code>
                  </TechnicalDetails>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    id="btn-retry-live-ai"
                    onClick={() => handleGenerateBlueprint('LIVE_AI')}
                    className="btn btn-primary"
                    style={{ fontSize: '0.875rem' }}
                  >
                    🔄 Try Again with Live AI
                  </button>
                  <button
                    type="button"
                    id="btn-fallback-demo-plan"
                    onClick={() => handleGenerateBlueprint('DEMO')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.875rem' }}
                  >
                    📋 Use Demo Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGenError(null);
                      setGenErrorDetails(null);
                      setGenerationStatus('IDLE');
                    }}
                    className="btn btn-ghost"
                    style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* PLAN EXISTS: Simple View (Default) or Advanced View (Developer Dashboard) */
          /* ========================================================================= */
          <div>
            {viewMode === 'simple' ? (
              <ErrorBoundary sectionName="Project Plan Dashboard" level="section">
                <SimplePlanDashboard
                  project={project}
                  blueprint={bp}
                  validationLoading={revalidating}
                  onRunValidation={handleRevalidate}
                  onOpenSection={openAdvancedSection}
                  onOpenEdit={() => setShowEditModal(true)}
                  onOpenRegen={() => setShowRegenModal(true)}
                  onUpdatePlan={() => setShowRegenModal(true)}
                />
              </ErrorBoundary>
            ) : (
              <div>
                {/* Advanced View Section Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Advanced Developer Specification
                    </h2>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                      Detailed technical architecture specifications, schemas, endpoints, and validation reports.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowRegenModal(true)}
                      className="btn btn-secondary"
                      id="btn-open-regen-modal"
                      style={{ fontSize: '0.8125rem', padding: '0.375rem 0.875rem' }}
                    >
                      🔄 Regenerate Section
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(true)}
                      className="btn btn-secondary"
                      id="btn-open-edit-modal"
                      style={{ fontSize: '0.8125rem', padding: '0.375rem 0.875rem' }}
                    >
                      ✏️ Edit Blueprint
                    </button>
                  </div>
                </div>

                {/* Dashboard Tabs Navigation */}
                <ErrorBoundary sectionName="Navigation Tabs" level="section">
                  <DashboardTabs
                    activeTab={activeTab}
                    onSelectTab={setActiveTab}
                    validationIssues={project.validationIssues || []}
                    projectType={bp.projectType || 'SOFTWARE'}
                    softwareApplicable={bp.software?.applicable !== false}
                    hardwareApplicable={bp.hardware?.applicable === true || bp.projectType === 'HARDWARE' || bp.projectType === 'HYBRID'}
                  />
                </ErrorBoundary>

                {/* Isolated Tab Panels wrapped in individual ErrorBoundaries */}
                {activeTab === 'overview' && (
                  <ErrorBoundary sectionName="Overview" level="tab" onBack={() => setActiveTab('overview')}>
                    <OverviewTab blueprint={bp} />
                  </ErrorBoundary>
                )}
                {activeTab === 'features' && (
                  <ErrorBoundary sectionName="Features" level="tab" onBack={() => setActiveTab('overview')}>
                    <FeaturesTab blueprint={bp} />
                  </ErrorBoundary>
                )}
                {activeTab === 'roles' && (
                  <ErrorBoundary sectionName="Users & Roles" level="tab" onBack={() => setActiveTab('overview')}>
                    <RolesTab blueprint={bp} />
                  </ErrorBoundary>
                )}
                {activeTab === 'requirements' && (
                  <ErrorBoundary sectionName="Requirements" level="tab" onBack={() => setActiveTab('overview')}>
                    <RequirementsTab blueprint={bp} />
                  </ErrorBoundary>
                )}
                {activeTab === 'estimates' && (
                  <ErrorBoundary sectionName="Estimates" level="tab" onBack={() => setActiveTab('overview')}>
                    <EstimatesTab blueprint={bp} />
                  </ErrorBoundary>
                )}
                {activeTab === 'roadmap' && (
                  <ErrorBoundary sectionName="Build Roadmap" level="tab" onBack={() => setActiveTab('overview')}>
                    <RoadmapTab blueprint={bp} />
                  </ErrorBoundary>
                )}
                {activeTab === 'database' && (
                  <ErrorBoundary sectionName="Data Structure" level="tab" onBack={() => setActiveTab('overview')}>
                    <DatabaseTab blueprint={bp} />
                  </ErrorBoundary>
                )}
                {activeTab === 'apis' && (
                  <ErrorBoundary sectionName="Backend APIs" level="tab" onBack={() => setActiveTab('overview')}>
                    <ApisTab blueprint={bp} />
                  </ErrorBoundary>
                )}
                {activeTab === 'screens' && (
                  <ErrorBoundary sectionName="App Screens" level="tab" onBack={() => setActiveTab('overview')}>
                    <ScreensTab blueprint={bp} />
                  </ErrorBoundary>
                )}
                {activeTab === 'architecture' && (
                  <ErrorBoundary sectionName="Software Architecture" level="tab" onBack={() => setActiveTab('overview')}>
                    <ArchitectureTab blueprint={bp} />
                  </ErrorBoundary>
                )}
                {activeTab === 'techstack' && (
                  <ErrorBoundary sectionName="Recommended Tech Stack" level="tab" onBack={() => setActiveTab('overview')}>
                    <TechStackTab blueprint={bp} techStack={bp.software?.recommendedTechStack || bp.recommendedTechStack} />
                  </ErrorBoundary>
                )}
                {activeTab === 'prototype' && (
                  <ErrorBoundary sectionName="Software Prototype" level="tab" onBack={() => setActiveTab('overview')}>
                    <SoftwarePrototypeTab blueprint={bp} />
                  </ErrorBoundary>
                )}
                {activeTab === 'components' && (
                  <ErrorBoundary sectionName="Hardware Components" level="tab" onBack={() => setActiveTab('overview')}>
                    <ComponentsTab blueprint={bp} />
                  </ErrorBoundary>
                )}
                {activeTab === 'connections' && (
                  <ErrorBoundary sectionName="Circuit Wiring & Pins" level="tab" onBack={() => setActiveTab('overview')}>
                    <ConnectionsTab blueprint={bp} />
                  </ErrorBoundary>
                )}
                {activeTab === 'firmware' && (
                  <ErrorBoundary sectionName="Firmware Architecture" level="tab" onBack={() => setActiveTab('overview')}>
                    <FirmwareTab blueprint={bp} />
                  </ErrorBoundary>
                )}
                {activeTab === 'threedmodel' && (
                  <ErrorBoundary sectionName="3D Hardware Model" level="tab" onBack={() => setActiveTab('overview')}>
                    <ThreeDModelTab blueprint={bp} onSelectTab={setActiveTab} />
                  </ErrorBoundary>
                )}
                {activeTab === 'diagram' && (
                  <ErrorBoundary sectionName="Architecture Diagram" level="tab" onBack={() => setActiveTab('overview')}>
                    <DiagramTab blueprint={bp} />
                  </ErrorBoundary>
                )}
                {activeTab === 'validation' && (
                  <ErrorBoundary sectionName="Plan Check" level="tab" onBack={() => setActiveTab('overview')}>
                    <ValidationTab
                      project={project}
                      blueprint={bp}
                      onRevalidate={handleRevalidate}
                      revalidating={revalidating}
                      onSelectTab={setActiveTab}
                    />
                  </ErrorBoundary>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* Project Settings / Danger Area (Delete Project)                          */}
        {/* ========================================================================= */}
        <section
          aria-label="Project Danger Zone"
          className="card"
          style={{
            marginTop: '3.5rem',
            border: '1px solid rgba(255, 94, 122, 0.25)',
            backgroundColor: 'rgba(255, 94, 122, 0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--status-down)', margin: 0 }}>
                Project Settings & Danger Area
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                Permanently remove this project and all associated plan data.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-ghost"
              id="btn-delete-project"
              style={{
                color: 'var(--status-down)',
                fontSize: '0.8125rem',
                padding: '0.375rem 0.875rem',
                border: '1px solid var(--status-down-border)',
                backgroundColor: 'var(--status-down-bg)',
              }}
            >
              🗑️ Delete Project
            </button>
          </div>
        </section>

        {/* Edit Blueprint Modal */}
        <EditBlueprintModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          blueprint={bp}
          onSave={handleSaveBlueprint}
          saving={savingBlueprint}
        />

        {/* Regenerate Modal */}
        <RegenerateModal
          isOpen={showRegenModal}
          onClose={() => setShowRegenModal(false)}
          project={project}
          onApplyProposal={handleApplyProposal}
        />

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(3, 8, 14, 0.75)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem'
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-project-detail-title"
          >
            <div className="card" style={{ maxWidth: '440px', width: '100%', boxShadow: 'var(--shadow-lg), 0 0 30px rgba(0, 0, 0, 0.8)', borderColor: 'rgba(255, 94, 122, 0.35)' }}>
              <h3 id="delete-project-detail-title" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Delete Project?
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Are you sure you want to delete <strong>"{project.title}"</strong>? This will permanently remove the project and its saved Project Plan.
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
                  onClick={() => setShowDeleteModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="btn"
                  id="btn-confirm-delete"
                  style={{ backgroundColor: 'var(--status-down)', color: '#FFFFFF' }}
                >
                  {deleting ? 'Deleting project...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
        </ErrorBoundary>
      </main>
    </div>
  );
}
