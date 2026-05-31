import { useState } from 'react';
import { api } from '../api/client';

export function NewReleaseModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setError('Name is required');
    if (!date) return setError('Date is required');
    setError('');
    setLoading(true);
    try {
      const release = await api.createRelease({
        name: name.trim(),
        release_date: new Date(date).toISOString(),
        additional_info: info.trim() || undefined,
      });
      onCreate(release);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>New Release</h3>
        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <div className="form-field">
            <label className="form-label">Release Name *</label>
            <input
              className="form-input"
              placeholder="e.g. v2.4.0"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-field">
            <label className="form-label">Release Date *</label>
            <input
              className="form-input"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Additional Info</label>
            <textarea
              className="form-textarea"
              placeholder="Notes, context, links…"
              value={info}
              onChange={(e) => setInfo(e.target.value)}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
