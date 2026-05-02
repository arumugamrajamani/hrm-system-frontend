export enum LeaveStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum LeaveType {
  CASUAL = 'casual',
  SICK = 'sick',
  PRIVILEGED = 'privileged',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  BEREAVEMENT = 'bereavement',
  UNPAID = 'unpaid',
  WORK_FROM_HOME = 'work_from_home',
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName?: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: LeaveStatus;
  approverId?: number;
  approverName?: string;
  approvedAt?: string;
  rejectedAt?: string;
  comments?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LeaveBalance {
  id: number;
  employeeId: number;
  employeeName?: string;
  leaveType: LeaveType;
  totalAllocated: number;
  totalAvailed: number;
  totalPending: number;
  available: number;
  carriedForward?: number;
  year: number;
  expiryDate?: string;
}

export interface LeavePolicy {
  id: number;
  name: string;
  code: string;
  leaveType: LeaveType;
  maxDaysPerYear: number;
  minDaysPerApplication: number;
  maxDaysPerApplication?: number;
  maxConsecutiveDays?: number;
  requiresApproval: boolean;
  requiresDocument?: boolean;
  canCarryForward?: number;
  isActive: boolean;
  applicableFrom?: string;
  description?: string;
}

export interface LeavePolicyFilter {
  leaveType?: LeaveType;
  isActive?: boolean;
  search?: string;
}

export interface LeaveFilter {
  employeeId?: number;
  leaveType?: LeaveType;
  status?: LeaveStatus;
  fromDate?: string;
  toDate?: string;
  approverId?: number;
  search?: string;
}

export function getLeaveStatusLabel(status: LeaveStatus): string {
  const labels: Record<LeaveStatus, string> = {
    [LeaveStatus.DRAFT]: 'Draft',
    [LeaveStatus.PENDING]: 'Pending',
    [LeaveStatus.APPROVED]: 'Approved',
    [LeaveStatus.REJECTED]: 'Rejected',
    [LeaveStatus.CANCELLED]: 'Cancelled',
    [LeaveStatus.EXPIRED]: 'Expired',
  };
  return labels[status] || status;
}

export function getLeaveTypeLabel(type: LeaveType): string {
  const labels: Record<LeaveType, string> = {
    [LeaveType.CASUAL]: 'Casual Leave',
    [LeaveType.SICK]: 'Sick Leave',
    [LeaveType.PRIVILEGED]: 'Privileged Leave',
    [LeaveType.MATERNITY]: 'Maternity Leave',
    [LeaveType.PATERNITY]: 'Paternity Leave',
    [LeaveType.BEREAVEMENT]: 'Bereavement Leave',
    [LeaveType.UNPAID]: 'Unpaid Leave',
    [LeaveType.WORK_FROM_HOME]: 'Work From Home',
  };
  return labels[type] || type;
}

export function getLeaveBalancePercentage(balance: LeaveBalance): number {
  if (balance.totalAllocated === 0) return 0;
  return Math.round((balance.available / balance.totalAllocated) * 100);
}

// Accrual and Carry Forward
export interface LeaveAccrualRule {
  id: number;
  leaveTypeId: number;
  leaveTypeName?: string;
  accrualFrequency: 'monthly' | 'quarterly' | 'annually';
  accrualAmount: number;
  maxAccrualPerPeriod?: number;
  maxAccrualCarryForward?: number;
  accrualStartDate?: string;
  isActive: boolean;
}

export interface LeaveAccrual {
  id: number;
  employeeId: number;
  employeeName?: string;
  leaveTypeId: number;
  leaveTypeName?: string;
  accrualDate: string;
  accruedDays: number;
  adjustmentDays?: number;
  netAccrued: number;
  carriedForward?: number;
  encashed?: number;
  encashmentAmount?: number;
  period: {
    from: string;
    to: string;
  };
}

// Leave Encashment
export interface LeaveEncashment {
  id: number;
  employeeId: number;
  employeeName?: string;
  leaveTypeId: number;
  leaveTypeName?: string;
  encashedDays: number;
  ratePerDay: number;
  totalAmount: number;
  requestedDate: string;
  processedDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  approvedBy?: number;
  approvedByName?: string;
  remarks?: string;
  payrollMonth?: string;
}

// Leave Approval Matrix
export interface LeaveApprovalRule {
  id: number;
  leaveTypeId?: number;
  departmentId?: number;
  locationId?: number;
  minDaysRequired: number;
  maxDaysRequired?: number;
  approverLevel: number;
  approverRole: 'manager' | 'hr' | 'department_head' | 'custom';
  approverUserId?: number;
  approverUserName?: string;
  isActive: boolean;
}

// Delegation/Acting Approver
export interface ApproverDelegation {
  id: number;
  delegatorId: number;
  delegatorName?: string;
  delegateeId: number;
  delegateeName?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  scope: 'all' | 'leave' | 'timesheet' | 'general';
  remarks?: string;
}

export interface LeaveTypeWithAccrual {
  leaveType: LeaveType;
  accrualRules?: LeaveAccrualRule[];
  allowEncashment: boolean;
  encashmentMaxDays?: number;
  encashmentRatePerDay?: number;
}

export interface LeaveBalanceWithAccrual extends LeaveBalance {
  accruedThisPeriod: number;
  carriedForward: number;
  encashed: number;
  encashmentAmount: number;
  projectedBalance: number;
}
