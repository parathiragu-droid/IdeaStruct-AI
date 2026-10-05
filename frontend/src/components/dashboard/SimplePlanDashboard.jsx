import TechnicalDetails from '../common/TechnicalDetails';
import SectionIntro from '../common/SectionIntro';
import SoftwarePlanSection from './SoftwarePlanSection';
import HardwarePlanSection from '../hardware/HardwarePlanSection';
import HybridIntegrationSection from './HybridIntegrationSection';
import EstimatesSection from './EstimatesSection';
import RecommendationsSection from './RecommendationsSection';

/**
 * SimplePlanDashboard Component
 *
 * Beginner-first, human-friendly summary view of the project blueprint.
 * Dynamically supports SOFTWARE, HARDWARE, and HYBRID engineering plans.
 */
export default function SimplePlanDashboard({
  project,
  blueprint,
  validationLoading = false,
  onRunValidation,
  onOpenSection,
  onOpenEdit,
  onOpenRegen,
  onUpdatePlan,
}) {
  if (!blueprint) return null;

  const projectType = (blueprint.projectType || 'SOFTWARE').toUpperCase();
  const classification = blueprint.classification || {
    type: projectType,
    reason: 'Dynamic classification',
    confidence: 'HIGH',
  };

  const overview = blueprint.overview || {};
  const features = blueprint.features || [];
  const roles = blueprint.roles || [];
  const estimates = blueprint.estimates || {};
  const software = blueprint.software || {};
  const hardware = blueprint.hardware || {};
  const integrations = blueprint.integrations || software.integrations || [];
  const risks = blueprint.risks || [];
  const recommendations = blueprint.recommendations || [];

  const validationChecked = project?.validationCheckedAt != null;
  const issues = project?.validationIssues || [];
  const errorCount = issues.filter((i) => i.severity === 'ERROR').length;
  const warnCount = issues.filter((i) => i.severity === 'WARNING').length;

  const isSoftware = projectType === 'SOFTWARE' || projectType === 'HYBRID' || software.applicable;
  const isHardware = projectType === 'HARDWARE' || projectType === 'HYBRID' || hardware.applicable;
  const isHybrid = projectType === 'HYBRID' || (isSoftware && isHardware);

  // Type badge styling
  const typeBadgeStyles = {
    SOFTWARE: { color: 'var(--accent-cyan)', bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.4)', icon: '💻' },
    HARDWARE: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.4)', icon: '⚡' },
    HYBRID: { color: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.4)', icon: '🔄' },
  };
  const currentTypeStyle = typeBadgeStyles[projectType] || typeBadgeStyles.SOFTWARE;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. TOP CARDS: Project Type, Duration, Team, Features, Plan Check */}
      <section aria-label="Project Plan Summary Metrics">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Card 1: Project Type */}
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center', borderTop: `3px solid ${currentTypeStyle.color}` }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: currentTypeStyle.color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
              <span>{currentTypeStyle.icon}</span>
              <span>{projectType}</span>
            </div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Project Type
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Confidence: {classification.confidence || 'HIGH'}
            </div>
          </div>

          {/* Card 2: Estimated Time */}
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center', borderTop: '3px solid var(--accent-cyan)' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              {estimates.estimatedDuration || '4–8 weeks'}
            </div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Estimated Time
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Phase roadmap
            </div>
          </div>

          {/* Card 3: Recommended Team */}
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center', borderTop: '3px solid var(--accent-blue)' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
              {estimates.recommendedTeamSize || (roles.length > 0 ? roles.length : 2)}
            </div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Recommended Team
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Core specialists
            </div>
          </div>

          {/* Card 4: Main Features */}
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center', borderTop: '3px solid var(--accent-purple)' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
              {features.length}
            </div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Main Features
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Core capabilities
            </div>
          </div>

          {/* Card 6: Plan Check */}
          <div
            className="card"
            style={{
              padding: '1.25rem',
              textAlign: 'center',
              borderTop: `3px solid ${
                issues.length > 0
                  ? errorCount > 0
                    ? 'var(--accent-red)'
                    : 'var(--accent-orange)'
                  : 'var(--accent-green)'
              }`,
            }}
          >
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color:
                  issues.length > 0
                    ? errorCount > 0
                      ? 'var(--accent-red)'
                      : 'var(--accent-orange)'
                    : 'var(--accent-green)',
              }}
            >
              {!validationChecked ? (
                'Not checked'
              ) : issues.length === 0 ? (
                'All Clear ✅'
              ) : (
                `${issues.length} to review`
              )}
            </div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Plan Check
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Automated audit
            </div>
          </div>
        </div>
      </section>

      {/* Outdated Plan Guidance Banner */}
      {project?.blueprintOutdated && (
        <section aria-label="Plan Outdated Notice">
          <div
            style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: 'var(--status-warn-bg)',
              border: '1px solid var(--status-warn-border)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>⚠️</span>
              <strong style={{ fontSize: '1rem', color: 'var(--status-warn)' }}>
                Your project idea changed after this Project Plan was created.
              </strong>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              The saved plan is still available, but some parts may no longer match your latest idea.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={onUpdatePlan || onOpenRegen}
                className="btn btn-primary"
                style={{ fontSize: '0.875rem', padding: '0.4rem 1rem' }}
              >
                Update Project Plan
              </button>
              <button
                type="button"
                onClick={() => {}}
                className="btn btn-ghost"
                style={{ fontSize: '0.875rem', padding: '0.4rem 1rem', color: 'var(--text-secondary)' }}
              >
                Review Current Plan
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. PROJECT SUMMARY */}
      <section className="card" aria-label="Project Summary">
        <SectionIntro
          title="Project Summary"
          explanation="What this project is, who it is for, and what challenges it addresses."
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          {overview.summary && (
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-cyan)', border: '1px solid var(--border-default)', borderLeftWidth: '3px', borderLeftColor: 'var(--accent-cyan)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.125rem' }}>💡</span>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                  What are we building?
                </h4>
              </div>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                {overview.summary}
              </p>
            </div>
          )}

          {overview.problemStatement && (
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-purple)', border: '1px solid var(--border-default)', borderLeftWidth: '3px', borderLeftColor: 'var(--accent-purple)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.125rem' }}>🎯</span>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                  Problem to solve
                </h4>
              </div>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                {overview.problemStatement}
              </p>
            </div>
          )}

          {overview.targetUsers && (
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-blue)', border: '1px solid var(--border-default)', borderLeftWidth: '3px', borderLeftColor: 'var(--accent-blue)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.125rem' }}>👥</span>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                  Target Users
                </h4>
              </div>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                {Array.isArray(overview.targetUsers) ? overview.targetUsers.join(', ') : overview.targetUsers}
              </p>
            </div>
          )}

          {Array.isArray(overview.goals) && overview.goals.length > 0 && (
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-green)', border: '1px solid var(--border-default)', borderLeftWidth: '3px', borderLeftColor: 'var(--accent-green)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.125rem' }}>🚀</span>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                  Main Goals
                </h4>
              </div>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {overview.goals.map((g, idx) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{g}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Project Classification Explanation Card */}
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: currentTypeStyle.bg,
            border: `1px solid ${currentTypeStyle.border}`,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <strong style={{ fontSize: '0.9375rem', color: currentTypeStyle.color }}>
                {currentTypeStyle.icon} Classified as {projectType} Project
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ({classification.confidence || 'HIGH'} Confidence)
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
              {classification.reason || 'Classification determined from stated requirements and physical/digital components.'}
            </p>
          </div>
        </div>
      </section>

      {/* 3. PROJECT ESTIMATES */}
      <EstimatesSection estimates={estimates} />

      {/* 4. SOFTWARE SECTION (Collapsible — shown for SOFTWARE and HYBRID) */}
      {isSoftware && (
        <SoftwarePlanSection
          blueprint={blueprint}
          defaultExpanded={true}
          onOpenSection={onOpenSection}
        />
      )}

      {/* 5. HARDWARE SECTION (Collapsible — shown for HARDWARE and HYBRID) */}
      {isHardware && (
        <HardwarePlanSection
          hardware={hardware}
          estimates={estimates}
          blueprint={blueprint}
          defaultExpanded={true}
        />
      )}

      {/* 6. HYBRID INTEGRATION SECTION (Shown for HYBRID projects) */}
      {isHybrid && (
        <HybridIntegrationSection
          integrations={integrations}
          software={software}
          hardware={hardware}
        />
      )}

      {/* 7. RISKS & AI RECOMMENDATIONS */}
      <RecommendationsSection
        recommendations={recommendations}
        risks={risks}
        assumptions={blueprint.assumptions || overview.assumptions}
        openQuestions={blueprint.openQuestions || overview.openQuestions}
      />

      {/* 8. PLAN CHECK */}
      <section className="card" aria-label="Deterministic Plan Check">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🛡️</span>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Plan Check
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
              Automated verification of requirements, component links, APIs, and plan completeness.
            </p>
          </div>

          <button
            type="button"
            disabled={validationLoading}
            onClick={onRunValidation}
            className="btn btn-secondary"
            style={{ fontSize: '0.8125rem' }}
          >
            {validationLoading ? 'Running Plan Check...' : validationChecked ? 'Run Plan Check Again' : 'Run Plan Check'}
          </button>
        </div>

        {!validationChecked ? (
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Your plan has not been checked yet. Click <strong>Run Plan Check</strong> to audit your plan for missing requirements and incomplete sections.
          </div>
        ) : issues.length === 0 ? (
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--status-up-bg)',
              border: '1px solid var(--status-up-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--status-up)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              fontSize: '0.875rem',
            }}
          >
            <span>✅</span>
            <strong>No issues were found by the currently implemented checks.</strong>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--status-warn-bg)',
                border: '1px solid var(--status-warn-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--status-warn)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <strong>{issues.length} item(s) flagged for review</strong>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                {errorCount > 0 && <span><strong>{errorCount}</strong> Error{errorCount > 1 ? 's' : ''}</span>}
                {warnCount > 0 && <span><strong>{warnCount}</strong> Warning{warnCount > 1 ? 's' : ''}</span>}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {issues.slice(0, 3).map((issue, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.625rem 0.75rem',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-primary)',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {issue.message}
                  </div>
                  {issue.suggestedAction && (
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      💡 Suggestion: {issue.suggestedAction}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => onOpenSection('validation')}
                className="btn btn-secondary"
                style={{ fontSize: '0.8125rem' }}
              >
                View All Plan Check Results ({issues.length}) →
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 9. TECHNICAL DETAILS (Collapsible) */}
      <TechnicalDetails summary="Technical Plan Details">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.8125rem' }}>
          <div><strong>Schema Version:</strong> {blueprint.schemaVersion || '1.0'}</div>
          <div><strong>Project Type:</strong> {projectType}</div>
          <div><strong>Features Count:</strong> {features.length}</div>
          <div><strong>Roles Count:</strong> {roles.length}</div>
          {isSoftware && <div><strong>Screens Count:</strong> {(software.screens || blueprint.uiScreens || []).length}</div>}
          {isHardware && <div><strong>Components Count:</strong> {(hardware.components || []).length}</div>}
          {isHardware && <div><strong>Connections Count:</strong> {(hardware.connections || []).length}</div>}
        </div>
      </TechnicalDetails>

      {/* 10. Important Actions Bar */}
      <section
        className="card"
        aria-label="Important Plan Actions"
        style={{
          borderTop: '3px solid var(--accent-aqua)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Need to modify or update this plan?
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
              You can regenerate specific sections or inspect and edit the technical data directly.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onOpenRegen}
              className="btn btn-secondary"
              id="btn-open-regen-modal"
              style={{ fontSize: '0.8125rem' }}
            >
              🔄 Regenerate Part of Plan
            </button>

            <button
              type="button"
              onClick={onOpenEdit}
              className="btn btn-secondary"
              id="btn-open-edit-modal"
              style={{ fontSize: '0.8125rem' }}
            >
              ⚙️ Edit Technical Plan Data
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
