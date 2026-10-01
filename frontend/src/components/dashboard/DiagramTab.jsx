import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import SectionIntro from '../common/SectionIntro';
import TechnicalDetails from '../common/TechnicalDetails';
import { generateMermaidErDiagram } from '../../utils/mermaidTransformer';

// Configure strict security once
mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'dark',
  themeVariables: {
    darkMode: true,
    background: '#0D1C2B',
    primaryColor: '#102437',
    primaryTextColor: '#F4F8FC',
    primaryBorderColor: 'rgba(22, 217, 227, 0.35)',
    lineColor: '#16D9E3',
    secondaryColor: '#162A3D',
    tertiaryColor: '#08131F'
  },
  fontFamily: 'Inter, sans-serif',
  er: {
    useMaxWidth: true,
  }
});

export default function DiagramTab({ blueprint }) {
  const [viewMode, setViewMode] = useState('DIAGRAM'); // 'DIAGRAM' or 'TEXT'
  const [zoom, setZoom] = useState(1);
  const [svgHtml, setSvgHtml] = useState('');
  const [renderError, setRenderError] = useState(null);
  const containerRef = useRef(null);

  const database = blueprint?.database || blueprint?.software?.database || {};
  let mermaidResult = { mermaidCode: '', unresolvedLinks: [], hasCollections: false };
  try {
    mermaidResult = generateMermaidErDiagram(database);
  } catch (err) {
    console.warn('generateMermaidErDiagram failed during render:', err);
  }
  const { mermaidCode, unresolvedLinks, hasCollections } = mermaidResult;

  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async () => {
      setRenderError(null);

      if (!hasCollections) {
        if (isMounted) setSvgHtml('');
        return;
      }

      try {
        const uniqueId = `mermaid-er-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(uniqueId, mermaidCode);
        if (isMounted) {
          // Defense-in-depth sanitization: strip any scripts or inline handlers
          const cleanSvg = svg
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '');
          setSvgHtml(cleanSvg);
        }
      } catch (err) {
        console.error('Mermaid render failure:', err);
        if (isMounted) {
          setRenderError(err.message || 'Failed to render Mermaid diagram syntax.');
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [mermaidCode, hasCollections]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 2.0));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <SectionIntro
        title="Data Map"
        explanation="The Data Map visualizes how your planned data collections are related."
        technicalDetails={
          <div>
            <div>
              📊 <strong>Deterministic ER Diagram:</strong> Derived directly from <code>database.collections</code> and references. No raw Mermaid is accepted from untrusted AI output.
            </div>
            <div style={{ marginTop: '0.375rem' }}>
              <strong>Renderer Security:</strong> Executed under Mermaid <code>securityLevel: 'strict'</code> with defense-in-depth script stripping.
            </div>
          </div>
        }
      />

      {/* Legend & Guidance */}
      <div className="card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--bg-muted)' }}>
        <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Relationship Types (Cardinality Legend):
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.625rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div>
            <strong>One-to-One:</strong> One record connects to exactly one other record.
          </div>
          <div>
            <strong>One-to-Many:</strong> One record can be connected to multiple records.
          </div>
          <div>
            <strong>Many-to-One:</strong> Multiple records point to a single parent record.
          </div>
          <div>
            <strong>Many-to-Many:</strong> Multiple records connect to multiple other records.
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)'
      }}>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {viewMode === 'DIAGRAM' ? 'Interactive visual canvas' : 'Structured text list'}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* View mode toggle */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setViewMode('DIAGRAM')}
              style={{
                padding: '0.25rem 0.625rem',
                fontSize: '0.75rem',
                fontWeight: viewMode === 'DIAGRAM' ? 700 : 500,
                backgroundColor: viewMode === 'DIAGRAM' ? 'var(--accent-aqua-light)' : 'transparent',
                color: viewMode === 'DIAGRAM' ? 'var(--accent-aqua)' : 'var(--text-secondary)'
              }}
            >
              Visual Diagram
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TEXT')}
              style={{
                padding: '0.25rem 0.625rem',
                fontSize: '0.75rem',
                fontWeight: viewMode === 'TEXT' ? 700 : 500,
                backgroundColor: viewMode === 'TEXT' ? 'var(--accent-aqua-light)' : 'transparent',
                color: viewMode === 'TEXT' ? 'var(--accent-aqua)' : 'var(--text-secondary)'
              }}
            >
              Text Relationships
            </button>
          </div>

          {/* Zoom controls */}
          {viewMode === 'DIAGRAM' && (
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                type="button"
                onClick={handleZoomOut}
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                title="Zoom Out"
              >
                −
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                title="Reset Zoom"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                title="Zoom In"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Unresolved Links Warning */}
      {unresolvedLinks.length > 0 && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--status-warn-bg)',
          border: '1px solid var(--status-warn-border)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8125rem',
          color: 'var(--status-warn)'
        }}>
          <strong>Unresolved Cross-References ({unresolvedLinks.length}):</strong>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
            {unresolvedLinks.map((ul, idx) => (
              <li key={idx}>{ul.reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Render Fallback Error */}
      {renderError && (
        <div style={{
          padding: '1rem',
          backgroundColor: 'var(--status-down-bg)',
          border: '1px solid var(--status-down-border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--status-down)',
          fontSize: '0.875rem'
        }}>
          <strong>Diagram Rendering Notice:</strong> Visual rendering encountered an issue. Falling back to structured schema table view below.
          <div style={{ fontSize: '0.75rem', marginTop: '0.375rem', fontFamily: 'var(--font-mono)' }}>
            {renderError}
          </div>
        </div>
      )}

      {/* Diagram Canvas */}
      {viewMode === 'DIAGRAM' && !renderError && (
        <div className="card" style={{
          overflow: 'auto',
          minHeight: '400px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem'
        }}>
          {svgHtml ? (
            <div
              ref={containerRef}
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
                width: '100%',
                display: 'flex',
                justifyContent: 'center'
              }}
              dangerouslySetInnerHTML={{ __html: svgHtml }}
            />
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>
              No collections available to render relationship diagram.
            </p>
          )}
        </div>
      )}

      {/* Text / Fallback Relationship View */}
      {(viewMode === 'TEXT' || renderError) && (
        <div className="card">
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Data Model Structured Text View
          </h4>

          {/* Collections List */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h5 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Collections ({database.collections?.length || 0})
            </h5>
            {database.collections && database.collections.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                {database.collections.map((c) => (
                  <div key={c.id} style={{ padding: '0.625rem 0.75rem', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      <code>{c.name}</code> <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({c.id})</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {c.fields?.length || 0} fields: {c.fields?.map((f) => f.name).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No collections defined.</p>
            )}
          </div>

          <h5 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Relationships ({database.relationships?.length || 0})
          </h5>

          {database.relationships && database.relationships.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {database.relationships.map((rel) => (
                <div key={rel.id} style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>
                      {rel.sourceCollectionId}.{rel.sourceField} ➔ {rel.targetCollectionId}.{rel.targetField}
                    </div>
                    <span className="badge badge-aqua" style={{ fontSize: '0.6875rem' }}>
                      {rel.cardinality}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {rel.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              No relationships defined between collections.
            </p>
          )}

          {/* Diagram Technical Source (Collapsed by default) */}
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <TechnicalDetails summary="Diagram Technical Source">
              <pre className="code-block" style={{ maxHeight: '180px', overflowY: 'auto', margin: 0 }}>
                {mermaidCode}
              </pre>
            </TechnicalDetails>
          </div>
        </div>
      )}
    </div>
  );
}
