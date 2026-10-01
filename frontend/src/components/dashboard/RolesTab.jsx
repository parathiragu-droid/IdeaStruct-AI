import SectionIntro from '../common/SectionIntro';
import TechnicalDetails from '../common/TechnicalDetails';

/**
 * RolesTab Component
 *
 * Displays human-friendly user roles, permissions, and automated role distinctions.
 * Internal IDs and raw booleans are collapsed by default.
 */
export default function RolesTab({ blueprint }) {
  const roles = Array.isArray(blueprint?.roles) ? blueprint.roles.filter(Boolean) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <SectionIntro
        title="Users & Roles"
        explanation="People and automated actors that interact with this application."
        technicalDetails={
          <div>
            <div><strong>Schema Section:</strong> <code>blueprint.roles</code></div>
            <div><strong>Actor Model:</strong> Distinguishes interactive human users (which require UI screens) from automated system workers.</div>
          </div>
        }
      />

      {roles.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
          No user roles are currently proposed.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {roles.map((role) => (
            <div
              key={role.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: role.interactive ? '3px solid var(--accent-cyan)' : '3px solid var(--accent-purple)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {role.name}
                  </h4>
                  <span
                    className={`badge ${role.interactive ? 'badge-cyan badge-up' : 'badge-purple'}`}
                    style={{ fontSize: '0.6875rem' }}
                  >
                    {role.interactive ? 'Interactive User' : 'System / automated role'}
                  </span>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {role.description}
                </p>

                {role.permissions && role.permissions.length > 0 && (
                  <div>
                    <h5 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Permissions ({role.permissions.length})
                    </h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {role.permissions.map((perm, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.5rem',
                            backgroundColor: 'var(--bg-muted)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Technical Details Collapsed */}
              <TechnicalDetails summary="Technical details" style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div><strong>Role ID:</strong> <code>{role.id}</code></div>
                  <div><strong>interactive:</strong> {String(role.interactive)}</div>
                </div>
              </TechnicalDetails>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
