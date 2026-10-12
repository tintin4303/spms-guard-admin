import { API_BASE_URL, authenticatedFetch } from './client';

export const fetchLogs = async () => {
  const response = await authenticatedFetch(`${API_BASE_URL}/logs`);
  if (!response.ok) throw new Error('Failed to fetch logs');
  return response.json();
};

export const fetchAttendanceLogs = async () => {
  const response = await authenticatedFetch(`${API_BASE_URL}/logs/attendance`);
  if (!response.ok) throw new Error('Failed to fetch attendance logs');
  return response.json();
};

export const resolveIncident = async (logId: string, resolutionNote: string) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/logs/${logId}/resolve`, {
    method: 'PUT',
    body: JSON.stringify({ resolutionNote }),
  });
  if (!response.ok) throw new Error('Failed to resolve incident');
  return response.json();
};
