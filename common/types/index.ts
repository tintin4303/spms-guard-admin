// ==========================================
// 1. ENUMS & CONSTANTS
// ==========================================
export type UserRole = 'ADMIN' | 'OPERATION_MANAGER' | 'CLIENT' | 'AGENCY_MANAGER';
export type ShiftPattern = 'TWO_SHIFT_12HR' | 'THREE_SHIFT_8HR';
export type ShiftPreference = 'DAY' | 'NIGHT' | 'FLEXIBLE';
export type EmploymentType = 'IN_HOUSE' | 'AGENCY';
export type IncidentStatus = 'REPORTED' | 'UNDER_REVIEW' | 'RESOLVED';
export type PatrolStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';

// ==========================================
// 2. USER & AUTHENTICATION
// ==========================================
export interface UserPayload {
  id: string;
  role: UserRole;
  email: string;
  phone?: string;
  agencyId?: string;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

// ==========================================
// 3. GUARD MANAGEMENT
// ==========================================
export interface GuardProfile {
  id: string;
  systemGuardId: string; // Auto-generated ID (e.g., GRD-2026-001)
  userId?: string;
  agencyId?: string;
  firstName: string;
  lastName: string;
  certificateNumber: string;
  certificateExpiry: string;
  preferredShift: ShiftPreference;
  employmentType: EmploymentType;
  isActive: boolean;
}

// ==========================================
// 4. CONTRACTS & SITES
// ==========================================
export interface ContractDetails {
  id: string;
  contractCode: string;
  clientId: string;
  agencyId?: string; // Optional third-party guard agency
  clientCompanyName?: string;
  contactInfo: string;
  durationMonths: number;
  startDate: string;
  endDate: string;
  shiftPattern: ShiftPattern;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'TERMINATED';
}

export interface Site {
  id: string;
  contractId: string;
  siteName: string;
  address: string;
  perimeterGeoJson: {
    type: 'Polygon';
    coordinates: number[][][]; // Lat/Lng polygon points for geofencing
  };
}

// ==========================================
// 5. MAPS, CHECKPOINTS & ROUTES
// ==========================================
export interface Checkpoint {
  id: string;
  siteId: string;
  name: string; // e.g., "Main Entrance", "Back Door"
  latitude: number;
  longitude: number;
  qrPayloadUuid: string;
  nfcUid?: string;
}

export interface RouteNode {
  id: string;
  checkpointId: string;
  sequenceOrder: number;
}

export interface PatrolRoute {
  id: string;
  siteId: string;
  contractId: string;
  routeName: string;
  nodes: RouteNode[];
}

// ==========================================
// 6. SCHEDULING & ROSTER
// ==========================================
export interface ShiftAssignment {
  id: string;
  contractId: string;
  siteId: string;
  guardId: string;
  date: string;
  shiftType: 'DAY' | 'NIGHT';
  startTime: string;
  endTime: string;
}

// ==========================================
// 7. OPERATION LOGS & INCIDENTS
// ==========================================
export interface ScanLog {
  id: string;
  patrolExecutionId: string;
  checkpointId: string;
  guardId: string;
  scannedAt: string;
  isWithinGeofence: boolean;
}

export interface IncidentReport {
  id: string;
  siteId: string;
  guardId: string;
  title: string;
  description: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  status: IncidentStatus;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

// ==========================================
// 8. SYSTEM REPORTS & DTOs
// ==========================================
export interface GuardPerformanceReport {
  guardId: string;
  guardName: string;
  assignedShifts: number;
  completedShifts: number;
  attendancePercentage: number;
  incidentsReported: number;
}