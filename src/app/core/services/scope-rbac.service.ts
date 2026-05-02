import { Injectable, inject } from '@angular/core';
import { RbacService } from './rbac.service';
import { Permission, Role } from '../models/rbac.models';

export enum DataScopeType {
  ALL = 'all',
  COMPANY = 'company',
  LOCATION = 'location',
  DEPARTMENT = 'department',
  TEAM = 'team',
  SELF = 'self',
  CUSTOM = 'custom',
}

export interface DataScopeRule {
  resource: string;
  scopeType: DataScopeType;
  permissions: Permission[];

  // Scope conditions
  allowAll?: boolean;
  allowOwnOnly?: boolean;
  allowDepartmentOnly?: boolean;
  allowLocationOnly?: boolean;
  allowCompanyOnly?: boolean;

  // Field mappings
  departmentField?: string;
  locationField?: string;
  companyField?: string;
  createdByField?: string;
  ownerField?: string;
  managerField?: string;
  reportingManagerField?: string;

  // Custom scope for assigned entities
  allowedCompanyIds?: number[];
  allowedLocationIds?: number[];
  allowedDepartmentIds?: number[];
  allowedTeamIds?: number[];
}

@Injectable({ providedIn: 'root' })
export class ScopeRbacService {
  private readonly rbacService = inject(RbacService);

  private scopeRules = new Map<string, DataScopeRule>();

  private sensitiveFields: Record<string, string[]> = {
    employee: [
      'salary',
      'bank_account_number',
      'ifsc_code',
      'pan_number',
      'aadhar_number',
      'tax_id',
      'pf_number',
      'esi_number',
    ],
    payroll: [
      'net_salary',
      'gross_salary',
      'basic_salary',
      'hra',
      'special_allowance',
      'deductions',
      'tax_amount',
    ],
    company: ['registration_number', 'tax_id', 'gstin', 'pan', 'cin'],
  };

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
    const fields = this.sensitiveFields[resource];
    if (!fields) {
      return true;
    }

    if (fields.includes(field)) {
      return this.rbacService.hasPermission(Permission.MANAGE);
    }

    return true;
  }

  getFieldVisibility(resource: string, field: string): boolean {
    return this.canAccessField(resource, field);
  }

  buildScopeParams(resource: string): Record<string, any> {
    const rule = this.scopeRules.get(resource);
    if (!rule || rule.allowAll || this.rbacService.isSuperAdmin()) {
      return {};
    }

    const params: Record<string, any> = {};
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return params;
    }

    switch (rule.scopeType) {
      case DataScopeType.SELF:
        params['created_by'] = currentUser.id;
        break;
      case DataScopeType.DEPARTMENT:
        if (currentUser.departmentId) {
          params['department_id'] = currentUser.departmentId;
        }
        break;
      case DataScopeType.LOCATION:
        if (currentUser.locationId) {
          params['location_id'] = currentUser.locationId;
        }
        break;
      case DataScopeType.COMPANY:
        if (rule.companyField && currentUser.companyId) {
          params[rule.companyField] = currentUser.companyId;
        }
        break;
      case DataScopeType.CUSTOM:
        if (rule.allowedCompanyIds?.length) {
          params['company_ids'] = rule.allowedCompanyIds;
        }
        if (rule.allowedLocationIds?.length) {
          params['location_ids'] = rule.allowedLocationIds;
        }
        if (rule.allowedDepartmentIds?.length) {
          params['department_ids'] = rule.allowedDepartmentIds;
        }
        if (rule.allowedTeamIds?.length) {
          params['team_ids'] = rule.allowedTeamIds;
        }
        break;
    }

    return params;
  }

  canAccessCompany(companyId: number): boolean {
    if (this.rbacService.isSuperAdmin()) {
      return true;
    }

    const rule = this.findRuleByField('companyField');
    if (!rule) {
      return true;
    }

    if (rule.allowAll) {
      return true;
    }

    if (rule.allowedCompanyIds?.length) {
      return rule.allowedCompanyIds.includes(companyId);
    }

    const currentUser = this.getCurrentUser();
    if (currentUser?.companyId) {
      return currentUser.companyId === companyId;
    }

    return false;
  }

  canAccessLocation(locationId: number): boolean {
    if (this.rbacService.isSuperAdmin()) {
      return true;
    }

    const rule = this.findRuleByField('locationField');
    if (!rule) {
      return true;
    }

    if (rule.allowAll) {
      return true;
    }

    if (rule.allowedLocationIds?.length) {
      return rule.allowedLocationIds.includes(locationId);
    }

    const currentUser = this.getCurrentUser();
    if (currentUser?.locationId) {
      return currentUser.locationId === locationId;
    }

    return false;
  }

  canAccessDepartment(departmentId: number): boolean {
    if (this.rbacService.isSuperAdmin()) {
      return true;
    }

    const rule = this.findRuleByField('departmentField');
    if (!rule) {
      return true;
    }

    if (rule.allowAll) {
      return true;
    }

    if (rule.allowedDepartmentIds?.length) {
      return rule.allowedDepartmentIds.includes(departmentId);
    }

    const currentUser = this.getCurrentUser();
    if (currentUser?.departmentId) {
      return currentUser.departmentId === departmentId;
    }

    return false;
  }

  isDirectReport(employeeId: number, managerId: number): boolean {
    const rule = this.findRuleByField('reportingManagerField');
    if (!rule && !this.rbacService.isAdmin()) {
      return false;
    }

    const currentUser = this.getCurrentUser();
    return currentUser?.id === managerId && employeeId !== managerId;
  }

  getVisibleEmployeeIds(): number[] | null {
    if (this.rbacService.isSuperAdmin() || this.rbacService.isAdmin()) {
      return null;
    }

    const rules = Array.from(this.scopeRules.values());
    const employeeRule = rules.find((r) => r.resource === 'employee');

    if (!employeeRule) {
      return null;
    }

    if (employeeRule.allowAll) {
      return null;
    }

    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return [];
    }

    if (employeeRule.scopeType === DataScopeType.SELF) {
      return [currentUser.id!];
    }

    return null;
  }

  maskSensitiveFields(data: any, resource: string): any {
    if (!data) {
      return data;
    }

    const fields = this.sensitiveFields[resource];
    if (!fields || this.rbacService.hasPermission(Permission.MANAGE)) {
      return data;
    }

    const masked = Array.isArray(data)
      ? data.map((item) => this.maskSensitiveFields(item, resource))
      : { ...data };

    const fieldsToMask = Array.isArray(data) ? fields : fields;

    if (Array.isArray(masked)) {
      return masked;
    }

    for (const field of fields) {
      if (field in masked) {
        masked[field] = '*****';
      }
    }

    return masked;
  }

  private findRuleByField(fieldName: string): DataScopeRule | undefined {
    return Array.from(this.scopeRules.values()).find(
      (rule) => rule[fieldName as keyof DataScopeRule],
    );
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

  private getCurrentUser(): {
    id?: number;
    departmentId?: number;
    locationId?: number;
    companyId?: number;
  } | null {
    const authService = (this.rbacService as any).authService;
    if (!authService) return null;

    const user = authService.currentUser();
    if (!user) return null;

    return {
      id: user.id,
      departmentId: user.departmentId,
      locationId: user.locationId,
      companyId: user.companyId,
    };
  }
}
