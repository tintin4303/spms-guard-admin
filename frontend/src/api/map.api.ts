import { API_BASE_URL, authenticatedFetch } from './client';

export const savePatrolPath = async (name: string, pins: any[], siteId?: string) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/map/paths`, {
    method: 'POST',
    body: JSON.stringify({ name, siteId, pins }),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || 'Failed to save path');
  }
  return response.json();
};

export const fetchPatrolPaths = async (siteId?: string, clientId?: string) => {
  let url = `${API_BASE_URL}/map/paths?`;
  if (siteId) url += `siteId=${siteId}&`;
  if (clientId) url += `clientId=${clientId}&`;
  if (url.endsWith('?')) url = url.slice(0, -1);
  const response = await authenticatedFetch(url);
  if (!response.ok) throw new Error('Failed to fetch patrol paths');
  return response.json();
};

export const updatePatrolPath = async (id: string, pins: any[]) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/map/paths/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ pins }),
  });
  if (!response.ok) throw new Error('Update failed');
  return response.json();
};

export const deletePatrolPath = async (id: string) => {
  const res = await authenticatedFetch(`${API_BASE_URL}/map/paths/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete failed');
  return res.json();
};
