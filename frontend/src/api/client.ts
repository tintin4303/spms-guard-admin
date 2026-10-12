const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_BASE_URL = isLocal ? 'http://localhost:3001/api' : '/api';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('spms_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('spms_token');
    localStorage.removeItem('spms_user');
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  }
  return response;
};
