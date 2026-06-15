const API_BASE = '/api';

export const api = {
  async getTeachers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/teachers?${query}`);
    if (!res.ok) throw new Error('Failed to fetch teachers');
    return res.json();
  },

  async getTeacher(id) {
    const res = await fetch(`${API_BASE}/teachers/${id}`);
    if (!res.ok) throw new Error('Teacher not found');
    return res.json();
  },

  async getFaculties() {
    const res = await fetch(`${API_BASE}/teachers/faculties`);
    if (!res.ok) throw new Error('Failed to fetch faculties');
    return res.json();
  },

  async getDepartments(faculty = '') {
    const query = faculty ? `?faculty=${encodeURIComponent(faculty)}` : '';
    const res = await fetch(`${API_BASE}/teachers/departments${query}`);
    if (!res.ok) throw new Error('Failed to fetch departments');
    return res.json();
  },

  async getSuggestions(params = {}) {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    ).toString();
    const res = await fetch(`${API_BASE}/teachers/suggestions?${query}`);
    if (!res.ok) throw new Error('Failed to fetch suggestions');
    return res.json();
  },

  async getStats() {
    const res = await fetch(`${API_BASE}/teachers/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  async getReviews(teacherId) {
    const res = await fetch(`${API_BASE}/reviews/teacher/${teacherId}`);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  },

  async submitReview(data) {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to submit review');
    return json;
  },

  async scrapeTeachers() {
    const res = await fetch(`${API_BASE}/teachers/scrape`, { method: 'POST' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Scrape failed');
    return json;
  },

  async scrapeProfiles(limit = 25) {
    const res = await fetch(`${API_BASE}/teachers/scrape-profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit, onlyMissing: true }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Profile sync failed');
    return json;
  },
};
