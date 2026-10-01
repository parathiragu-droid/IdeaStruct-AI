import { useMemo } from 'react';

/**
 * DashboardTabs Component
 *
 * Grouped navigation tabs for Advanced Developer Specification:
 * - GENERAL (Overview, Requirements, Features, Roles, Estimates, Roadmap, Plan Check)
 * - SOFTWARE (Architecture, Tech Stack, Data Structure, Backend APIs, App Screens, Prototype)
 * - HARDWARE (Components, Wiring & Connections, Firmware, 3D Model)
 *
 * Automatically filters out non-applicable groups according to projectType.
 */
export default function DashboardTabs({
  activeTab,
  onSelectTab,
  validationIssues = [],
  projectType = 'SOFTWARE',
  softwareApplicable = true,
  hardwareApplicable = false,
}) {
  const normType = (projectType || 'SOFTWARE').toUpperCase();
  const showSoftware = normType === 'SOFTWARE' || normType === 'HYBRID' || softwareApplicable;
  const showHardware = normType === 'HARDWARE' || normType === 'HYBRID' || hardwareApplicable;

  const groups = useMemo(() => {
    const list = [];

    // 1. GENERAL Group
    list.push({
      groupName: 'GENERAL',
      tabs: [
        { id: 'overview', label: 'Overview', icon: '📌' },
        { id: 'requirements', label: 'Requirements', icon: '📝' },
        { id: 'features', label: 'Features', icon: '✨' },
        { id: 'roles', label: 'Roles', icon: '👥' },
        { id: 'estimates', label: 'Estimates', icon: '📊' },
        { id: 'roadmap', label: 'Roadmap', icon: '🗺️' },
        { id: 'validation', label: 'Plan Check', icon: '🛡️' },
      ],
    });

    // 2. SOFTWARE Group
    if (showSoftware) {
      list.push({
        groupName: 'SOFTWARE',
        tabs: [
          { id: 'architecture', label: 'Architecture', icon: '🏗️' },
          { id: 'techstack', label: 'Tech Stack', icon: '⚙️' },
          { id: 'database', label: 'Data Structure', icon: '🗄️' },
          { id: 'apis', label: 'APIs', icon: '🔌' },
          { id: 'screens', label: 'Screens', icon: '💻' },
          { id: 'prototype', label: 'Prototype Demo', icon: '📱' },
        ],
      });
    }

    // 3. HARDWARE Group
    if (showHardware) {
      list.push({
        groupName: 'HARDWARE',
        tabs: [
          { id: 'components', label: 'Components', icon: '📦' },
          { id: 'connections', label: 'Wiring & Pins', icon: '⚡' },
          { id: 'firmware', label: 'Firmware', icon: '💾' },
          { id: 'threedmodel', label: '3D Model', icon: '🧊' },
        ],
      });
    }

    return list;
  }, [showSoftware, showHardware]);

  const safeIssues = Array.isArray(validationIssues)
    ? validationIssues.filter((i) => i && typeof i === 'object')
    : [];
  const errorCount = safeIssues.filter((i) => (i.severity || '').toUpperCase() === 'ERROR').length;
  const warnCount = safeIssues.filter((i) => (i.severity || '').toUpperCase() === 'WARNING').length;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--border-default)',
        paddingBottom: '0.75rem',
      }}
    >
      {groups.map((group) => (
        <div key={group.groupName} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Group Label Pill */}
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              backgroundColor:
                group.groupName === 'HARDWARE'
                  ? 'rgba(16, 185, 129, 0.15)'
                  : group.groupName === 'SOFTWARE'
                  ? 'rgba(56, 189, 248, 0.15)'
                  : 'rgba(255, 255, 255, 0.08)',
              color:
                group.groupName === 'HARDWARE'
                  ? '#10b981'
                  : group.groupName === 'SOFTWARE'
                  ? 'var(--accent-cyan)'
                  : 'var(--text-muted)',
              minWidth: '75px',
              textAlign: 'center',
            }}
          >
            {group.groupName}
          </span>

          {/* Group Tabs */}
          <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', scrollbarWidth: 'thin' }}>
            {group.tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const isValidation = tab.id === 'validation';
              const hasBadge = isValidation && validationIssues.length > 0;
              const badgeBg = errorCount > 0 ? 'var(--accent-red)' : warnCount > 0 ? 'var(--accent-orange)' : 'var(--accent-cyan)';

              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  role="tab"
                  data-tab={tab.id}
                  aria-selected={isActive}
                  onClick={() => onSelectTab(tab.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'rgba(22, 217, 227, 0.12)' : 'transparent',
                    borderRadius: 'var(--radius-sm)',
                    border: isActive ? '1px solid rgba(22, 217, 227, 0.35)' : '1px solid transparent',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {hasBadge && (
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        lineHeight: 1,
                        padding: '0.15rem 0.35rem',
                        borderRadius: '999px',
                        backgroundColor: badgeBg,
                        color: '#FFFFFF',
                        marginLeft: '0.2rem',
                      }}
                    >
                      {validationIssues.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
