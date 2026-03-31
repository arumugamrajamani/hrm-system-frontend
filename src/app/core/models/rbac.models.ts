export enum Role {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

export enum Permission {
  READ = 'read',
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
}

export type PermissionAction = Permission | 'manage';

export const MANAGE_PERMISSION = 'manage' as const;

export const ROLE_LABELS: Record<Role, string> = {
  [Role.SUPERADMIN]: 'Super Admin',
  [Role.ADMIN]: 'Admin',
  [Role.MANAGER]: 'Manager',
  [Role.USER]: 'User',
};

export const ROLE_ID_MAPPING: Record<number, Role> = {
  1: Role.SUPERADMIN,
  2: Role.ADMIN,
  3: Role.MANAGER,
  4: Role.USER,
};

export interface RolePermissionConfig {
  role: Role;
  permissions: PermissionAction[];
}

export const ROLE_PERMISSION_MAPPING: RolePermissionConfig[] = [
  {
    role: Role.SUPERADMIN,
    permissions: [
      Permission.READ,
      Permission.CREATE,
      Permission.EDIT,
      Permission.DELETE,
      'manage' as PermissionAction,
    ],
  },
  {
    role: Role.ADMIN,
    permissions: [Permission.READ, Permission.CREATE, Permission.EDIT, Permission.DELETE],
  },
  { role: Role.MANAGER, permissions: [Permission.READ, Permission.CREATE, Permission.EDIT] },
  { role: Role.USER, permissions: [Permission.READ] },
];

export interface RouteRoleConfig {
  roles?: Role[];
  permissions?: PermissionAction[];
}

export interface MenuItemConfig {
  label: string;
  icon: string;
  route?: string;
  permissions?: PermissionAction[];
  roles?: Role[];
  children?: MenuItemConfig[];
}

export const DEFAULT_PERMISSION_MAPPING: Record<Role, (Permission | PermissionAction)[]> = {
  [Role.SUPERADMIN]: [
    Permission.READ,
    Permission.CREATE,
    Permission.EDIT,
    Permission.DELETE,
    MANAGE_PERMISSION,
  ],
  [Role.ADMIN]: [Permission.READ, Permission.CREATE, Permission.EDIT, Permission.DELETE],
  [Role.MANAGER]: [Permission.READ, Permission.CREATE, Permission.EDIT],
  [Role.USER]: [Permission.READ],
};

export interface FeatureFlag {
  key: string;
  name: string;
  description?: string;
  roles?: Role[];
  permissions?: PermissionAction[];
  enabled: boolean;
}

export interface FeatureFlagConfig {
  flags: FeatureFlag[];
}

export function normalizeRole(
  role: string | Role | null | undefined,
  roleId?: number | null,
): Role {
  if (roleId && ROLE_ID_MAPPING[roleId]) {
    return ROLE_ID_MAPPING[roleId];
  }

  if (!role) {
    return Role.USER;
  }

  const normalized = String(role).trim().toLowerCase().replace(/\s+/g, '');

  if (normalized === Role.SUPERADMIN || normalized === 'superadmin') {
    return Role.SUPERADMIN;
  }

  if (normalized === Role.ADMIN) {
    return Role.ADMIN;
  }

  if (normalized === Role.MANAGER) {
    return Role.MANAGER;
  }

  return Role.USER;
}

export function getRoleLabel(role: Role): string {
  return ROLE_LABELS[role] ?? ROLE_LABELS[Role.USER];
}
