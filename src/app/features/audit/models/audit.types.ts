export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  SUBMIT = 'submit',
  CANCEL = 'cancel',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  IMPORT = 'import',
}

export enum AuditEntityType {
  USER = 'user',
  EMPLOYEE = 'employee',
  DEPARTMENT = 'department',
  DESIGNATION = 'designation',
  LEAVE = 'leave',
  TIMESHEET = 'timesheet',
  PAYROLL = 'payroll',
  DOCUMENT = 'document',
  ROLE = 'role',
  PERMISSION = 'permission',
  SETTINGS = 'settings',
}

export interface AuditLog {
  id: number;
  entityType: AuditEntityType;
  entityId: number;
  entityName?: string;
  action: AuditAction;
  performedBy: number;
  performedByName?: string;
  performedAt: string;
  ipAddress?: string;
  userAgent?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  changes?: AuditFieldChange[];
  description?: string;
}

export interface AuditFieldChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface AuditLogFilter {
  entityType?: AuditEntityType;
  entityId?: number;
  action?: AuditAction;
  performedBy?: number;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

export interface AuditSummary {
  totalChanges: number;
  todayChanges: number;
  byAction: Record<AuditAction, number>;
  byEntityType: Record<AuditEntityType, number>;
  topUsers: { userId: number; userName: string; count: number }[];
}

export function getAuditActionLabel(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    [AuditAction.CREATE]: 'Created',
    [AuditAction.READ]: 'Viewed',
    [AuditAction.UPDATE]: 'Updated',
    [AuditAction.DELETE]: 'Deleted',
    [AuditAction.APPROVE]: 'Approved',
    [AuditAction.REJECT]: 'Rejected',
    [AuditAction.SUBMIT]: 'Submitted',
    [AuditAction.CANCEL]: 'Cancelled',
    [AuditAction.LOGIN]: 'Logged In',
    [AuditAction.LOGOUT]: 'Logged Out',
    [AuditAction.EXPORT]: 'Exported',
    [AuditAction.IMPORT]: 'Imported',
  };
  return labels[action] || action;
}

export function getAuditEntityLabel(entityType: AuditEntityType): string {
  const labels: Record<AuditEntityType, string> = {
    [AuditEntityType.USER]: 'User',
    [AuditEntityType.EMPLOYEE]: 'Employee',
    [AuditEntityType.DEPARTMENT]: 'Department',
    [AuditEntityType.DESIGNATION]: 'Designation',
    [AuditEntityType.LEAVE]: 'Leave',
    [AuditEntityType.TIMESHEET]: 'Timesheet',
    [AuditEntityType.PAYROLL]: 'Payroll',
    [AuditEntityType.DOCUMENT]: 'Document',
    [AuditEntityType.ROLE]: 'Role',
    [AuditEntityType.PERMISSION]: 'Permission',
    [AuditEntityType.SETTINGS]: 'Settings',
  };
  return labels[entityType] || entityType;
}

export function formatAuditChange(change: AuditFieldChange): string {
  const oldVal = change.oldValue ?? '(empty)';
  const newVal = change.newValue ?? '(empty)';
  return `${change.field}: ${oldVal} → ${newVal}`;
}
