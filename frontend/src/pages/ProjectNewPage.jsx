import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import FeedbackMessage from '../components/common/FeedbackMessage';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { api, ApiError } from '../services/api';

// Canonical Validation Boundaries
const TITLE_MIN = 3;
const TITLE_MAX = 120;
const IDEA_MIN = 50;
const IDEA_MAX = 10000;

const DRAFT_STORAGE_KEY = 'ideastruct_new_project_draft';

// Canonical Example
const EXAMPLE_TITLE = 'PulseIoT — Cold-Chain Refrigerated Fleet Monitoring';
const EXAMPLE_IDEA = `A connected hybrid IoT telematics platform for pharmaceutical cold-chain logistics fleets to prevent vaccine and medication spoilage during transit.

Physical refrigerated container pods are equipped with an ESP32 microcontroller, dual DS18B20 digital temperature probes, an SHT31 humidity sensor, a NEO-6M GPS receiver, and a visual multi-state OLED status beacon.

When in transit, the edge controller aggregates GPS coordinates and temperature readings every 3 seconds and transmits compressed JSON packets to an MQTT cloud broker over LTE-M cellular telemetry.

The cloud backend ingests telemetry streams into MongoDB time-series collections, evaluates excursion safety thresholds, and alerts dispatchers via SMS/email if compartment temperatures breach the +2°C to +8°C safety corridor.

Logistics dispatchers and pharmaceutical compliance officers use a React web dashboard to inspect live convoy locations on a map, view historical thermal drift charts, and export signed FDA 21 CFR Part 11 compliance audit certificates.`;

// Inspiration Starter Templates across Software, Hardware, and Hybrid
const IDEA_STARTERS = [
  {
    label: 'Hybrid IoT',
    type: 'HYBRID',
    accentColor: 'var(--accent-purple)',
    badgeClass: 'badge-purple',
    title: 'PulseIoT Cold-Chain Telemetry',
    idea: EXAMPLE_IDEA,
  },
  {
    label: 'Hardware',
    type: 'HARDWARE',
    accentColor: 'var(--accent-green)',
    badgeClass: 'badge-up',
    title: 'SentinelAir Gas & Smoke Circuit',
    idea: `An autonomous standalone hazardous gas and smoke detection circuit for chemistry laboratories and maker workshops.

The physical device utilizes an ESP32 microcontroller, an MQ-135 electrochemical VOC/gas sensor, a DHT22 temperature and humidity sensor for thermal calibration, a local 0.96-inch monochrome I2C OLED display, an active 85dB piezo siren, and a flashing red emergency alert LED.

The firmware executes continuous sub-second ADC voltage sampling, applies baseline calibration curves, and sounds an immediate audio-visual alarm whenever combustible gas concentrations exceed 400 PPM without requiring any internet connection.`,
  },
  {
    label: 'Software',
    type: 'SOFTWARE',
    accentColor: 'var(--accent-cyan)',
    badgeClass: 'badge-aqua',
    title: 'CampusBite Food Ordering',
    idea: `A web application for university students and faculty to pre-order meals from on-campus dining halls and food trucks to eliminate long lunch lines between lectures.

Students browse daily vendor menus, customize options, pay using student campus cards or digital wallets, and receive push notifications when their order is ready for pickup.

Dining hall staff have a real-time kitchen display to manage ticket queues, update stock availability, and view analytics on peak meal rushes.`,
  },
  {
    label: 'Software',
    type: 'SOFTWARE',
    accentColor: 'var(--accent-blue)',
    badgeClass: 'badge-blue',
    title: 'StudySync Collaboration Portal',
    idea: `A collaborative web platform for university students to form course-specific study groups, share annotated lecture notes, coordinate library study pod reservations, and schedule mock exam review sessions with verified classmates.`,
  },
  {
    label: 'Hardware',
    type: 'HARDWARE',
    accentColor: 'var(--accent-orange)',
    badgeClass: 'badge-orange',
    title: 'HydroSense Soil Moisture Controller',
    idea: `An embedded microcontroller circuit for greenhouse micro-irrigation. Uses an RP2040 microcontroller, capacitive soil moisture sensors, a 12V DC solenoid water valve controlled via MOSFET switch, and a 16x2 LCD display to automatically trigger localized drip irrigation when soil dry points are reached.`,
  },
];

/**
 * Heuristic client-side preview classifier (keyword scoring)
 */
function detectProjectTypePreview(text = '') {
  if (!text || text.trim().length < 20) {
    return { type: 'AUTO', confidence: 'LOW', reason: 'Insufficient text for classification' };
  }
  const lower = text.toLowerCase();

  const hwKeywords = [
    'circuit', 'sensor', 'microcontroller', 'esp32', 'arduino', 'pin', 'gpio',
    'resistor', 'led', 'buzzer', 'pcb', 'wiring', 'breadboard', 'adc', 'i2c',
    'actuator', 'solenoid', 'voltage', 'dht22', 'oled display', 'hardware',
  ];

  const swKeywords = [
    'web app', 'mobile app', 'dashboard', 'frontend', 'backend', 'api',
    'database', 'react', 'user flow', 'screen', 'login', 'portal', 'software',
    'crud', 'jwt', 'rest',
  ];

  let hwScore = 0;
  let swScore = 0;

  hwKeywords.forEach((kw) => {
    if (lower.includes(kw)) hwScore++;
  });

  swKeywords.forEach((kw) => {
    if (lower.includes(kw)) swScore++;
  });

  if (hwScore >= 2 && swScore >= 2) {
    return { type: 'HYBRID', confidence: 'HIGH', reason: 'Strong multi-domain keyword matches' };
  }
  if (hwScore >= 2 && swScore === 0) {
    return { type: 'HARDWARE', confidence: 'HIGH', reason: 'Strong hardware component keywords detected' };
  }
  if (swScore >= 2 && hwScore === 0) {
    return { type: 'SOFTWARE', confidence: 'HIGH', reason: 'Strong software application keywords detected' };
  }
  if (hwScore >= 1 && swScore >= 1) {
    return { type: 'HYBRID', confidence: 'LOW', reason: 'Sparse multi-domain keywords; needs confirmation' };
  }
  if (hwScore >= 1) {
    return { type: 'HARDWARE', confidence: 'LOW', reason: 'Heuristic keyword match is sparse; needs confirmation' };
  }
  if (swScore >= 1) {
    return { type: 'SOFTWARE', confidence: 'LOW', reason: 'Heuristic keyword match is sparse; needs confirmation' };
  }

  return { type: 'SOFTWARE', confidence: 'LOW', reason: 'No domain keywords detected; needs confirmation' };
}

export default function ProjectNewPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const titleInputRef = useRef(null);
  const ideaTextareaRef = useRef(null);

  const isExampleRequested = new URLSearchParams(location.search).get('example') === 'true';

  const [title, setTitle] = useState(() => {
    if (isExampleRequested) return EXAMPLE_TITLE;
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.title || '';
      }
    } catch {
      // ignore
    }
    return '';
  });

  const [idea, setIdea] = useState(() => {
    if (isExampleRequested) return EXAMPLE_IDEA;
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.idea || '';
      }
    } catch {
      // ignore
    }
    return '';
  });

  // Project Type Override (default 'AUTO', or preselected via ?type= query param from Home page)
  const [typeOverride, setTypeOverride] = useState(() => {
    const urlType = new URLSearchParams(location.search).get('type');
    const validTypes = ['SOFTWARE', 'HARDWARE', 'HYBRID'];
    return validTypes.includes(urlType) ? urlType : 'AUTO';
  });

  const [touched, setTouched] = useState({ title: false, idea: false });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const [draftRestored, setDraftRestored] = useState(() => {
    if (isExampleRequested) return false;
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return !!(parsed.title || parsed.idea);
      }
    } catch {
      // ignore
    }
    return false;
  });

  const [userNotification, setUserNotification] = useState(() => {
    if (isExampleRequested) {
      return 'Example loaded. You can customize the idea before creating your project.';
    }
    return null;
  });

  // Save draft
  useEffect(() => {
    if (title.trim() || idea.trim()) {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ title, idea }));
      } catch {
        // ignore
      }
    }
  }, [title, idea]);

  // Detected project type preview (honest keyword scoring heuristic)
  const classificationPreview = useMemo(() => {
    return detectProjectTypePreview(`${title} ${idea}`);
  }, [title, idea]);

  const detectedType = classificationPreview.type;
  const isLowConfidence = classificationPreview.confidence === 'LOW' && (title.trim().length >= 3 || idea.trim().length >= 20);
  const effectiveType = typeOverride !== 'AUTO' ? typeOverride : detectedType;

  // Validation function
  const validate = (t, i) => {
    const errs = {};
    const trimmedTitle = t.trim();
    const trimmedIdea = i.trim();

    if (!trimmedTitle) {
      errs.title = 'Project name is required.';
    } else if (trimmedTitle.length < TITLE_MIN) {
      errs.title = `Title must be at least ${TITLE_MIN} characters.`;
    } else if (trimmedTitle.length > TITLE_MAX) {
      errs.title = `Title cannot exceed ${TITLE_MAX} characters.`;
    }

    if (!trimmedIdea) {
      errs.idea = 'Please describe your project idea.';
    } else if (trimmedIdea.length < IDEA_MIN) {
      errs.idea = `Idea must be at least ${IDEA_MIN} characters. (Currently ${trimmedIdea.length})`;
    } else if (trimmedIdea.length > IDEA_MAX) {
      errs.idea = `Idea cannot exceed ${IDEA_MAX} characters.`;
    }

    return errs;
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (touched.title) {
      const fieldErrors = validate(val, idea);
      setErrors((prev) => {
        const next = { ...prev };
        if (fieldErrors.title) next.title = fieldErrors.title;
        else delete next.title;
        return next;
      });
    }
  };

  const handleIdeaChange = (e) => {
    const val = e.target.value;
    setIdea(val);
    if (touched.idea) {
      const fieldErrors = validate(title, val);
      setErrors((prev) => {
        const next = { ...prev };
        if (fieldErrors.idea) next.idea = fieldErrors.idea;
        else delete next.idea;
        return next;
      });
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const currentTitle = titleInputRef.current ? titleInputRef.current.value : title;
    const currentIdea = ideaTextareaRef.current ? ideaTextareaRef.current.value : idea;
    setErrors(validate(currentTitle, currentIdea));
  };

  const handleUseExample = () => {
    setTitle(EXAMPLE_TITLE);
    setIdea(EXAMPLE_IDEA);
    setErrors({});
    setTouched({ title: true, idea: true });
    setUserNotification('PulseIoT Hybrid example added. You can edit it before creating the project.');
  };

  const handleClearDraft = () => {
    setTitle('');
    setIdea('');
    setTypeOverride('AUTO');
    setErrors({});
    setTouched({ title: false, idea: false });
    setDraftRestored(false);
    setUserNotification(null);
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const handleApplyStarter = (starter) => {
    setTitle(starter.title);
    setIdea(starter.idea);
    setTypeOverride(starter.type || 'AUTO');
    setErrors({});
    setTouched({ title: true, idea: true });
    setUserNotification(`Loaded starter: "${starter.title}". IdeaStruct AI will automatically plan this project!`);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setTouched({ title: true, idea: true });
    const currentTitle = titleInputRef.current ? titleInputRef.current.value : title;
    const currentIdea = ideaTextareaRef.current ? ideaTextareaRef.current.value : idea;
    const validationErrors = validate(currentTitle, currentIdea);
    setErrors(validationErrors);
    setServerError(null);

    if (Object.keys(validationErrors).length > 0) {
      if (validationErrors.title && titleInputRef.current) {
        titleInputRef.current.focus();
      } else if (validationErrors.idea && ideaTextareaRef.current) {
        ideaTextareaRef.current.focus();
      }
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createProject({
        title: currentTitle.trim(),
        idea: currentIdea.trim(),
        typeOverride,
      });

      localStorage.removeItem(DRAFT_STORAGE_KEY);
      navigate(`/projects/${created.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.data?.fieldErrors) {
        setErrors(err.data.fieldErrors);
      } else {
        setServerError(err.message || 'Failed to save project. Ensure the backend is reachable.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ErrorBoundary level="page" sectionName="New Project">
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
        <Navbar />

      <main className="container" style={{ flex: 1, paddingBottom: '3.5rem' }}>
        {/* Navigation / Header */}
        <div style={{ marginBottom: '1.75rem', paddingTop: '0.75rem' }}>
          <Link
            to="/projects"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              marginBottom: '1rem',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
          >
            ← Back to Projects
          </Link>

          {/* Step Indicator */}
          <div style={{ marginBottom: '0.5rem' }}>
            <span className="badge badge-aqua" style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.75rem' }}>
              Step 1 of 2 · Describe your idea
            </span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Create a New Project
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, maxWidth: '680px' }}>
            Tell us what you want to build, who will use it, and what it should do.
            IdeaStruct AI automatically classifies and designs Software, Hardware, and Hybrid systems.
          </p>
        </div>

        {/* Restored Draft Banner */}
        {draftRestored && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.875rem 1.25rem',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-bright)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
              boxShadow: 'var(--glow-cyan)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              <span>📝</span>
              <span>We restored your unfinished project idea from your previous session.</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setDraftRestored(false)}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
              >
                Continue editing
              </button>
              <button
                type="button"
                id="btn-clear-draft"
                onClick={handleClearDraft}
                className="btn btn-ghost"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', color: 'var(--text-muted)' }}
              >
                Clear draft
              </button>
            </div>
          </div>
        )}

        {/* Notification */}
        {userNotification && (
          <FeedbackMessage
            type="info"
            message={userNotification}
            onDismiss={() => setUserNotification(null)}
          />
        )}

        {/* Server Save Error */}
        {serverError && (
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--status-down-bg)',
              border: '1px solid var(--status-down-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--status-down)',
              marginBottom: '1.5rem',
              fontSize: '0.9375rem',
            }}
          >
            <strong>Save Error:</strong> {serverError}
          </div>
        )}

        {/* 2-Column Responsive Layout: Form Left, Guide Right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          {/* Main Form Left Column */}
          <div className="card" style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit} noValidate>
              {/* Project Name Field */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                  <label htmlFor="project-title" style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    Project name <span style={{ color: 'var(--status-down)' }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.75rem', color: title.length > TITLE_MAX ? 'var(--status-down)' : 'var(--text-muted)' }}>
                    {title.length} / {TITLE_MAX}
                  </span>
                </div>

                <input
                  ref={titleInputRef}
                  id="project-title"
                  name="title"
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  onBlur={() => handleBlur('title')}
                  placeholder="e.g. SentinelAir — Autonomous Hazardous Gas Detection"
                  aria-invalid={!!errors.title}
                  aria-describedby="title-help title-error"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '0.9375rem',
                    borderRadius: 'var(--radius-md)',
                    border: errors.title ? '1px solid var(--status-down)' : '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                  }}
                />

                <p id="title-help" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.375rem', marginBottom: 0 }}>
                  A clear, memorable name for your project (3 to 120 characters).
                </p>

                {errors.title && (
                  <p id="title-error" role="alert" style={{ fontSize: '0.8125rem', color: 'var(--status-down)', marginTop: '0.375rem', marginBottom: 0 }}>
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Idea Textarea Field */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                  <label htmlFor="project-idea" style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    Describe your project idea <span style={{ color: 'var(--status-down)' }}>*</span>
                  </label>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: idea.length < IDEA_MIN ? 'var(--status-warn)' : idea.length > IDEA_MAX ? 'var(--status-down)' : 'var(--accent-green)',
                    }}
                  >
                    {idea.length} / {IDEA_MAX} chars (min {IDEA_MIN})
                  </span>
                </div>

                <textarea
                  ref={ideaTextareaRef}
                  id="project-idea"
                  name="idea"
                  rows={8}
                  value={idea}
                  onChange={handleIdeaChange}
                  onBlur={() => handleBlur('idea')}
                  placeholder="Tell us what you want to build, who will use it, and what it should do. Describe physical sensors or digital features freely."
                  aria-invalid={!!errors.idea}
                  aria-describedby="idea-help idea-error"
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    fontSize: '0.9375rem',
                    lineHeight: 1.6,
                    borderRadius: 'var(--radius-md)',
                    border: errors.idea ? '1px solid var(--status-down)' : '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    resize: 'vertical',
                    outline: 'none',
                    minHeight: '180px',
                    transition: 'all 0.15s ease',
                  }}
                />

                <p id="idea-help" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.375rem', marginBottom: 0 }}>
                  Tell us what you want to build, who will use it, and what it should do.
                </p>

                {errors.idea && (
                  <p id="idea-error" role="alert" style={{ fontSize: '0.8125rem', color: 'var(--status-down)', marginTop: '0.375rem', marginBottom: 0 }}>
                    {errors.idea}
                  </p>
                )}
              </div>

              {/* Automatic Project Type Classification Badge & Advanced Override */}
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        PROJECT CLASSIFICATION:
                      </span>
                      <span
                        id="badge-detected-type"
                        className="badge"
                        style={{
                          backgroundColor:
                            effectiveType === 'HARDWARE'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : effectiveType === 'HYBRID'
                              ? 'rgba(168, 85, 247, 0.15)'
                              : effectiveType === 'SOFTWARE'
                              ? 'rgba(56, 189, 248, 0.15)'
                              : 'rgba(255, 255, 255, 0.08)',
                          color:
                            effectiveType === 'HARDWARE'
                              ? '#10b981'
                              : effectiveType === 'HYBRID'
                              ? '#a855f7'
                              : effectiveType === 'SOFTWARE'
                              ? 'var(--accent-cyan)'
                              : 'var(--text-muted)',
                          fontWeight: 700,
                        }}
                      >
                        {typeOverride !== 'AUTO' ? `${typeOverride} (User Confirmed)` : `Auto: ${detectedType}`}
                      </span>

                      {typeOverride === 'AUTO' && isLowConfidence && (
                        <span
                          id="badge-low-confidence"
                          className="badge badge-warn"
                          style={{ fontSize: '0.7rem' }}
                        >
                          Needs confirmation
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {typeOverride !== 'AUTO'
                        ? `Project type explicitly set to ${typeOverride}. This selection will guide DEMO and LIVE AI generation.`
                        : isLowConfidence
                        ? `Keyword heuristic confidence is LOW (${classificationPreview.reason}). You can confirm a type below or let LIVE AI decide.`
                        : `IdeaStruct AI detected ${detectedType} from your description keywords. You can override it if desired.`}
                    </div>
                  </div>

                  {/* Optional Override Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <label htmlFor="type-override" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Type:
                    </label>
                    <select
                      id="type-override"
                      value={typeOverride}
                      onChange={(e) => setTypeOverride(e.target.value)}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      <option value="AUTO">Auto Detect (Default)</option>
                      <option value="SOFTWARE">Software</option>
                      <option value="HARDWARE">Hardware</option>
                      <option value="HYBRID">Hybrid</option>
                    </select>
                  </div>
                </div>

                {/* Low-confidence one-click confirmation actions */}
                {typeOverride === 'AUTO' && isLowConfidence && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      paddingTop: '0.5rem',
                      borderTop: '1px dashed var(--border-subtle)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: 'var(--status-warn)', fontWeight: 600 }}>
                      Confirm Project Type:
                    </span>
                    <button
                      type="button"
                      id="btn-confirm-software"
                      onClick={() => setTypeOverride('SOFTWARE')}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                    >
                      Software
                    </button>
                    <button
                      type="button"
                      id="btn-confirm-hardware"
                      onClick={() => setTypeOverride('HARDWARE')}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                    >
                      Hardware
                    </button>
                    <button
                      type="button"
                      id="btn-confirm-hybrid"
                      onClick={() => setTypeOverride('HYBRID')}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                    >
                      Hybrid
                    </button>
                  </div>
                )}
              </div>

              {/* Form Action Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.5rem' }}>
                <button
                  type="button"
                  id="btn-use-example"
                  onClick={handleUseExample}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.875rem' }}
                >
                  💡 Use Example Idea
                </button>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Link to="/projects" className="btn btn-ghost" style={{ fontSize: '0.875rem' }}>
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    id="btn-submit-idea"
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="btn btn-primary"
                    style={{ fontSize: '0.9375rem', padding: '0.625rem 1.5rem', fontWeight: 700 }}
                  >
                    {submitting ? 'Creating project...' : 'Create Project'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Idea Helper & Inspiration Starters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Guide Card */}
            <div
              className="card"
              style={{
                padding: '1.5rem',
                backgroundColor: 'var(--bg-secondary)',
                borderLeft: '4px solid var(--accent-cyan)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem' }}>💡</span>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Project Planning Guide
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                Tell us what you want to build. You can describe:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>💻</span>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Software Systems</strong>
                    <div style={{ color: 'var(--text-muted)' }}>Web apps, mobile interfaces, cloud APIs, data pipelines.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#10b981', fontWeight: 800 }}>⚡</span>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Hardware Circuits</strong>
                    <div style={{ color: 'var(--text-muted)' }}>Microcontrollers, sensors, actuators, wiring diagrams, 3D enclosures.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#a855f7', fontWeight: 800 }}>🔄</span>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Hybrid IoT Projects</strong>
                    <div style={{ color: 'var(--text-muted)' }}>Connected devices transmitting telemetry to cloud dashboards.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inspiration Starters */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Inspiration Starters
                </h3>
                <span className="badge badge-aqua" style={{ fontSize: '0.625rem' }}>Software • Hardware • Hybrid</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.45 }}>
                Click any starter to load a realistic engineering template:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {IDEA_STARTERS.map((s) => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => handleApplyStarter(s)}
                    className="btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.625rem 0.875rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <span className={`badge ${s.badgeClass}`} style={{ fontSize: '0.625rem', marginRight: '0.5rem' }}>
                        {s.label}
                      </span>
                      <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{s.title}</strong>
                    </div>
                    <span style={{ color: s.accentColor, fontSize: '0.875rem' }}>+ Load</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </ErrorBoundary>
  );
}
