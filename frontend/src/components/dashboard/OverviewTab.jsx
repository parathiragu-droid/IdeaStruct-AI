import SectionIntro from '../common/SectionIntro';
import TechnicalDetails from '../common/TechnicalDetails';

/**
 * OverviewTab Component
 *
 * Beginner-friendly project overview presenting what is being built,
 * problems solved, target users, goals, and system scope.
 */
export default function OverviewTab({ blueprint }) {
  const overview = blueprint?.overview || {};
  const assumptions = blueprint?.assumptions || [];
  const openQuestions = blueprint?.openQuestions || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <SectionIntro
        title="Project Summary"
        explanation="Understand what the software is supposed to solve, who it is for, and key boundaries."
        technicalDetails={
          <div>
            <div><strong>Schema Version:</strong> {blueprint?.schemaVersion || '1.0'}</div>
            <div><strong>Canonical Model:</strong> Canonical Blueprint Overview aggregate defining system boundaries.</div>
          </div>
        }
      />

      {/* Blueprint Project Name */}
      {overview.projectName && (
        <div className="card" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
            Blueprint Project Name
          </span>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem', marginBottom: 0 }}>
            {overview.projectName}
          </h2>
        </div>
      )}

      {/* Core Concept: What are we building & Problem to solve */}
      <div className="card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          What are we building?
        </h3>
        <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {overview.summary || 'No summary provided.'}
        </p>

        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Problem to solve
        </h3>
        <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>
          {overview.problemStatement || 'No problem statement defined.'}
        </p>
      </div>

      {/* Target Users & Main Goals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Target Users
          </h3>
          {overview.targetUsers && overview.targetUsers.length > 0 ? (
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {overview.targetUsers.map((user, idx) => (
                <li key={idx} style={{ marginBottom: '0.375rem' }}>{user}</li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>No target user groups specified.</p>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Main Goals
          </h3>
          {overview.goals && overview.goals.length > 0 ? (
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {overview.goals.map((goal, idx) => (
                <li key={idx} style={{ marginBottom: '0.375rem' }}>{goal}</li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>No primary goals listed.</p>
          )}
        </div>
      </div>

      {/* Scope Boundaries */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--accent-green)', backgroundColor: 'rgba(55, 217, 150, 0.06)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--accent-green)' }}>
            ✓ In Scope
          </h3>
          {overview.scope && overview.scope.length > 0 ? (
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {overview.scope.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '0.375rem' }}>{item}</li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>No explicit in-scope items defined.</p>
          )}
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--accent-red)', backgroundColor: 'rgba(255, 94, 122, 0.06)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--accent-red)' }}>
            ✗ Out of Scope (Deferred)
          </h3>
          {overview.outOfScope && overview.outOfScope.length > 0 ? (
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {overview.outOfScope.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '0.375rem' }}>{item}</li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>No explicit out-of-scope boundaries recorded.</p>
          )}
        </div>
      </div>

      {/* Secondary Details: Assumptions & Open Questions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Architecture Assumptions ({assumptions.length})
          </h3>
          {assumptions.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>No explicit assumptions recorded.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {assumptions.map((asm) => (
                <div key={asm.id} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {asm.description}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    <strong>Rationale:</strong> {asm.reason}
                  </div>
                  <TechnicalDetails summary="Assumption details" style={{ marginTop: '0.375rem' }}>
                    <code>ID: {asm.id}</code>
                  </TechnicalDetails>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Open Questions ({openQuestions.length})
          </h3>
          {openQuestions.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>No open questions pending clarification.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {openQuestions.map((q) => (
                <div key={q.id} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {q.question}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    <strong>Impact:</strong> {q.whyItMatters}
                  </div>
                  <TechnicalDetails summary="Question details" style={{ marginTop: '0.375rem' }}>
                    <code>ID: {q.id}</code>
                  </TechnicalDetails>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
