export enum WorkflowEntityType {
  EMPLOYEE = 'employee',
  LEAVE = 'leave',
  TIMESHEET = 'timesheet',
  PAYROLL = 'payroll',
  ONBOARDING = 'onboarding',
  CONFIRMATION = 'confirmation',
  TRANSFER = 'transfer',
  PROMOTION = 'promotion',
}

export enum WorkflowStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum WorkflowAction {
  SUBMIT = 'submit',
  APPROVE = 'approve',
  REJECT = 'reject',
  CANCEL = 'cancel',
  RECALL = 'recall',
  ESCALATE = 'escalate',
}

export interface WorkflowStep {
  id: number;
  stepOrder: number;
  name: string;
  description?: string;
  approverType: 'role' | 'user' | 'manager' | 'hrbp';
  approverRoleId?: number;
  approverUserId?: number;
  status: WorkflowStatus;
  comments?: string;
  actionBy?: number;
  actionAt?: string;
  dueDate?: string;
}

export interface Workflow {
  id: number;
  entityType: WorkflowEntityType;
  entityId: number;
  entityName?: string;
  title: string;
  description?: string;
  initiatedBy: number;
  initiatedAt: string;
  currentStep: number;
  totalSteps: number;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  requestData?: Record<string, unknown>;
}

export interface WorkflowRequest {
  entityType: WorkflowEntityType;
  entityId: number;
  workflowTypeId: number;
  requestData?: Record<string, unknown>;
}

export interface WorkflowActionRequest {
  workflowId: number;
  stepId: number;
  action: WorkflowAction;
  comments?: string;
}

export interface WorkflowHistory {
  id: number;
  workflowId: number;
  stepName: string;
  action: WorkflowAction;
  performedBy: number;
  performedByName?: string;
  performedAt: string;
  comments?: string;
  previousValue?: string;
  newValue?: string;
}

export interface ApprovalPendingCount {
  pendingCount: number;
  byEntityType: Record<WorkflowEntityType, number>;
}

export function getWorkflowStatusLabel(status: WorkflowStatus): string {
  const labels: Record<WorkflowStatus, string> = {
    [WorkflowStatus.DRAFT]: 'Draft',
    [WorkflowStatus.IN_PROGRESS]: 'In Progress',
    [WorkflowStatus.PENDING]: 'Pending',
    [WorkflowStatus.APPROVED]: 'Approved',
    [WorkflowStatus.REJECTED]: 'Rejected',
    [WorkflowStatus.CANCELLED]: 'Cancelled',
    [WorkflowStatus.COMPLETED]: 'Completed',
  };
  return labels[status] || status;
}

export function getWorkflowEntityLabel(entityType: WorkflowEntityType): string {
  const labels: Record<WorkflowEntityType, string> = {
    [WorkflowEntityType.EMPLOYEE]: 'Employee',
    [WorkflowEntityType.LEAVE]: 'Leave Request',
    [WorkflowEntityType.TIMESHEET]: 'Timesheet',
    [WorkflowEntityType.PAYROLL]: 'Payroll',
    [WorkflowEntityType.ONBOARDING]: 'Onboarding',
    [WorkflowEntityType.CONFIRMATION]: 'Confirmation',
    [WorkflowEntityType.TRANSFER]: 'Transfer',
    [WorkflowEntityType.PROMOTION]: 'Promotion',
  };
  return labels[entityType] || entityType;
}
