import { useState } from 'react';
import SectionIntro from '../common/SectionIntro';
import TechnicalDetails from '../common/TechnicalDetails';
import { resolveFeatureNames, formatCardinalitySentence } from '../../utils/entityResolvers';

/**
 * DatabaseTab Component
 *
 * Displays proposed document collections, field definitions with human Yes/No constraints,
 * suggested indexes, and plain-language relationship summaries.
 */
export default function DatabaseTab({ blueprint }) {
  const [activeSection, setActiveSection] = useState('ALL'); // 'ALL', 'COLLECTIONS', 'RELATIONSHIPS'
  const collections = Array.isArray(blueprint?.database?.collections) ? blueprint.database.collections : (Array.isArray(blueprint?.software?.database?.collections) ? blueprint.software.database.collections : []);
  const relationships = Array.isArray(blueprint?.database?.relationships) ? blueprint.database.relationships : (Array.isArray(blueprint?.software?.database?.relationships) ? blueprint.software.database.relationships : []);
  const features = Array.isArray(blueprint?.features) ? blueprint.features : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <SectionIntro
        title="Data Structure"
        explanation="Data Structure shows what information your application may need to store and how those records may be connected."
        technicalDetails={
          <div>
            <div>
              💡 <strong>Planning Artifact:</strong> These MongoDB document schemas describe your proposed application architecture. Generating this blueprint does not execute database commands or provision collections.
            </div>
            <div style={{ marginTop: '0.375rem' }}>
              <strong>Schema Section:</strong> <code>blueprint.database</code> (MongoDB document models & relationship specifications).
            </div>
          </div>
        }
      />

      {/* Top Switch: Collections / Relationships */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveSection('ALL')}
          className="btn btn-secondary"
          style={{
            fontSize: '0.8125rem',
            padding: '0.375rem 0.875rem',
            backgroundColor: activeSection === 'ALL' ? 'rgba(22, 217, 227, 0.15)' : 'var(--bg-elevated)',
            color: activeSection === 'ALL' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            borderColor: activeSection === 'ALL' ? 'var(--accent-cyan)' : 'var(--border-default)',
            fontWeight: activeSection === 'ALL' ? 700 : 500,
          }}
        >
          All Data
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('COLLECTIONS')}
          className="btn btn-secondary"
          style={{
            fontSize: '0.8125rem',
            padding: '0.375rem 0.875rem',
            backgroundColor: activeSection === 'COLLECTIONS' ? 'rgba(51, 136, 255, 0.18)' : 'var(--bg-elevated)',
            color: activeSection === 'COLLECTIONS' ? 'var(--accent-blue)' : 'var(--text-secondary)',
            borderColor: activeSection === 'COLLECTIONS' ? 'var(--accent-blue)' : 'var(--border-default)',
            fontWeight: activeSection === 'COLLECTIONS' ? 700 : 500,
          }}
        >
          Collections ({collections.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('RELATIONSHIPS')}
          className="btn btn-secondary"
          style={{
            fontSize: '0.8125rem',
            padding: '0.375rem 0.875rem',
            backgroundColor: activeSection === 'RELATIONSHIPS' ? 'rgba(139, 92, 246, 0.18)' : 'var(--bg-elevated)',
            color: activeSection === 'RELATIONSHIPS' ? 'var(--accent-purple)' : 'var(--text-secondary)',
            borderColor: activeSection === 'RELATIONSHIPS' ? 'var(--accent-purple)' : 'var(--border-default)',
            fontWeight: activeSection === 'RELATIONSHIPS' ? 700 : 500,
          }}
        >
          Relationships ({relationships.length})
        </button>
      </div>

      {/* Document Collections */}
      {(activeSection === 'ALL' || activeSection === 'COLLECTIONS') && (
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          Document Collections ({collections.length})
        </h3>

        {collections.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            No data collections are currently defined.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {collections.map((coll) => {
              const featureNames = resolveFeatureNames(coll.featureIds, features);

              return (
                <div key={coll.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <code style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--accent-aqua)' }}>
                        {coll.name}
                      </code>
                      <span className="badge badge-aqua" style={{ fontSize: '0.6875rem' }}>
                        {coll.fields?.length || 0} fields
                      </span>
                    </div>

                    {featureNames.length > 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <strong>Features:</strong> {featureNames.join(', ')}
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                    {coll.description}
                  </p>

                  {/* Fields Table with Friendly Headers and Yes/No Booleans */}
                  <div style={{ overflowX: 'auto', marginBottom: '1rem', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-default)', textAlign: 'left' }}>
                          <th style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Field</th>
                          <th style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Type</th>
                          <th style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Required?</th>
                          <th style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Unique?</th>
                          <th style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Purpose</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coll.fields?.map((f, idx) => (
                          <tr key={idx} style={{ borderBottom: idx < coll.fields.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                            <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {f.name}
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', color: 'var(--accent-cyan)' }}>
                              {f.dataType}
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              {f.required ? (
                                <span className="badge badge-green badge-up" style={{ fontSize: '0.625rem' }}>Yes</span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No</span>
                              )}
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              {f.unique ? (
                                <span className="badge badge-cyan badge-aqua" style={{ fontSize: '0.625rem' }}>Yes</span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No</span>
                              )}
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>
                              <div>{f.description}</div>
                              {f.embeddedShape && (
                                <div style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span className="badge badge-purple" style={{ fontSize: '0.625rem' }}>
                                    Embedded data
                                  </span>
                                  <code style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                                    {JSON.stringify(f.embeddedShape)}
                                  </code>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Suggested Indexes */}
                  {coll.indexes && coll.indexes.length > 0 && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        Suggested Indexes
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                        Indexes can help the database find records faster.
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {coll.indexes.map((idx, i) => (
                          <code key={i} style={{ backgroundColor: 'var(--bg-elevated)', padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                            {idx}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technical Details Collapsed */}
                  <TechnicalDetails summary="Collection technical details">
                    <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div><strong>Collection ID:</strong> <code>{coll.id}</code></div>
                      <div><strong>Linked Feature IDs:</strong> <code>{coll.featureIds?.join(', ') || 'none'}</code></div>
                    </div>
                  </TechnicalDetails>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* Relationships */}
      {(activeSection === 'ALL' || activeSection === 'RELATIONSHIPS') && (
      <div className="card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          Collection Relationships & References ({relationships.length})
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Explains how documents in different collections reference each other.
        </p>

        {relationships.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No data relationships are currently defined.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {relationships.map((rel) => {
              const plainSentence = formatCardinalitySentence(
                rel.sourceCollectionId,
                rel.targetCollectionId,
                rel.cardinality
              );

              return (
                <div key={rel.id} style={{ padding: '0.875rem 1rem', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {plainSentence}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem' }}>
                    {rel.description}
                  </p>

                  <TechnicalDetails summary="Relationship details" style={{ marginTop: '0.25rem' }}>
                    <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div><strong>ID:</strong> <code>{rel.id}</code></div>
                      <div>
                        <strong>Connection:</strong> <code>{rel.sourceCollectionId}.{rel.sourceField}</code> ➔ <code>{rel.targetCollectionId}.{rel.targetField}</code>
                      </div>
                      <div><strong>Cardinality:</strong> <span className="badge badge-aqua" style={{ fontSize: '0.625rem' }}>{rel.cardinality}</span></div>
                    </div>
                  </TechnicalDetails>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}
    </div>
  );
}
