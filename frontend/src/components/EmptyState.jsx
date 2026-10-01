import { Link } from 'react-router-dom';

export default function EmptyState({
  title = 'No projects yet',
  description = 'Start by describing your software, hardware, or hybrid idea to generate your first development blueprint.',
  actionLabel = 'Create First Project',
  actionTo = '/projects/new',
}) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '4rem 1.5rem',
      backgroundColor: 'var(--bg-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px dashed var(--border-strong)',
      maxWidth: '560px',
      margin: '2rem auto',
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: 'var(--accent-aqua-light)',
        color: 'var(--accent-aqua)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.75rem',
        margin: '0 auto 1.25rem',
      }}>
        💡
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
        {description}
      </p>
      {actionTo && (
        <Link to={actionTo} className="btn btn-primary" id="btn-empty-create">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
