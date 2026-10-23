const API = 'http://localhost:8050/api/auth';

export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export const ensureCsrf = async () => {
  await fetch(`${API}/csrf/`, { credentials: 'include' });
};

const jsonFetch = async (url, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { credentials: 'include', ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
};

export const me = () => jsonFetch(`${API}/me/`);
export const register = async (payload) => {
  await ensureCsrf();
  return jsonFetch(`${API}/register/`, {
    method: 'POST',
    headers: { 'X-CSRFToken': getCookie('csrftoken') || '' },
    body: JSON.stringify(payload),
  });
};
export const login = async (payload) => {
  await ensureCsrf();
  return jsonFetch(`${API}/login/`, {
    method: 'POST',
    headers: { 'X-CSRFToken': getCookie('csrftoken') || '' },
    body: JSON.stringify(payload),
  });
};
export const logout = async () => {
  await ensureCsrf();
  return jsonFetch(`${API}/logout/`, {
    method: 'POST',
    headers: { 'X-CSRFToken': getCookie('csrftoken') || '' },
  });
};
export const changePassword = async (payload) => {
  await ensureCsrf();
  return jsonFetch(`${API}/change-password/`, {
    method: 'POST',
    headers: { 'X-CSRFToken': getCookie('csrftoken') || '' },
    body: JSON.stringify(payload),
  });
};