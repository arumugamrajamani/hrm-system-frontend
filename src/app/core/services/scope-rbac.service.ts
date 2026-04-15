import { Injectable, inject } from '@angular/core';
import { RbacService } from './rbac.service';
import { Permission, Role } from '../models/rbac.models';

export interface DataScopeRule {
  resource: string;
  permissions: Permission[];

  // Scope conditions
  allowAll?: boolean;
  allowOwnOnly?: boolean;
  allowDepartmentOnly?: boolean;
  allowLocationOnly?: boolean;

  // Fields to filter on
  departmentField?: string;
  locationField?: string;
  createdByField?: string;
  ownerField?: string;
}

@Injectable({ providedIn: 'root' })
export class ScopeRbacService {
  private readonly rbacService = inject(RbacService);

  private scopeRules = new Map<string, DataScopeRule>();

  registerScopeRule(rule: DataScopeRule): void {
    this.scopeRules.set(rule.resource, rule);
  }

  unregisterScopeRule(resource: string): void {
    this.scopeRules.delete(resource);
  }

  canAccessResource(
    resource: string,
    permission: Permission,
    item?: Record<string, unknown>,
  ): boolean {
    // First check basic permission
    if (!this.rbacService.hasPermission(permission)) {
      return false;
    }

    // If no scope rule, allow access
    const rule = this.scopeRules.get(resource);
    if (!rule) {
      return true;
    }

    // If allow all, grant access
    if (rule.allowAll || this.rbacService.isSuperAdmin()) {
      return true;
    }

    // If no item provided, check if user can access resource at all
    if (!item) {
      return this.rbacService.hasPermission(permission);
    }

    // Check specific scope conditions
    if (rule.allowOwnOnly) {
      const currentUser = this.getCurrentUser();
      const createdByField = rule.createdByField || 'created_by';
      const ownerField = rule.ownerField || 'owner_id';

      const createdBy = item[createdByField];
      const ownerId = item[ownerField];

      if (
        currentUser?.id &&
        (String(createdBy) === String(currentUser.id) || String(ownerId) === String(currentUser.id))
      ) {
        return true;
      }

      // Admin can access all
      if (this.rbacService.isAdmin()) {
        return true;
      }

      return false;
    }

    if (rule.allowDepartmentOnly) {
      const currentUser = this.getCurrentUser();
      const deptField = rule.departmentField || 'department_id';
      const itemDeptId = item[deptField];

      if (currentUser?.departmentId && String(itemDeptId) === String(currentUser.departmentId)) {
        return true;
      }

      if (this.rbacService.isAdmin() || this.rbacService.isSuperAdmin()) {
        return true;
      }

      return false;
    }

    if (rule.allowLocationOnly) {
      const currentUser = this.getCurrentUser();
      const locField = rule.locationField || 'location_id';
      const itemLocId = item[locField];

      if (currentUser?.locationId && String(itemLocId) === String(currentUser.locationId)) {
        return true;
      }

      if (this.rbacService.isAdmin() || this.rbacService.isSuperAdmin()) {
        return true;
      }

      return false;
    }

    return true;
  }

  canAccessField(resource: string, field: string): boolean {
    const sensitiveFields: Record<string, string[]> = {
      employee: ['salary', 'bank_account_number', 'ifsc_code', 'pan_number', 'aadhar_number'],
      payroll: ['net_salary', 'gross_salary'],
    };

    const fields = sensitiveFields[resource];
    if (!fields) {
      return true;
    }

    if (fields.includes(field)) {
      return this.rbacService.hasPermission('manage');
    }

    return true;
  }

  filterByScope<T extends { id: number }>(
    resource: string,
    items: T[],
    permission: Permission,
  ): T[] {
    if (!this.rbacService.hasPermission(permission)) {
      return [];
    }

    const rule = this.scopeRules.get(resource);
    if (!rule || rule.allowAll || this.rbacService.isSuperAdmin() || this.rbacService.isAdmin()) {
      return items;
    }

    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return [];
    }

    return items.filter((item: any) => {
      if (rule.allowOwnOnly) {
        const createdByField = rule.createdByField || 'created_by';
        const ownerField = rule.ownerField || 'owner_id';
        return (
          String(item[createdByField]) === String(currentUser.id) ||
          String(item[ownerField]) === String(currentUser.id)
        );
      }

      if (rule.allowDepartmentOnly) {
        const deptField = rule.departmentField || 'department_id';
        return String(item[deptField]) === String(currentUser.departmentId);
      }

      if (rule.allowLocationOnly) {
        const locField = rule.locationField || 'location_id';
        return String(item[locField]) === String(currentUser.locationId);
      }

      return true;
    });
  }

  private getCurrentUser(): { id?: number; departmentId?: number; locationId?: number } | null {
    const authService = (this.rbacService as any).authService;
    if (!authService) return null;

    const user = authService.currentUser();
    if (!user) return null;

    return {
      id: user.id,
      departmentId: user.departmentId,
      locationId: user.locationId,
    };
  }
}
