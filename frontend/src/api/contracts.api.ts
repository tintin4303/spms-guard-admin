import { API_BASE_URL, authenticatedFetch } from './client';

export const fetchContracts = async (clientId?: string) => {
  let url = `${API_BASE_URL}/contracts`;
  if (clientId) url += `?clientId=${clientId}`;
  const response = await authenticatedFetch(url);
  if (!response.ok) throw new Error('Failed to fetch contracts');
  return response.json();
};

export const createContract = async (data: any) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/contracts`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create contract');
  return response.json();
};

export const updateContract = async (id: string, data: any) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/contracts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update contract');
  return response.json();
};

export const deleteContract = async (id: string) => {
  const res = await authenticatedFetch(`${API_BASE_URL}/contracts/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete contract');
  return res.json();
};
