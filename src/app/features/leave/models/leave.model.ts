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
