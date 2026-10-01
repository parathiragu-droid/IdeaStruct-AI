import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function RegenerateModal({
  isOpen,
  onClose,
  project,
  onApplyProposal
}) {
  const [section, setSection] = useState('all');
  const [instructions, setInstructions] = useState('');
  const mode = 'DEMO'; // DEMO or LIVE_AI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [applying, setApplying] = useState(false);

  // Keyboard accessibility: Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setProposal(null);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePropose = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setProposal(null);

    try {
      const response = await api.regenerateBlueprint(
        project.id,
        section,
        instructions,
        project.revision,
        mode
      );
      setProposal(response);
    } catch (err) {
      setError(err.message || 'Regeneration proposal failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!proposal || applying) return;
    setApplying(true);
    try {
      await onApplyProposal(proposal.candidate, proposal.baseRevision);
      onClose();
    } catch {
      // Handled by parent
    } finally {
      setApplying(false);
    }
  };

  const handleDiscard = () => {
    setProposal(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title-regen"
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
      <div className="card" style={{ maxWidth: '880px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg), 0 0 30px rgba(0, 0, 0, 0.8)', borderColor: 'var(--border-bright)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.75rem', gap: '0.75rem' }}>
          <div>
            <h3 id="modal-title-regen" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Regenerate Part of Plan
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
              This is a proposed update. Your saved plan will not change until you choose Apply.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDiscard}
            aria-label="Close modal"
            className="btn btn-ghost"
            style={{ fontSize: '1.25rem', lineHeight: 1, padding: '0.25rem 0.5rem' }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--status-down-bg)', color: 'var(--status-down)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.8125rem' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Step 1: Input Form (when no proposal active yet) */}
        {!proposal && (
          <form onSubmit={handlePropose} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                Scope of Regeneration
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface)',
                  fontSize: '0.9375rem',
                }}
              >
                <option value="all">Full Project Plan (All Sections)</option>
                <option value="features">Main Features</option>
                <option value="roles">Users & Roles</option>
                <option value="requirements">Detailed Requirements</option>
                <option value="database">Data Structure</option>
                <option value="apis">Backend APIs</option>
                <option value="uiScreens">App Screens</option>
                <option value="roadmap">Build Roadmap</option>
              </select>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {section === 'all'
                  ? 'Generates candidate proposal for the entire plan.'
                  : `Only the selected section will be updated; all other sections remain untouched.`}
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                Additional Revision Instructions (Optional)
              </label>
              <textarea
                rows={4}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Add meal prep dietary filtering, include a loyalty points collection in database, or detail a student meal card webhook..."
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              <button
                type="button"
                onClick={handleDiscard}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Generating Candidate Proposal...' : 'Generate Candidate for Review'}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Review Proposal Before Applying */}
        {proposal && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--accent-aqua-light)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-aqua-active)',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              <strong>Proposal Ready for Review:</strong> {proposal.diffSummary}
              <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                Base Revision: {proposal.baseRevision} · Target Section: <code>{proposal.section}</code>
              </div>
            </div>

            <div style={{ flex: 1, overflow: 'auto', marginBottom: '1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <pre className="code-block" style={{ margin: 0, maxHeight: '360px' }}>
                {JSON.stringify(proposal.candidate[proposal.section] || proposal.candidate, null, 2)}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              <button
                type="button"
                disabled={applying}
                onClick={handleDiscard}
                className="btn btn-secondary"
              >
                Discard
              </button>

              <button
                type="button"
                disabled={applying}
                onClick={handleApply}
                className="btn btn-primary"
                id="btn-apply-proposal"
              >
                {applying ? 'Applying changes...' : '✓ Apply Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
