import { useState, useEffect } from 'react';

export default function EditBlueprintModal({
  isOpen,
  onClose,
  blueprint,
  onSave,
  saving
}) {
  const [jsonContent, setJsonContent] = useState('');
  const [parseError, setParseError] = useState(null);
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  const [prevBlueprint, setPrevBlueprint] = useState(null);

  // Synchronize JSON content on modal open or blueprint prop change without effect cascading renders
  if (isOpen && (!prevIsOpen || prevBlueprint !== blueprint)) {
    setPrevIsOpen(isOpen);
    setPrevBlueprint(blueprint);
    setJsonContent(blueprint ? JSON.stringify(blueprint, null, 2) : '');
    setParseError(null);
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  // Keyboard accessibility: Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setJsonContent(e.target.value);
    setParseError(null);
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      setJsonContent(JSON.stringify(parsed, null, 2));
      setParseError(null);
    } catch (e) {
      setParseError('Invalid JSON: ' + e.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(jsonContent);
      if (parsed.schemaVersion !== '1.0' && parsed.schemaVersion !== '2.0') {
        throw new Error(`Unsupported schemaVersion: "${parsed.schemaVersion}". Expected "1.0" or "2.0"`);
      }
      // Common canonical root sections
      const commonRequired = [
        'schemaVersion', 'overview', 'features', 'roles', 'requirements',
        'roadmap', 'assumptions', 'openQuestions'
      ];
      for (const k of commonRequired) {
        if (parsed[k] === undefined || parsed[k] === null) {
          throw new Error(`Missing required root section: "${k}"`);
        }
      }
      if (parsed.schemaVersion === '1.0') {
        const v1Required = ['database', 'apis', 'uiScreens'];
        for (const k of v1Required) {
          if (parsed[k] === undefined || parsed[k] === null) {
            throw new Error(`Missing required root section for v1.0: "${k}"`);
          }
        }
      }
      if (typeof parsed.overview !== 'object' || Array.isArray(parsed.overview)) {
        throw new Error('Section "overview" must be a JSON object');
      }
      if (parsed.database && (typeof parsed.database !== 'object' || Array.isArray(parsed.database))) {
        throw new Error('Section "database" must be a JSON object');
      }
      const arraySections = ['features', 'roles', 'requirements', 'roadmap', 'assumptions', 'openQuestions'];
      if (parsed.apis) arraySections.push('apis');
      if (parsed.uiScreens) arraySections.push('uiScreens');
      for (const sec of arraySections) {
        if (parsed[sec] && !Array.isArray(parsed[sec])) {
          throw new Error(`Section "${sec}" must be a JSON array`);
        }
      }
      onSave(parsed);
    } catch (e) {
      setParseError(e.message);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title-edit-blueprint"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 8, 14, 0.75)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 150,
        padding: '1rem'
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '840px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg), 0 0 30px rgba(0, 0, 0, 0.8)',
          borderColor: 'var(--border-bright)',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.75rem', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <h3 id="modal-title-edit-blueprint" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Edit Technical Plan Data
              </h3>
              <span className="badge badge-purple" style={{ fontSize: '0.6875rem' }}>
                Advanced
              </span>
              <span className="badge badge-aqua" style={{ fontSize: '0.6875rem' }}>
                For advanced users
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              This editor exposes the saved structured Project Plan data. Invalid changes will be rejected. Make direct structured edits to your blueprint (Edit Blueprint JSON).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="btn btn-ghost"
            style={{ fontSize: '1.25rem', lineHeight: 1, padding: '0.25rem 0.5rem' }}
          >
            ✕
          </button>
        </div>

        {parseError && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--status-down-bg)', color: 'var(--status-down)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.8125rem' }}>
            <strong>Validation Error:</strong> {parseError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ flex: 1, overflow: 'hidden', marginBottom: '1rem' }}>
            <textarea
              value={jsonContent}
              onChange={handleChange}
              rows={22}
              aria-label="Raw Blueprint JSON content"
              style={{
                width: '100%',
                height: '100%',
                minHeight: '380px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                padding: '0.875rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#050C14',
                color: '#EDF4FB',
                lineHeight: 1.5,
                border: '1px solid var(--border-default)',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleFormat}
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem' }}
            >
              Format JSON
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="btn btn-secondary"
              >
                Discard / Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? 'Saving Changes...' : 'Save Blueprint to MongoDB'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
