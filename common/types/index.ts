// Export all shared schemas and TypeScript configurations across backend and frontend here
export interface UserPayload {
  id: string;
  role: 'ADMIN' | 'OPERATION_MANAGER' | 'CLIENT' | 'AGENCY_MANAGER';
  email: string;
}

export interface ContractDetails {
  clientId: string;
  durationMonths: number;
  startDate: string;
  endDate: string;
}
