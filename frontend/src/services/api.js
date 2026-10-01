const rawBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '')
  : '';

const API_BASE = rawBase ? (rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`) : '/api';
const DEFAULT_TIMEOUT_MS = 45000;

export class ApiError extends Error {
  constructor(message, status, code, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code || 'UNKNOWN_ERROR';
    this.data = data || null;
  }
}

async function request(endpoint, options = {}) {
  const { timeout = DEFAULT_TIMEOUT_MS, headers = {}, ...restOptions } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timer);

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { text };
        }
      }
    }

    if (!response.ok) {
      const code = data?.code || `HTTP_${response.status}`;
      const message = data?.message || `Request failed with status ${response.status}`;
      throw new ApiError(message, response.status, code, data);
    }

    return data;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out. Please check backend connection.', 408, 'TIMEOUT');
    }
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || 'Network connection error', 0, 'NETWORK_ERROR');
  }
}

export const api = {
  // Phase 1 Health check
  getHealth: () => request('/health'),

  // Phase 3 Project CRUD
  createProject: (payload) => request('/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  getProjects: (page = 0, size = 20) => request(`/projects?page=${page}&size=${size}`),

  getProject: (id) => request(`/projects/${id}`),

  updateProject: (id, payload, expectedRevision) => request(`/projects/${id}`, {
    method: 'PATCH',
    headers: { 'If-Match': String(expectedRevision) },
    body: JSON.stringify(payload),
  }),

  deleteProject: (id, expectedRevision) => request(`/projects/${id}`, {
    method: 'DELETE',
    headers: { 'If-Match': String(expectedRevision) },
  }),

  // Phase 4 Blueprint Generation
  generateBlueprint: (id, expectedRevision, mode) => request(`/projects/${id}/generate`, {
    method: 'POST',
    body: JSON.stringify({ expectedRevision, mode }),
  }),

  // Phase 5 Blueprint Edits & Regeneration
  updateBlueprint: (id, blueprint, expectedRevision) => request(`/projects/${id}/blueprint`, {
    method: 'PUT',
    headers: { 'If-Match': String(expectedRevision) },
    body: JSON.stringify({ blueprint, expectedRevision }),
  }),

  regenerateBlueprint: (id, section, instructions, expectedRevision, mode) => request(`/projects/${id}/regenerate`, {
    method: 'POST',
    headers: expectedRevision != null ? { 'If-Match': String(expectedRevision) } : {},
    body: JSON.stringify({ section, instructions, expectedRevision, mode }),
  }),

  // Phase 7 Deterministic Validation
  validateBlueprint: (id, expectedRevision) => request(`/projects/${id}/validate`, {
    method: 'POST',
    body: JSON.stringify({ expectedRevision }),
  }),
};
