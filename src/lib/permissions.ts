export const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  CLIENT: "CLIENT",
  AGENCY: "AGENCY",
} as const;

export type Role = keyof typeof ROLES;

// Hierarchical or specific feature permissions
export function canManageUsers(role?: string) {
  return role === ROLES.ADMIN;
}

export function canManageContracts(role?: string) {
  return role === ROLES.ADMIN;
}

export function canManageOperations(role?: string) {
  return role === ROLES.ADMIN || role === ROLES.MANAGER;
}
