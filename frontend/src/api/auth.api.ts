import { API_BASE_URL, authenticatedFetch } from './client';

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

export const fetchUsers = async () => {
  const response = await authenticatedFetch(`${API_BASE_URL}/users`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const createUser = async (data: any) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create user');
  return response.json();
};

export const deleteUser = async (id: string) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete user');
  return response.json();
};
