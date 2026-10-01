import React, { useState, useMemo } from 'react';
import { COMPONENT_REGISTRY } from './PrototypeWhitelistComponents';

/**
 * SafePrototypeEngine
 *
 * Renders an interactive, safe software prototype model defined in blueprint.software.prototype.
 * Provides screen navigation, action handling, mock state management, and Desktop/Mobile preview modes.
 *
 * SECURITY:
 * Strictly avoids arbitrary HTML/JS execution. Only renders from validated JSON structures
 * using predefined whitelist components.
 */
export default function SafePrototypeEngine({ prototype, projectName }) {
  const screens = useMemo(() => prototype?.screens || [], [prototype]);
  const startScreenId = prototype?.startScreenId || (screens.length > 0 ? screens[0].id : null);

  const [currentScreenId, setCurrentScreenId] = useState(startScreenId);
  const [history, setHistory] = useState([startScreenId]);
  const [formValues, setFormValues] = useState({});
  const [previewMode, setPreviewMode] = useState(prototype?.platform === 'MOBILE' ? 'MOBILE' : 'DESKTOP');
  const [demoMessage, setDemoMessage] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [demoFilter, setDemoFilter] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Active Screen Resolution
  const currentScreen = useMemo(() => {
    return screens.find((s) => s.id === currentScreenId) || screens[0] || null;
  }, [screens, currentScreenId]);

  // Action Dispatcher
  const handleAction = (action) => {
    if (!action) return;

    const actionType = action.type || action.kind;

    const KNOWN_ACTIONS = [
      'NAVIGATE',
      'OPEN_MODAL',
      'CLOSE_MODAL',
      'SET_VALUE',
      'SUBMIT_DEMO',
      'SHOW_MESSAGE',
      'FILTER_DEMO_DATA',
      'SELECT_ITEM',
      'BACK',
    ];

    if (!KNOWN_ACTIONS.includes(actionType)) {
      console.warn('Unknown prototype action type:', actionType);
      setDemoMessage({
        type: 'warning',
        text: `Gracefully handled unrecognized action: ${actionType || 'unknown'}`,
      });
      return;
    }

    switch (actionType) {
      case 'NAVIGATE': {
        const targetId = action.targetScreenId || action.toScreenId;
        if (targetId && screens.some((s) => s.id === targetId)) {
          setHistory((prev) => [...prev, targetId]);
          setCurrentScreenId(targetId);
          setActiveModal(null);
          setDemoMessage(null);
        }
        break;
      }
      case 'BACK': {
        if (history.length > 1) {
          const nextHistory = [...history];
          nextHistory.pop();
          const prevScreen = nextHistory[nextHistory.length - 1];
          setHistory(nextHistory);
          setCurrentScreenId(prevScreen);
          setActiveModal(null);
          setDemoMessage(null);
        }
        break;
      }
      case 'OPEN_MODAL': {
        setActiveModal({
          isOpen: true,
          title: action.title || action.modalTitle || 'Demo Dialog',
          message: action.message || action.modalContent || action.description || 'Sample modal preview triggered by user interaction.',
          confirmLabel: action.confirmLabel || 'OK',
          closeLabel: action.closeLabel || 'Dismiss',
        });
        break;
      }
      case 'CLOSE_MODAL': {
        setActiveModal(null);
        break;
      }
      case 'FILTER_DEMO_DATA': {
        const filterVal = action.value || action.category || action.filter || 'all';
        setDemoFilter(filterVal);
        setDemoMessage({
          type: 'info',
          text: `Filtered prototype data by: "${filterVal}"`,
        });
        break;
      }
      case 'SELECT_ITEM': {
        const itemVal = action.item || action.value || action.name || 'Selected Item';
        const displayVal = typeof itemVal === 'object' ? (itemVal.label || itemVal.name || JSON.stringify(itemVal)) : String(itemVal);
        setSelectedItem(displayVal);
        setDemoMessage({
          type: 'info',
          text: `Selected: "${displayVal}"`,
        });
        break;
      }
      case 'SUBMIT_DEMO': {
        setDemoMessage({
          type: 'success',
          text: action.message || 'Demo form submitted with sample data! (No external writes performed)',
        });
        if (action.targetScreenId) {
          handleAction({ type: 'NAVIGATE', targetScreenId: action.targetScreenId });
        }
        break;
      }
      case 'SHOW_MESSAGE': {
        setDemoMessage({
          type: action.variant || 'info',
          text: action.message || 'Action executed successfully.',
        });
        break;
      }
      case 'SET_VALUE': {
        if (action.name) {
          setFormValues((prev) => ({ ...prev, [action.name]: action.value }));
        }
        break;
      }
      default:
        break;
    }
  };

  const handleInputChange = (fieldName, value) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleReset = () => {
    setCurrentScreenId(startScreenId);
    setHistory([startScreenId]);
    setFormValues({});
    setActiveModal(null);
    setDemoFilter(null);
    setSelectedItem(null);
    setDemoMessage(null);
  };

  if (!screens || screens.length === 0) {
    return (
      <div
        className="card"
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          border: '1px dashed var(--border-color)',
        }}
      >
        <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          No Interactive Software Prototype Available
        </div>
        <p style={{ fontSize: '0.875rem' }}>
          This project does not currently define an interactive software screen model.
        </p>
      </div>
    );
  }

  const isMobile = previewMode === 'MOBILE';

  return (
    <div
      aria-label="Interactive Software Prototype"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        backgroundColor: 'var(--bg-card, #0f172a)',
        border: '1px solid var(--border-color, #334155)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '1.25rem',
      }}
    >
      {/* Top Prototype Controls & Security Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-color, #1e293b)',
          paddingBottom: '0.75rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: 'var(--accent-blue, #60a5fa)',
                border: '1px solid var(--accent-blue, #3b82f6)',
              }}
            >
              Interactive Prototype — Sample Data
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Non-production controlled demo flow
            </span>
          </div>
        </div>

        {/* Viewport Switcher & Reset Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--bg-surface, #1e293b)',
              padding: '2px',
              borderRadius: '6px',
              border: '1px solid var(--border-color, #334155)',
            }}
          >
            <button
              type="button"
              onClick={() => setPreviewMode('DESKTOP')}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: !isMobile ? 'var(--accent-blue, #2563eb)' : 'transparent',
                color: !isMobile ? '#fff' : 'var(--text-secondary)',
              }}
            >
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('MOBILE')}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: isMobile ? 'var(--accent-blue, #2563eb)' : 'transparent',
                color: isMobile ? '#fff' : 'var(--text-secondary)',
              }}
            >
              Mobile
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '0.3rem 0.75rem',
              fontSize: '0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color, #334155)',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Screen Selection Breadcrumbs */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {screens.map((screen, idx) => {
          const isActive = screen.id === currentScreen?.id;
          return (
            <button
              key={screen.id}
              type="button"
              onClick={() => {
                setHistory((prev) => [...prev, screen.id]);
                setCurrentScreenId(screen.id);
                setDemoMessage(null);
              }}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                border: isActive ? '1px solid var(--accent-blue, #3b82f6)' : '1px solid var(--border-color, #334155)',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-surface, #1e293b)',
                color: isActive ? 'var(--accent-blue, #60a5fa)' : 'var(--text-muted)',
                whiteSpace: 'nowrap',
              }}
            >
              {idx + 1}. {screen.name}
            </button>
          );
        })}
      </div>

      {/* Demo Flash Message Toast */}
      {demoMessage && (
        <div
          style={{
            padding: '0.6rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            backgroundColor: demoMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
            border: `1px solid ${demoMessage.type === 'success' ? '#10b981' : '#3b82f6'}`,
            color: demoMessage.type === 'success' ? '#10b981' : '#60a5fa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{demoMessage.text}</span>
          <button
            type="button"
            onClick={() => setDemoMessage(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Device Viewport Wrapper */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: isMobile ? '1.5rem 0' : '0.5rem 0',
          backgroundColor: isMobile ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: isMobile ? '375px' : '100%',
            minHeight: isMobile ? '640px' : '400px',
            backgroundColor: 'var(--bg-surface, #1e293b)',
            border: isMobile ? '8px solid #0f172a' : '1px solid var(--border-color, #334155)',
            borderRadius: isMobile ? '36px' : '8px',
            boxShadow: isMobile ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Active Controlled Modal Overlay */}
          {activeModal?.isOpen && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                zIndex: 50,
              }}
            >
              <div
                style={{
                  backgroundColor: 'var(--bg-card, #0f172a)',
                  border: '1px solid var(--border-color, #334155)',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  maxWidth: '360px',
                  width: '100%',
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.6)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem' }}>{activeModal.title}</h4>
                  <button
                    type="button"
                    onClick={() => handleAction({ type: 'CLOSE_MODAL' })}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}
                  >
                    ✕
                  </button>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem 0 1.25rem', lineHeight: 1.4 }}>
                  {activeModal.message}
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleAction({ type: 'CLOSE_MODAL' })}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color, #334155)',
                      backgroundColor: 'transparent',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    {activeModal.closeLabel || 'Dismiss'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction({ type: 'CLOSE_MODAL' })}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: 'var(--accent-blue, #2563eb)',
                      color: '#fff',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    {activeModal.confirmLabel || 'OK'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Bezel Header or Desktop Window Top */}
          {isMobile ? (
            <div
              style={{
                height: '24px',
                backgroundColor: '#0f172a',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div style={{ width: '48px', height: '4px', backgroundColor: '#334155', borderRadius: '2px' }} />
            </div>
          ) : (
            <div
              style={{
                padding: '0.4rem 0.75rem',
                backgroundColor: 'var(--bg-card, #0f172a)',
                borderBottom: '1px solid var(--border-color, #334155)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                {projectName || 'Demo App'} • {currentScreen?.name}
              </span>
            </div>
          )}

          {/* Screen Content Render Area */}
          <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Active Demo Filters/Selections State Indicator */}
            {(demoFilter || selectedItem) && (
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                {demoFilter && (
                  <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', border: '1px solid #06b6d4' }}>
                    Active Filter: {demoFilter}
                  </span>
                )}
                {selectedItem && (
                  <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid #a855f7' }}>
                    Selected Item: {selectedItem}
                  </span>
                )}
              </div>
            )}

            {/* Screen Header Badge */}
            <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color, #334155)', paddingBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Active Screen
              </div>
              <h3 style={{ margin: '0.2rem 0', color: 'var(--text-primary)', fontSize: '1.15rem' }}>
                {currentScreen?.name}
              </h3>
              {currentScreen?.purpose && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {currentScreen.purpose}
                </div>
              )}
            </div>

            {/* Controlled Component Render Loop */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(currentScreen?.components || []).map((cmp, idx) => {
                const Component = COMPONENT_REGISTRY[cmp.type];

                if (!Component) {
                  // Safe graceful fallback for unrecognized component type
                  return (
                    <div
                      key={cmp.id || idx}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px dashed var(--border-color)',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      [Controlled Component: {cmp.type || 'Generic'}]
                    </div>
                  );
                }

                return (
                  <Component
                    key={cmp.id || idx}
                    props={cmp.props}
                    action={cmp.action}
                    onAction={handleAction}
                    formValues={formValues}
                    onInputChange={handleInputChange}
                  />
                );
              })}
            </div>
          </div>

          {/* Navigation Bar / Bottom Flow Bar */}
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-card, #0f172a)',
              borderTop: '1px solid var(--border-color, #334155)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              disabled={history.length <= 1}
              onClick={() => handleAction({ type: 'BACK' })}
              style={{
                fontSize: '0.75rem',
                padding: '0.3rem 0.6rem',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'transparent',
                color: history.length > 1 ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: history.length > 1 ? 'pointer' : 'not-allowed',
                opacity: history.length > 1 ? 1 : 0.5,
              }}
            >
              ← Back
            </button>

            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Step {screens.findIndex((s) => s.id === currentScreen?.id) + 1} of {screens.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
