import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const CheckIcon = () => (
  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
    <path d="M1 4l2.5 2.5L9 1" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function formatDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function ReleaseDetail({ release, steps, onChange, onDelete }) {
  const [info, setInfo] = useState(release.additional_info || '');
  const [infoSaved, setInfoSaved] = useState(true);
  const [savingInfo, setSavingInfo] = useState(false);

  useEffect(() => {
    setInfo(release.additional_info || '');
    setInfoSaved(true);
  }, [release.id, release.additional_info]);

  const handleInfoChange = (e) => {
    setInfo(e.target.value);
    setInfoSaved(false);
  };

  const saveInfo = useCallback(async () => {
    if (savingInfo) return;
    setSavingInfo(true);
    try {
      const updated = await api.updateRelease(release.id, { additional_info: info });
      onChange(updated);
      setInfoSaved(true);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSavingInfo(false);
    }
  }, [info, release.id, savingInfo, onChange]);

  const handleToggleStep = async (stepId) => {
    const completed = !release.completed_steps.includes(stepId);
    try {
      const updated = await api.toggleStep(release.id, stepId, completed);
      onChange(updated);
    } catch (err) {
      alert('Failed to update step: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete release "${release.name}"?`)) return;
    try {
      await api.deleteRelease(release.id);
      onDelete(release.id);
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const completedCount = release.completed_steps.length;
  const totalCount = steps.length;
  const pct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div className="detail-title-group">
          <h2 className="detail-title">{release.name}</h2>
          <div className="detail-meta">
            <span className={`status-badge ${release.status}`}>{release.status}</span>
            <span className="detail-date">Due {formatDate(release.release_date)}</span>
          </div>
        </div>
        <div className="detail-actions">
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      <div className="progress-section">
        <p className="section-label">Progress</p>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="progress-label">{completedCount} / {totalCount} steps complete ({pct}%)</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <p className="section-label">Checklist</p>
        <div className="steps-grid">
          {steps.map((step) => {
            const checked = release.completed_steps.includes(step.id);
            return (
              <div
                key={step.id}
                className={`step-item${checked ? ' checked' : ''}`}
                onClick={() => handleToggleStep(step.id)}
              >
                <div className="step-check">
                  <CheckIcon />
                </div>
                <span className="step-label">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="info-section">
        <p className="section-label">Additional Info</p>
        <textarea
          className="info-textarea"
          placeholder="Notes, links, context for this release…"
          value={info}
          onChange={handleInfoChange}
          onBlur={saveInfo}
        />
        <div className="info-save-row">
          <button
            className="btn btn-outline"
            onClick={saveInfo}
            disabled={savingInfo || infoSaved}
          >
            {savingInfo ? 'Saving…' : 'Save'}
          </button>
          {infoSaved && <span className="save-hint">Saved</span>}
          {!infoSaved && <span className="save-hint">Unsaved changes</span>}
        </div>
      </div>
    </div>
  );
}
