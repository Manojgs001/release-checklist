import { useState, useEffect } from 'react';
import { api } from './api/client';
import { NewReleaseModal } from './components/NewReleaseModal';
import { ReleaseDetail } from './components/ReleaseDetail';
import './index.css';

function formatDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function App() {
  const [releases, setReleases] = useState([]);
  const [steps, setSteps] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [r, s] = await Promise.all([api.getReleases(), api.getSteps()]);
        setReleases(r);
        setSteps(s);
        if (r.length > 0) setSelectedId(r[0].id);
      } catch (err) {
        setError('Failed to load data. Is the API running?');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selectedRelease = releases.find((r) => r.id === selectedId);

  function handleCreate(release) {
    setReleases((prev) => [release, ...prev].sort((a, b) => new Date(a.release_date) - new Date(b.release_date)));
    setSelectedId(release.id);
  }

  function handleChange(updated) {
    setReleases((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  function handleDelete(id) {
    setReleases((prev) => prev.filter((r) => r.id !== id));
    setSelectedId((prev) => {
      const remaining = releases.filter((r) => r.id !== id);
      return remaining.length > 0 ? remaining[0].id : null;
    });
  }

  return (
    <>
      <header className="app-header">
        <h1>▸ Release Checklist</h1>
        <span>{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Releases ({releases.length})</h2>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New</button>
          </div>

          {loading && (
            <div style={{ padding: '2rem 1.5rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
              Loading…
            </div>
          )}
          {error && (
            <div style={{ padding: '2rem 1.5rem', color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
              {error}
            </div>
          )}

          <div className="release-list">
            {releases.map((r) => {
              const pct = steps.length ? Math.round((r.completed_steps.length / steps.length) * 100) : 0;
              return (
                <div
                  key={r.id}
                  className={`release-item${r.id === selectedId ? ' active' : ''}`}
                  onClick={() => setSelectedId(r.id)}
                >
                  <div className="release-item-name">{r.name}</div>
                  <div className="release-item-meta">
                    <span className={`status-badge ${r.status}`}>{r.status}</span>
                    <span className="release-item-date">{formatDate(r.release_date)}</span>
                  </div>
                  <div className="progress-bar-mini">
                    <div className="progress-bar-mini-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {!loading && !error && releases.length === 0 && (
              <div style={{ padding: '2rem 1.5rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                No releases yet.
              </div>
            )}
          </div>
        </aside>

        {selectedRelease ? (
          <ReleaseDetail
            key={selectedRelease.id}
            release={selectedRelease}
            steps={steps}
            onChange={handleChange}
            onDelete={handleDelete}
          />
        ) : (
          <div className="detail-panel">
            <div className="empty-state">
              <div className="icon">▸</div>
              <p>Select or create a release to get started</p>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <NewReleaseModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </>
  );
}
