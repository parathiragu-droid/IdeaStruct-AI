/**
 * EstimatesSection Component.
 * Visualizes approximate project duration, recommended team roles,
 * and key resources with clear planning disclaimers.
 */
export default function EstimatesSection({ estimates = {} }) {
  if (!estimates || Object.keys(estimates).length === 0) return null;

  const {
    difficulty = 'MEDIUM',
    estimatedDuration = '4–8 weeks',
    recommendedTeamSize = 2,
    teamRoles = [],
    resources = [],
  } = estimates;

  const difficultyColors = {
    EASY: { color: 'var(--accent-green)', bg: 'rgba(16, 185, 129, 0.12)' },
    MEDIUM: { color: 'var(--accent-cyan)', bg: 'rgba(6, 182, 212, 0.12)' },
    HARD: { color: 'var(--accent-orange)', bg: 'rgba(245, 158, 11, 0.12)' },
    VERY_HARD: { color: 'var(--accent-red)', bg: 'rgba(239, 68, 68, 0.12)' },
  };

  const diffStyle = difficultyColors[difficulty] || difficultyColors.MEDIUM;

  return (
    <section className="card" aria-label="Project Estimates & Resource Plan">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            📊 Project Estimates & Resource Allocation
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
            Indicative engineering duration, team size, roles, and required resources.
          </p>
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '0.25rem 0.75rem',
            borderRadius: '999px',
            backgroundColor: diffStyle.bg,
            color: diffStyle.color,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {difficulty} Difficulty
        </span>
      </div>

      {/* Top 3 Key Estimate Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>ESTIMATED DURATION</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
            {estimatedDuration}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Total project timeline
          </div>
        </div>

        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>RECOMMENDED TEAM</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-blue)', marginTop: '0.25rem' }}>
            {recommendedTeamSize} {recommendedTeamSize === 1 ? 'person' : 'engineers'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Core contributors
          </div>
        </div>

        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>REQUIRED RESOURCES</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-purple)', marginTop: '0.25rem' }}>
            {resources.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Services & hardware items
          </div>
        </div>
      </div>

      {/* Team Roles Breakdown */}
      {teamRoles.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Recommended Team Composition ({teamRoles.length} Roles)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
            {teamRoles.map((role, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.85rem 1rem',
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--accent-cyan)' }}>
                    {role.role}
                  </strong>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.45rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(56, 189, 248, 0.12)',
                      color: 'var(--accent-cyan)',
                    }}
                  >
                    Qty: {role.count || 1}
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  {role.responsibility}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Required Resources Table */}
      {resources.length > 0 && (
        <div>
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Key Infrastructure & Hardware Resources
          </h4>
          <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead style={{ backgroundColor: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-default)' }}>
                <tr>
                  <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>Resource Name</th>
                  <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>Category / Type</th>
                  <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>Purpose in Architecture</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((res, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {res.name}
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem' }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.4rem',
                          borderRadius: '3px',
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {res.type || 'SERVICE'}
                      </span>
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>
                      {res.purpose}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
