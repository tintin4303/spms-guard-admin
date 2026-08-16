const API_BASE_URL = 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('spms_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const fetchUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const createUser = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create user');
  return response.json();
};

export const deleteUser = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete user');
  return response.json();
};

export const fetchGuards = async () => {
  const response = await fetch(`${API_BASE_URL}/guards`);
  if (!response.ok) throw new Error('Failed to fetch guards');
  return response.json();
};

export const fetchContracts = async () => {
  const response = await fetch(`${API_BASE_URL}/contracts`);
  if (!response.ok) throw new Error('Failed to fetch contracts');
  return response.json();
};

export const createGuard = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/guards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create guard');
  return response.json();
};

export const updateGuard = async (id: string, data: any) => {
  const response = await fetch(`${API_BASE_URL}/guards/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update guard');
  return response.json();
};

export const deleteGuard = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/guards/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete guard');
  return response.json();
};

export const loginUser = async (email: string, password?: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: password || 'default_password' }) // Fallback for prototype if frontend doesn't pass it yet
  });
  if (!response.ok) throw new Error('Failed to login');
  return response.json();
};

export const registerUser = async (email: string, password?: string, name?: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: password || 'default_password', name }) 
  });
  if (!response.ok) throw new Error('Failed to register');
  return response.json();
};

export const createContract = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/contracts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create contract');
  return response.json();
};

export const updateContract = async (id: string, data: any) => {
  const response = await fetch(`${API_BASE_URL}/contracts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update contract');
  return response.json();
};

export const deleteContract = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/contracts/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete contract');
  return res.json();
};

export const savePatrolPath = async (name: string, pins: any[], siteId?: string) => {
  const response = await fetch(`${API_BASE_URL}/map/paths`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, siteId, pins }),
  });
  if (!response.ok) {
     const errorBody = await response.json().catch(() => ({}));
     throw new Error(errorBody.error || 'Failed to save path');
  }
  return response.json();
};

export const fetchPatrolPaths = async (siteId?: string) => {
  const url = siteId ? `${API_BASE_URL}/map/paths?siteId=${siteId}` : `${API_BASE_URL}/map/paths`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch patrol paths');
  return response.json();
};

export const updatePatrolPath = async (id: string, pins: any[]) => {
  const response = await fetch(`${API_BASE_URL}/map/paths/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pins }),
  });
  if (!response.ok) throw new Error('Update failed');
  return response.json();
};

export const deletePatrolPath = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/map/paths/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete failed');
  return res.json();
};

export const fetchSchedules = async () => {
  const response = await fetch(`${API_BASE_URL}/schedules`);
  if (!response.ok) throw new Error('Failed to fetch schedules');
  return response.json();
};

export const fetchLogs = async () => {
  const response = await fetch(`${API_BASE_URL}/logs`);
  if (!response.ok) throw new Error('Failed to fetch logs');
  return response.json();
};

export const fetchAnalytics = async () => {
  const response = await fetch(`${API_BASE_URL}/analytics/overview`);
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
};

