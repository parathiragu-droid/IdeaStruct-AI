import React from 'react';

/**
 * Whitelist Controlled Components for IdeaStruct AI Software Prototype Engine
 *
 * SAFETY MANDATE:
 * - NO eval()
 * - NO new Function()
 * - NO dangerouslySetInnerHTML
 * - AI only specifies component definitions and props; React renders them safely.
 */

export function HeadingComponent({ props }) {
  const level = props?.level || 2;
  const text = props?.text || props?.title || '';
  if (level === 1) return <h1 style={{ margin: '0.5rem 0', color: 'var(--text-primary)', fontSize: '1.5rem' }}>{text}</h1>;
  if (level === 2) return <h2 style={{ margin: '0.5rem 0', color: 'var(--text-primary)', fontSize: '1.25rem' }}>{text}</h2>;
  if (level === 3) return <h3 style={{ margin: '0.375rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{text}</h3>;
  return <h4 style={{ margin: '0.25rem 0', color: 'var(--text-primary)', fontSize: '1rem' }}>{text}</h4>;
}

export function TextComponent({ props }) {
  return (
    <p style={{ margin: '0.375rem 0', color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.9rem' }}>
      {props?.content || props?.text || ''}
    </p>
  );
}

export function ButtonComponent({ props, onAction, action }) {
  const variant = props?.variant || 'primary';
  const label = props?.label || props?.text || 'Action';
  const isPrimary = variant === 'primary';

  const style = {
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-md, 6px)',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    border: isPrimary ? 'none' : '1px solid var(--border-color, #334155)',
    backgroundColor: isPrimary ? 'var(--accent-blue, #2563eb)' : 'transparent',
    color: isPrimary ? '#ffffff' : 'var(--text-primary, #f8fafc)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.15s ease',
  };

  return (
    <button
      type="button"
      style={style}
      onClick={() => onAction && onAction(action || props?.action)}
      className="prototype-btn"
    >
      {label}
    </button>
  );
}

export function InputComponent({ props, formValues, onInputChange }) {
  const name = props?.name || props?.id || 'field';
  const label = props?.label || '';
  const placeholder = props?.placeholder || '';
  const value = formValues?.[name] ?? props?.defaultValue ?? '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', margin: '0.5rem 0' }}>
      {label && <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</label>}
      <input
        type={props?.type || 'text'}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onInputChange && onInputChange(name, e.target.value)}
        style={{
          padding: '0.5rem 0.75rem',
          borderRadius: 'var(--radius-md, 6px)',
          border: '1px solid var(--border-color, #334155)',
          backgroundColor: 'var(--bg-input, #0f172a)',
          color: 'var(--text-primary, #f8fafc)',
          fontSize: '0.875rem',
        }}
      />
    </div>
  );
}

export function TextareaComponent({ props, formValues, onInputChange }) {
  const name = props?.name || props?.id || 'textarea';
  const label = props?.label || '';
  const placeholder = props?.placeholder || '';
  const value = formValues?.[name] ?? props?.defaultValue ?? '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', margin: '0.5rem 0' }}>
      {label && <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</label>}
      <textarea
        rows={props?.rows || 3}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onInputChange && onInputChange(name, e.target.value)}
        style={{
          padding: '0.5rem 0.75rem',
          borderRadius: 'var(--radius-md, 6px)',
          border: '1px solid var(--border-color, #334155)',
          backgroundColor: 'var(--bg-input, #0f172a)',
          color: 'var(--text-primary, #f8fafc)',
          fontSize: '0.875rem',
          resize: 'vertical',
        }}
      />
    </div>
  );
}

export function SelectComponent({ props, formValues, onInputChange }) {
  const name = props?.name || props?.id || 'select';
  const label = props?.label || '';
  const options = props?.options || [];
  const value = formValues?.[name] ?? options[0] ?? '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', margin: '0.5rem 0' }}>
      {label && <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</label>}
      <select
        value={value}
        onChange={(e) => onInputChange && onInputChange(name, e.target.value)}
        style={{
          padding: '0.5rem 0.75rem',
          borderRadius: 'var(--radius-md, 6px)',
          border: '1px solid var(--border-color, #334155)',
          backgroundColor: 'var(--bg-input, #0f172a)',
          color: 'var(--text-primary, #f8fafc)',
          fontSize: '0.875rem',
        }}
      >
        {options.map((opt, idx) => (
          <option key={idx} value={typeof opt === 'string' ? opt : opt.value}>
            {typeof opt === 'string' ? opt : opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CardComponent({ props, children }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface, #1e293b)',
        border: '1px solid var(--border-color, #334155)',
        borderRadius: 'var(--radius-lg, 8px)',
        padding: '1rem',
        margin: '0.5rem 0',
      }}
    >
      {props?.title && <h4 style={{ margin: '0 0 0.25rem', color: 'var(--text-primary)', fontSize: '1rem' }}>{props.title}</h4>}
      {props?.subtitle && <div style={{ fontSize: '0.8rem', color: 'var(--accent-blue, #60a5fa)', marginBottom: '0.5rem' }}>{props.subtitle}</div>}
      {props?.description && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem' }}>{props.description}</p>}
      {children}
    </div>
  );
}

export function ListComponent({ props, onAction }) {
  const items = props?.items || [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '0.5rem 0' }}>
      {items.map((item, idx) => (
        <div
          key={item.id || idx}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--bg-surface, #1e293b)',
            border: '1px solid var(--border-color, #334155)',
            borderRadius: 'var(--radius-md, 6px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: item.action ? 'pointer' : 'default',
          }}
          onClick={() => item.action && onAction && onAction(item.action)}
        >
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{item.title || item.name}</div>
            {item.subtitle && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.subtitle}</div>}
          </div>
          {item.badge && (
            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: 'var(--bg-card, #0f172a)', color: 'var(--accent-green, #10b981)', border: '1px solid var(--border-color)' }}>
              {item.badge}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export function TableComponent({ props }) {
  const headers = props?.headers || [];
  const rows = props?.rows || [];

  return (
    <div style={{ overflowX: 'auto', margin: '0.75rem 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border-color, #334155)', textAlign: 'left' }}>
            {headers.map((h, idx) => (
              <th key={idx} style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx} style={{ borderBottom: '1px solid var(--border-color, #1e293b)' }}>
              {Array.isArray(row) ? (
                row.map((cell, cIdx) => (
                  <td key={cIdx} style={{ padding: '0.5rem 0.75rem', color: 'var(--text-primary)' }}>{cell}</td>
                ))
              ) : (
                headers.map((h, cIdx) => (
                  <td key={cIdx} style={{ padding: '0.5rem 0.75rem', color: 'var(--text-primary)' }}>{row[h] ?? ''}</td>
                ))
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ImagePlaceholderComponent({ props }) {
  const width = props?.width || '100%';
  const height = props?.height || '140px';
  const caption = props?.caption || 'Image preview placeholder';

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: 'var(--bg-surface, #1e293b)',
        border: '1px dashed var(--border-color, #475569)',
        borderRadius: 'var(--radius-md, 6px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        margin: '0.5rem 0',
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '0.25rem', opacity: 0.6 }}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <span>{caption}</span>
    </div>
  );
}

export function NavbarComponent({ props }) {
  const brand = props?.brand || 'Demo Application';
  const links = props?.links || ['Home', 'Explore', 'Dashboard'];

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--bg-card, #0f172a)',
        borderBottom: '1px solid var(--border-color, #334155)',
        borderRadius: '6px 6px 0 0',
        marginBottom: '0.75rem',
      }}
    >
      <div style={{ fontWeight: 700, color: 'var(--accent-blue, #60a5fa)', fontSize: '0.95rem' }}>{brand}</div>
      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        {links.map((link, idx) => (
          <span key={idx} style={{ cursor: 'pointer' }}>{link}</span>
        ))}
      </div>
    </nav>
  );
}

export function BadgeComponent({ props }) {
  const variant = props?.variant || 'primary';
  const text = props?.text || props?.label || '';

  const colorMap = {
    success: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: '#10b981' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: '#f59e0b' },
    danger: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: '#ef4444' },
    primary: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: '#3b82f6' },
  };

  const scheme = colorMap[variant] || colorMap.primary;

  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '0.75rem',
        fontWeight: 600,
        padding: '0.2rem 0.5rem',
        borderRadius: '4px',
        backgroundColor: scheme.bg,
        color: scheme.text,
        border: `1px solid ${scheme.border}`,
        margin: '0.25rem 0',
      }}
    >
      {text}
    </span>
  );
}

export function StatCardComponent({ props }) {
  return (
    <div
      style={{
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--bg-surface, #1e293b)',
        border: '1px solid var(--border-color, #334155)',
        borderRadius: 'var(--radius-md, 6px)',
        margin: '0.5rem 0',
      }}
    >
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {props?.label || 'Metric'}
      </div>
      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.25rem 0' }}>
        {props?.value || '—'}
      </div>
      {props?.hint && <div style={{ fontSize: '0.75rem', color: 'var(--accent-green, #10b981)' }}>{props.hint}</div>}
    </div>
  );
}

export function SidebarComponent({ props, onAction }) {
  const brand = props?.brand || props?.title || 'Navigation';
  const items = props?.items || ['Overview', 'Analytics', 'Settings'];

  return (
    <aside
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        padding: '0.75rem',
        backgroundColor: 'var(--bg-card, #0f172a)',
        border: '1px solid var(--border-color, #334155)',
        borderRadius: 'var(--radius-md, 6px)',
        margin: '0.5rem 0',
      }}
    >
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.25rem 0.5rem', marginBottom: '0.25rem' }}>
        {brand}
      </div>
      {items.map((item, idx) => {
        const isObj = typeof item === 'object' && item !== null;
        const label = isObj ? (item.label || item.name || item.title || `Item ${idx + 1}`) : String(item);
        const action = isObj ? (item.action || (item.targetScreenId ? { type: 'NAVIGATE', targetScreenId: item.targetScreenId } : null)) : null;

        return (
          <button
            key={idx}
            type="button"
            onClick={() => {
              if (action && onAction) onAction(action);
              else if (onAction) onAction({ type: 'SELECT_ITEM', item: label });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-sm, 4px)',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-primary, #f8fafc)',
              fontSize: '0.85rem',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            className="prototype-sidebar-item"
          >
            <span>{label}</span>
            {isObj && item.badge && (
              <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '3px', backgroundColor: 'var(--bg-surface, #1e293b)', color: 'var(--accent-cyan, #06b6d4)' }}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </aside>
  );
}

export function TabsComponent({ props, onAction }) {
  const tabs = props?.tabs || props?.items || ['Tab 1', 'Tab 2', 'Tab 3'];
  const [activeTab, setActiveTab] = React.useState(0);

  const handleTabClick = (idx, tab) => {
    setActiveTab(idx);
    const tabVal = typeof tab === 'object' && tab !== null ? (tab.id || tab.label || idx) : tab;
    if (onAction) {
      onAction({ type: 'FILTER_DEMO_DATA', filterKey: 'tab', value: String(tabVal) });
    }
  };

  return (
    <div style={{ margin: '0.5rem 0' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color, #334155)', gap: '0.25rem' }}>
        {tabs.map((tab, idx) => {
          const label = typeof tab === 'object' && tab !== null ? (tab.label || tab.name || `Tab ${idx + 1}`) : String(tab);
          const isActive = idx === activeTab;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleTabClick(idx, tab)}
              style={{
                padding: '0.5rem 0.85rem',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent-blue, #3b82f6)' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: isActive ? 'var(--accent-blue, #60a5fa)' : 'var(--text-muted, #94a3b8)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function FormComponent({ props, formValues, onInputChange, onAction, action }) {
  const title = props?.title || '';
  const description = props?.description || '';
  const fields = props?.fields || [
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter name' },
    { name: 'notes', label: 'Comments / Notes', type: 'textarea', placeholder: 'Enter notes' },
  ];
  const submitLabel = props?.submitLabel || 'Submit Form';
  const submitAction = action || props?.action || { type: 'SUBMIT_DEMO' };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (onAction) onAction(submitAction);
      }}
      style={{
        padding: '1rem',
        backgroundColor: 'var(--bg-surface, #1e293b)',
        border: '1px solid var(--border-color, #334155)',
        borderRadius: 'var(--radius-md, 6px)',
        margin: '0.5rem 0',
      }}
    >
      {title && <h4 style={{ margin: '0 0 0.25rem', color: 'var(--text-primary)', fontSize: '1rem' }}>{title}</h4>}
      {description && <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem' }}>{description}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {fields.map((f, idx) => {
          const fName = f.name || `field_${idx}`;
          const val = formValues?.[fName] ?? f.defaultValue ?? '';

          if (f.type === 'textarea') {
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{f.label || fName}</label>
                <textarea
                  rows={f.rows || 3}
                  value={val}
                  placeholder={f.placeholder || ''}
                  onChange={(e) => onInputChange && onInputChange(fName, e.target.value)}
                  style={{
                    padding: '0.45rem 0.65rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color, #334155)',
                    backgroundColor: 'var(--bg-input, #0f172a)',
                    color: 'var(--text-primary, #f8fafc)',
                    fontSize: '0.85rem',
                  }}
                />
              </div>
            );
          }

          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{f.label || fName}</label>
              <input
                type={f.type || 'text'}
                value={val}
                placeholder={f.placeholder || ''}
                onChange={(e) => onInputChange && onInputChange(fName, e.target.value)}
                style={{
                  padding: '0.45rem 0.65rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color, #334155)',
                  backgroundColor: 'var(--bg-input, #0f172a)',
                  color: 'var(--text-primary, #f8fafc)',
                  fontSize: '0.85rem',
                }}
              />
            </div>
          );
        })}

        <div style={{ marginTop: '0.5rem' }}>
          <button
            type="submit"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md, 6px)',
              fontWeight: 600,
              fontSize: '0.85rem',
              border: 'none',
              backgroundColor: 'var(--accent-blue, #2563eb)',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

export function ModalComponent({ props, onAction, action }) {
  const title = props?.title || 'Modal Dialog';
  const message = props?.message || props?.content || props?.description || 'Controlled modal preview.';
  const closeLabel = props?.closeLabel || 'Dismiss';
  const confirmLabel = props?.confirmLabel || 'OK';

  return (
    <div
      style={{
        padding: '1rem',
        backgroundColor: 'var(--bg-card, #0f172a)',
        border: '1px solid var(--border-color, #334155)',
        borderRadius: 'var(--radius-lg, 8px)',
        margin: '0.5rem 0',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{title}</h4>
        <button
          type="button"
          onClick={() => onAction && onAction({ type: 'CLOSE_MODAL' })}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
        >
          ✕
        </button>
      </div>
      <p style={{ margin: '0.25rem 0 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
        {message}
      </p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={() => onAction && onAction({ type: 'CLOSE_MODAL' })}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: '4px',
            border: '1px solid var(--border-color, #334155)',
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          {closeLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            if (action && onAction) onAction(action);
            else if (onAction) onAction({ type: 'CLOSE_MODAL' });
          }}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: 'var(--accent-blue, #2563eb)',
            color: '#fff',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

/**
 * Registry mapping Whitelist Component Types to their React Renderers
 */
export const COMPONENT_REGISTRY = {
  Heading: HeadingComponent,
  Text: TextComponent,
  Button: ButtonComponent,
  Input: InputComponent,
  Textarea: TextareaComponent,
  Select: SelectComponent,
  Card: CardComponent,
  List: ListComponent,
  Table: TableComponent,
  ImagePlaceholder: ImagePlaceholderComponent,
  Navbar: NavbarComponent,
  Sidebar: SidebarComponent,
  Tabs: TabsComponent,
  Badge: BadgeComponent,
  Form: FormComponent,
  Modal: ModalComponent,
  StatCard: StatCardComponent,
};
