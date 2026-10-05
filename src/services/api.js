import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://storeql-backend.onrender.com/api';

console.log('[StoreQL Web API] Target URL:', API_BASE_URL);

export class ApiClientError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function getAuthHeader() {
  const user = auth.currentUser;
  if (!user) return {};
  try {
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
  } catch (err) {
    console.warn('[StoreQL API] Could not get ID token:', err);
    return {};
  }
}

async function request(path, { method = 'GET', body, headers = {}, isFormData = false } = {}) {
  const authHeader = await getAuthHeader();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...authHeader,
      ...headers,
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    // 204 No Content or empty
  }

  if (!response.ok) {
    const message = data?.error?.message || data?.message || 'Something went wrong. Please try again.';
    throw new ApiClientError(message, response.status, data?.error?.details);
  }

  return data;
}

export const api = {
  // Auth
  syncUser: () => request('/auth/sync', { method: 'POST' }),
  updateProfile: (data) => request('/auth/profile', { method: 'PATCH', body: data }),
  deleteAccount: () => request('/auth/account', { method: 'DELETE' }),

  // Spaces
  getSpaces: () => request('/spaces'),
  getSpace: (id) => request(`/spaces/${id}`),
  createSpace: (data) => request('/spaces', { method: 'POST', body: data }),
  updateSpace: (id, data) => request(`/spaces/${id}`, { method: 'PATCH', body: data }),
  deleteSpace: (id) => request(`/spaces/${id}`, { method: 'DELETE' }),

  // Links
  getLinks: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const qs = new URLSearchParams(cleanParams).toString();
    return request(`/links${qs ? `?${qs}` : ''}`);
  },
  getLink: (id) => request(`/links/${id}`),
  previewLink: (url) => request('/links/preview', { method: 'POST', body: { url } }),
  createLink: (data) => request('/links', { method: 'POST', body: data }),
  updateLink: (id, data) => request(`/links/${id}`, { method: 'PATCH', body: data }),
  deleteLink: (id) => request(`/links/${id}`, { method: 'DELETE' }),
  refreshLinkMeta: (id) => request(`/links/${id}/refresh-meta`, { method: 'POST' }),

  // Matters (Notes / Thoughts / Highlights attached to a link)
  getMatters: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const qs = new URLSearchParams(cleanParams).toString();
    return request(`/matters${qs ? `?${qs}` : ''}`);
  },
  createMatter: (data) => request('/matters', { method: 'POST', body: data }),
  updateMatter: (id, data) => request(`/matters/${id}`, { method: 'PATCH', body: data }),
  deleteMatter: (id) => request(`/matters/${id}`, { method: 'DELETE' }),

  // Tags
  getTags: () => request('/tags'),
  createTag: (name) => request('/tags', { method: 'POST', body: name ? { name } : {} }),
  updateTag: (id, name) => request(`/tags/${id}`, { method: 'PATCH', body: { name } }),
  deleteTag: (id) => request(`/tags/${id}`, { method: 'DELETE' }),

  // Search
  search: (q, params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const qs = new URLSearchParams({ q: (q || '').trim(), ...cleanParams }).toString();
    return request(`/search?${qs}`);
  },

  // Health check
  health: () => request('/health').catch(() => null),
};
