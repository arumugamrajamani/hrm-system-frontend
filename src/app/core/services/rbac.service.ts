import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';
import {
  Role,
  Permission,
  PermissionAction,
  DEFAULT_PERMISSION_MAPPING,
  MenuItemConfig,
  MANAGE_PERMISSION,
  normalizeRole,
} from '../models/rbac.models';

export interface ResourcePermissionConfig {
  resource: string;
  actions: PermissionAction[];
  ownerField?: string;
}

export interface PermissionContext {
  resourceId?: string | number;
  ownerId?: string | number;
  createdBy?: string | number;
}

@Injectable({
  providedIn: 'root',
})
export class RbacService {
  private readonly authService = inject(AuthService);
  private readonly rolePermissionsMap = DEFAULT_PERMISSION_MAPPING;
  private resourcePermissions = new Map<string, ResourcePermissionConfig>();

  readonly currentRole = computed(() => {
    const role = this.authService.userRole();
    const currentUser = this.authService.currentUser();
    return normalizeRole(role, currentUser?.role_id);
  });

  readonly currentPermissions = computed(() => {
    const userPermissions = this.authService.permissions();
    const role = this.currentRole();
    const rolePermissions = this.rolePermissionsMap[role] || [];

    if (!userPermissions || userPermissions.length === 0) {
      return rolePermissions;
    }

    if (userPermissions.includes('all')) {
      return Array.from(new Set([...rolePermissions, MANAGE_PERMISSION]));
    }

    if (userPermissions.includes('read') && userPermissions.length === 1) {
      return rolePermissions;
    }

    const validPermissions = userPermissions.filter(
      (p) => Object.values(Permission).includes(p as Permission) || p === MANAGE_PERMISSION,
    );

    if (validPermissions.length === 0) {
      return rolePermissions;
    }

    return Array.from(new Set([...rolePermissions, ...(validPermissions as PermissionAction[])]));
  });

  readonly isSuperAdmin = computed(() => this.currentRole() === Role.SUPERADMIN);
  readonly isAdmin = computed(() => this.currentRole() === Role.ADMIN);
  readonly isManager = computed(() => this.currentRole() === Role.MANAGER);
  readonly isUser = computed(() => this.currentRole() === Role.USER);

  hasPermission(permission: PermissionAction): boolean {
    const permissions = this.currentPermissions();
    return permissions.includes(permission);
  }

  hasAnyPermission(permissions: PermissionAction[]): boolean {
    const userPermissions = this.currentPermissions();
    return permissions.some((p) => userPermissions.includes(p));
  }

  hasAllPermissions(permissions: PermissionAction[]): boolean {
    const userPermissions = this.currentPermissions();
    return permissions.every((p) => userPermissions.includes(p));
  }

  hasRole(roles: Role | Role[]): boolean {
    const currentRole = this.currentRole();
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(currentRole);
  }

  hasAnyRole(roles: Role | Role[]): boolean {
    return this.hasRole(roles);
  }

  canRead(): boolean {
    return this.hasPermission(Permission.READ);
  }

  canCreate(): boolean {
    return this.hasPermission(Permission.CREATE);
  }

  canEdit(): boolean {
    return this.hasPermission(Permission.EDIT);
  }

  canDelete(): boolean {
    return this.hasPermission(Permission.DELETE);
  }

  canManage(): boolean {
    return this.hasPermission(MANAGE_PERMISSION);
  }

  filterMenuByPermission(items: MenuItemConfig[]): MenuItemConfig[] {
    const result: MenuItemConfig[] = [];

    for (const item of items) {
      const hasAccess = this.checkMenuAccess(item);
      if (!hasAccess) continue;

      const filteredChildren = item.children
        ? this.filterMenuByPermission(item.children)
        : undefined;

      if (filteredChildren?.length || item.route) {
        result.push({
          ...item,
          children: filteredChildren?.length ? filteredChildren : undefined,
        });
      }
    }

    return result;
  }

  private checkMenuAccess(item: MenuItemConfig): boolean {
    if (!item.permissions?.length && !item.roles?.length) {
      return true;
    }

    const hasRoleAccess = !item.roles?.length || this.hasAnyRole(item.roles);
    const hasPermissionAccess =
      !item.permissions?.length || this.hasAnyPermission(item.permissions);

    return hasRoleAccess && hasPermissionAccess;
  }

  hasAnyAccess(config: { roles?: Role[]; permissions?: PermissionAction[] }): boolean {
    if (config.roles?.length && !this.hasAnyRole(config.roles)) {
      return false;
    }

    if (config.permissions?.length && !this.hasAnyPermission(config.permissions)) {
      return false;
    }

    return true;
  }

  getPermissionLabel(permission: PermissionAction): string {
    const labels: Record<PermissionAction, string> = {
      [Permission.READ]: 'View',
      [Permission.CREATE]: 'Create',
      [Permission.EDIT]: 'Edit',
      [Permission.DELETE]: 'Delete',
      [MANAGE_PERMISSION]: 'Manage',
    };
    return labels[permission] || permission;
  }

  registerResourcePermission(config: ResourcePermissionConfig): void {
    this.resourcePermissions.set(config.resource, config);
  }

  unregisterResourcePermission(resource: string): void {
    this.resourcePermissions.delete(resource);
  }

  canAccessResource(
    resource: string,
    action: PermissionAction,
    context?: PermissionContext,
  ): boolean {
    const resourceConfig = this.resourcePermissions.get(resource);
    if (!resourceConfig) {
      return this.hasPermission(action);
    }

    if (!this.hasPermission(action)) {
      return false;
    }

    if (action === Permission.READ) {
      return true;
    }

    const isSuperAdmin = this.isSuperAdmin();
    if (isSuperAdmin) {
      return true;
    }

    if (context?.ownerId && context?.createdBy) {
      const isOwner = context.ownerId === context.createdBy;
      if (isOwner) {
        return true;
      }
    }

    if (resourceConfig.actions.includes('manage')) {
      return this.hasPermission(MANAGE_PERMISSION);
    }

    return this.hasPermission(action);
  }

  filterResourcesByPermission<T extends { id: number | string }>(
    resources: T[],
    resource: string,
    action: PermissionAction,
    idField: keyof T = 'id' as keyof T,
  ): T[] {
    if (!this.hasPermission(action)) {
      return [];
    }

    if (this.isSuperAdmin() || this.isAdmin()) {
      return resources;
    }

    return resources;
  }

  canEditItem<T extends { created_by?: string | number; user_id?: string | number }>(
    item: T,
    currentUserId?: string | number,
  ): boolean {
    if (!this.hasPermission(Permission.EDIT)) {
      return false;
    }

    if (this.isSuperAdmin() || this.isAdmin()) {
      return true;
    }

    const itemCreator = item.created_by || item.user_id;
    if (itemCreator && currentUserId && String(itemCreator) === String(currentUserId)) {
      return true;
    }

    return false;
  }

  canDeleteItem<T extends { created_by?: string | number }>(
    item: T,
    currentUserId?: string | number,
  ): boolean {
    if (!this.hasPermission(Permission.DELETE)) {
      return false;
    }

    if (this.isSuperAdmin()) {
      return true;
    }

    const itemCreator = item.created_by;
    if (itemCreator && currentUserId && String(itemCreator) === String(currentUserId)) {
      return true;
    }

    return false;
  }
}
