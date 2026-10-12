import { API_BASE_URL, authenticatedFetch } from './client';

export const fetchSchedules = async (siteId?: string, startDate?: string, endDate?: string) => {
  let url = `${API_BASE_URL}/schedules?`;
  if (siteId) url += `siteId=${siteId}&`;
  if (startDate) url += `startDate=${startDate}&`;
  if (endDate) url += `endDate=${endDate}&`;
  const response = await authenticatedFetch(url.replace(/&$/, ''));
  if (!response.ok) throw new Error('Failed to fetch schedules');
  return response.json();
};

export const generateSchedules = async (params: { siteId?: string; startDate?: string; endDate?: string; targetYear?: number; targetMonth?: number }) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/schedules/generate`, {
    method: 'POST',
    body: JSON.stringify(params)
  });
  if (!response.ok) {
     const data = await response.json().catch(() => ({}));
     throw new Error(data.error || 'Failed to generate slots');
  }
  return response.json();
};

export const fetchAutoScheduleRecommendations = async (params: { siteId?: string; startDate?: string; endDate?: string }) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/schedules/auto-schedule-preview`, {
    method: 'POST',
    body: JSON.stringify(params)
  });
  if (!response.ok) {
     const data = await response.json().catch(() => ({}));
     throw new Error(data.error || 'Failed to fetch auto-schedule suggestions');
  }
  return response.json();
};

export const assignGuard = async (rosterId: string, guardId: string) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/schedules/assign/${rosterId}`, {
    method: 'PUT',
    body: JSON.stringify({ guardId })
  });
  if (!response.ok) {
     const data = await response.json().catch(() => ({}));
     throw new Error(data.error || 'Failed to assign shift');
  }
  return response.json();
};

export const batchAssignGuard = async (data: { siteId: string; startDate: string; endDate: string; guardId: string; startTime?: string; endTime?: string }) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/schedules/assign-batch`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  if (!response.ok) {
     const errData = await response.json().catch(() => ({}));
     throw new Error(errData.error || 'Failed to batch assign guard');
  }
  return response.json();
};

export const createRoster = async (data: any) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/schedules/roster`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create permanent post');
  return response.json();
};

export const deleteRoster = async (id: string) => {
  const res = await authenticatedFetch(`${API_BASE_URL}/schedules/roster/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete permanent post');
  return res.json();
};

export const createException = async (data: any) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/schedules/exception`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to log emergency swap');
  return response.json();
};

export const logAbsence = async (rosterId: string, reason?: string, date?: string) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/schedules/log-absence`, {
    method: 'POST',
    body: JSON.stringify({ rosterId, reason, date }),
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to log absence');
  }
  return response.json();
};

export const fetchReplacementSuggestions = async (rosterId: string) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/schedules/replacement-suggestions/${rosterId}`);
  if (!response.ok) throw new Error('Failed to fetch replacement suggestions');
  return response.json();
};
