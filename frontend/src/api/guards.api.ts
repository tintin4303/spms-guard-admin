import { API_BASE_URL, authenticatedFetch } from './client';

export const fetchGuards = async () => {
  const response = await authenticatedFetch(`${API_BASE_URL}/guards`);
  if (!response.ok) throw new Error('Failed to fetch guards');
  return response.json();
};

export const createGuard = async (data: any) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/guards`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create guard');
  return response.json();
};

export const updateGuard = async (id: string, data: any) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/guards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update guard');
  return response.json();
};

export const toggleGuardVisibility = async (id: string, isVisibleToOps: boolean) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/guards/${id}/visibility`, {
    method: 'PUT',
    body: JSON.stringify({ isVisibleToOps }),
  });
  if (!response.ok) throw new Error('Failed to update guard visibility');
  return response.json();
};

export const deleteGuard = async (id: string) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/guards/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete guard');
  return response.json();
};

export const provisionGuardAccount = async (id: string, data: any) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/guards/${id}/provision`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to provision guard account');
  return response.json();
};

// Guard mobile-first operations
export const fetchGuardMetrics = async () => {
  const response = await authenticatedFetch(`${API_BASE_URL}/guard/metrics`);
  if (!response.ok) throw new Error('Failed to fetch guard metrics');
  return response.json();
};

export const fetchGuardShifts = async () => {
  const response = await authenticatedFetch(`${API_BASE_URL}/guard/shifts`);
  if (!response.ok) throw new Error('Failed to fetch guard shifts');
  return response.json();
};

export const checkinShiftPin = async (rosterId: string, mapPinId: string, description: string) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/guard/shifts/${rosterId}/checkin`, {
    method: 'POST',
    body: JSON.stringify({ mapPinId, description }),
  });
  if (!response.ok) throw new Error('Failed to check in');
  return response.json();
};

export const completeShift = async (rosterId: string, notes: string) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/guard/shifts/${rosterId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
  if (!response.ok) throw new Error('Failed to complete shift');
  return response.json();
};

export const reportGuardIncident = async (data: { mapPinId?: string, rosterId?: string, description: string }) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/guard/incidents`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to report incident');
  return response.json();
};

export const arriveAtShift = async (rosterId: string) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/guard/shifts/${rosterId}/arrive`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to mark arrival');
  }
  return response.json();
};
