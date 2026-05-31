const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  getReleases: () => request('/releases'),
  getRelease: (id) => request(`/releases/${id}`),
  getSteps: () => request('/releases/meta/steps'),
  createRelease: (data) => request('/releases', { method: 'POST', body: data }),
  updateRelease: (id, data) => request(`/releases/${id}`, { method: 'PATCH', body: data }),
  toggleStep: (id, step_id, completed) =>
    request(`/releases/${id}/steps`, { method: 'PATCH', body: { step_id, completed } }),
  deleteRelease: (id) => request(`/releases/${id}`, { method: 'DELETE' }),
};
