import { useState } from 'react';
import SafePrototypeEngine from '../prototype/SafePrototypeEngine';
import TechStackTab from './TechStackTab';
import ErrorBoundary from '../common/ErrorBoundary';

/**
 * Collapsible Software Plan Section.
 * Comprehensive software engineering plan: architecture, tech stack, data structure,
 * APIs, screens, and safe interactive prototype engine.
 */
export default function SoftwarePlanSection({
  blueprint = {},
  defaultExpanded = true,
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeSubTab, setActiveSubTab] = useState('prototype');

  const software = blueprint.software || {};
  // If software section is not applicable, don't show
  if (software.applicable === false && blueprint.projectType === 'HARDWARE') {
    return null;
  }

  const collections = software.database?.collections || blueprint.database?.collections || [];
  const apis = software.apis || blueprint.apis || [];
  const screens = software.screens || blueprint.uiScreens || [];
  const prototypeData = software.prototype || blueprint.prototype;
  const techStack = software.recommendedTechStack || blueprint.recommendedTechStack;
  const architecture = software.architecture || blueprint.architecture || {};
  const testingStrategy = software.testingStrategy || [];
  const deploymentPlan = software.deploymentPlan || [];

  return (
    <section
      className="card"
      aria-label="Software Engineering Plan"
      style={{
        border: '1px solid rgba(56, 189, 248, 0.35)',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Section Header with Expand/Collapse Toggle */}
      <div
        onClick={() => setIsExpanded((v) => !v)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 1.5rem',
          cursor: 'pointer',
          borderBottom: isExpanded ? '1px solid var(--border-subtle)' : 'none',
          backgroundColor: 'rgba(56, 189, 248, 0.05)',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>💻</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge" style={{ backgroundColor: '#0284c7', color: '#fff', fontSize: '0.6875rem' }}>
                SOFTWARE
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Software Plan & Application Architecture
              </h2>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
              Recommended tech stack, API specifications, data structures, UI screens, and interactive prototype demo.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {screens.length} Screens • {apis.length} APIs • {collections.length} Collections
          </span>
          <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Sub-tab Navigation */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              borderBottom: '1px solid var(--border-default)',
              paddingBottom: '0.5rem',
            }}
          >
            {[
              { id: 'prototype', label: 'Interactive Prototype', icon: '📱' },
              { id: 'techstack', label: 'Tech Stack', icon: '⚙️' },
              { id: 'apis', label: 'Backend APIs', icon: '🔌' },
              { id: 'database', label: 'Database Schema', icon: '🗄️' },
              { id: 'screens', label: 'App Screens', icon: '🖥️' },
              { id: 'architecture', label: 'Architecture & Testing', icon: '🏗️' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8125rem',
                  fontWeight: activeSubTab === tab.id ? 700 : 500,
                  color: activeSubTab === tab.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  backgroundColor: activeSubTab === tab.id ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                  borderRadius: 'var(--radius-sm)',
                  border: activeSubTab === tab.id ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* SUB-TAB 1: Interactive Prototype */}
          {activeSubTab === 'prototype' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Software Prototype Demo
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
                    Click through simulated user journeys and sample UI components generated from your requirements.
                  </p>
                </div>
              </div>

              {/* Safe Prototype Renderer */}
              <ErrorBoundary sectionName="Interactive Software Prototype" level="section">
                <SafePrototypeEngine prototype={prototypeData} />
              </ErrorBoundary>
            </div>
          )}

          {/* SUB-TAB 2: Tech Stack */}
          {activeSubTab === 'techstack' && (
            <TechStackTab techStack={techStack} />
          )}

          {/* SUB-TAB 3: Backend APIs */}
          {activeSubTab === 'apis' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  REST & Service API Endpoints ({apis.length})
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {apis.map((api) => {
                  const method = (api.method || 'GET').toUpperCase();
                  const methodColor =
                    method === 'GET'
                      ? '#06b6d4'
                      : method === 'POST'
                      ? '#10b981'
                      : method === 'PUT' || method === 'PATCH'
                      ? '#f59e0b'
                      : '#ef4444';

                  return (
                    <div
                      key={api.id || api.endpoint}
                      style={{
                        padding: '1rem',
                        backgroundColor: 'var(--bg-elevated)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            backgroundColor: methodColor,
                            color: '#0f172a',
                            fontFamily: 'monospace',
                          }}
                        >
                          {method}
                        </span>
                        <code style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                          {api.endpoint}
                        </code>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                        {api.description}
                      </p>
                      {api.roleIds?.length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Authorized Roles: {api.roleIds.join(', ')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUB-TAB 4: Database Schema */}
          {activeSubTab === 'database' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Data Collections & Entities ({collections.length})
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {collections.map((col) => (
                  <div
                    key={col.name}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.125rem' }}>📄</span>
                      <strong style={{ fontSize: '0.9375rem', color: 'var(--accent-cyan)' }}>
                        {col.name}
                      </strong>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                      {col.description}
                    </p>

                    {col.fields?.length > 0 && (
                      <div style={{ marginTop: '0.25rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                          FIELDS:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {col.fields.map((f) => (
                            <span
                              key={f.name}
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.15rem 0.4rem',
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '3px',
                                fontFamily: 'monospace',
                                color: f.required ? 'var(--text-primary)' : 'var(--text-muted)',
                              }}
                            >
                              {f.name}
                              <span style={{ color: 'var(--accent-orange)' }}>:{f.type}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-TAB 5: App Screens */}
          {activeSubTab === 'screens' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Application Screens & UI Layouts ({screens.length})
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {screens.map((screen) => (
                  <div
                    key={screen.id}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '1.125rem' }}>🖥️</span>
                      <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                        {screen.name}
                      </strong>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>
                      {screen.purpose}
                    </p>
                    {screen.components?.length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <strong>Components:</strong> {screen.components.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-TAB 6: Architecture, Testing, Deployment */}
          {activeSubTab === 'architecture' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {architecture.summary && (
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '3px solid var(--accent-purple)',
                  }}
                >
                  <strong style={{ fontSize: '0.8125rem', color: 'var(--accent-purple)', textTransform: 'uppercase' }}>
                    Software Architecture Pattern
                  </strong>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                    {architecture.summary}
                  </p>
                </div>
              )}

              {testingStrategy?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Testing Strategy
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {testingStrategy.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {deploymentPlan?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Deployment & DevOps Pipeline
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {deploymentPlan.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
