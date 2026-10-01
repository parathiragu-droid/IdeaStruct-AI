import { useState, useEffect } from 'react';
import Navbar from '../components/navigation/Navbar';
import TechnicalDetails from '../components/common/TechnicalDetails';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { api } from '../services/api';

export default function HealthCheckPage() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getHealth();
      setHealthData(data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    api.getHealth()
      .then((data) => {
        if (isMounted) {
          setHealthData(data);
          setLastChecked(new Date().toLocaleTimeString());
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to connect to backend server');
          setHealthData(null);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ErrorBoundary level="page" sectionName="System Status">
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
        <Navbar />

      <main className="container" style={{ flex: 1, paddingTop: '2rem', paddingBottom: '3.5rem', maxWidth: '960px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-aqua" style={{ fontSize: '0.6875rem' }}>System Diagnostics</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
            System Status
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', margin: 0 }}>
            Check whether all parts of IdeaStruct AI are available.
          </p>
        </div>

        {/* Status Dashboard Card */}
        <div className="card" style={{ marginBottom: '1.75rem', padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                System Connectivity Status
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                Live probe of Spring Boot backend and local MongoDB database
              </p>
            </div>
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="btn btn-primary"
              id="btn-recheck-health"
              style={{ fontSize: '0.875rem' }}
            >
              <span>🔄</span>
              {loading ? 'Checking...' : 'Recheck Status'}
            </button>
          </div>

          {error && (
            <div style={{
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--status-down-bg)',
              border: '1px solid var(--status-down-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--status-down)',
              marginBottom: '1.5rem',
              fontSize: '0.875rem'
            }}>
              <strong>Connection Error:</strong> {error}
              <div style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Unable to connect to IdeaStruct AI backend service on <code>http://localhost:8080</code>.
              </div>
            </div>
          )}

          {/* Service Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
            {/* Backend Card */}
            <div style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              borderTop: '3px solid var(--accent-blue)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>⚙️</span>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Backend</span>
                </div>
                {loading && !healthData ? (
                  <span className="badge badge-aqua">Checking...</span>
                ) : healthData ? (
                  <span className="badge badge-up" id="badge-backend-status">Available (UP)</span>
                ) : (
                  <span className="badge badge-down" id="badge-backend-status">Unavailable</span>
                )}
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                Spring Boot Application Server
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                {healthData ? 'Responding normally on port 8080' : (error ? 'Server unreachable' : 'Checking status...')}
              </p>
            </div>

            {/* Database Card */}
            <div style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              borderTop: '3px solid var(--accent-green)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🗄️</span>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Database</span>
                </div>
                {loading && !healthData ? (
                  <span className="badge badge-aqua">Checking...</span>
                ) : healthData?.database?.status === 'UP' ? (
                  <span className="badge badge-up" id="badge-mongo-status">Available (UP)</span>
                ) : healthData?.database?.status === 'DOWN' ? (
                  <span className="badge badge-down" id="badge-mongo-status">Unavailable (DOWN)</span>
                ) : (
                  <span className="badge badge-warn">Unavailable</span>
                )}
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                MongoDB Persistence Store
              </p>
              <p style={{ fontSize: '0.75rem', color: healthData?.database?.status === 'UP' ? 'var(--status-up)' : 'var(--status-down)', margin: 0 }}>
                {healthData?.database?.message || (error ? 'Database probe failed' : 'Checking readiness...')}
              </p>
            </div>

            {/* AI Service Card */}
            <div style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              borderTop: '3px solid var(--accent-purple)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>⚡</span>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>AI Service</span>
                </div>
                <span className="badge badge-purple">Ready</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                Gemini AI &amp; Offline Demo Engine
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Deterministic Demo fixture ready; Live Gemini available when configured.
              </p>
            </div>
          </div>

          {healthData && (
            <TechnicalDetails summary="Technical details (raw response)">
              <div style={{ marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Target endpoint: <code>/api/health</code> | Database: <code>{healthData.database?.databaseName || 'ideastruct_ai'}</code>
                {lastChecked && ` | Last probed at ${lastChecked}`}
              </div>
              <pre className="code-block" id="raw-health-output" style={{ maxHeight: '200px', overflowY: 'auto', margin: 0 }}>
                {JSON.stringify(healthData, null, 2)}
              </pre>
            </TechnicalDetails>
          )}
        </div>

        {/* Security & Architecture Note */}
        <div style={{
          padding: '1.125rem 1.25rem',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)'
        }}>
          <strong style={{ color: 'var(--accent-cyan)' }}>Architecture Note:</strong> IdeaStruct AI checks backend connectivity and MongoDB readiness directly. No API secrets or passwords are exposed.
        </div>
      </main>
      </div>
    </ErrorBoundary>
  );
}
