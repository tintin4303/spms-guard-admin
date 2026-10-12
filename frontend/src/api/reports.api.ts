import { API_BASE_URL, authenticatedFetch } from './client';

export const fetchReportsOverview = async () => {
  const response = await authenticatedFetch(`${API_BASE_URL}/reports/overview`);
  if (!response.ok) throw new Error('Failed to fetch reports overview');
  return response.json();
};

export const fetchGuardPerformance = async (startDate?: string, endDate?: string, siteId?: string) => {
  const query = new URLSearchParams();
  if (startDate) query.append('startDate', startDate);
  if (endDate) query.append('endDate', endDate);
  if (siteId && siteId !== 'All Sites') query.append('siteId', siteId);
  const response = await authenticatedFetch(`${API_BASE_URL}/reports/guards?${query.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch guard reports');
  return response.json();
};
