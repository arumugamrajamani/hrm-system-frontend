export enum TimesheetStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REVISION_REQUESTED = 'revision_requested',
}

export interface TimesheetEntry {
  id: number;
  date: string;
  hours: number;
  projectId?: number;
  projectName?: string;
  taskDescription?: string;
  isBillable: boolean;
}

export interface Timesheet {
  id: number;
  employeeId: number;
  employeeName?: string;
  weekStartDate: string;
  status: TimesheetStatus;
  totalHours: number;
  entries: TimesheetEntry[];
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: number;
  approvedByName?: string;
}

export interface TimesheetFilter {
  employeeId?: number;
  weekStartDate?: string;
  status?: TimesheetStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export function getTimesheetStatusLabel(status: TimesheetStatus): string {
  const labels: Record<TimesheetStatus, string> = {
    [TimesheetStatus.DRAFT]: 'Draft',
    [TimesheetStatus.SUBMITTED]: 'Submitted',
    [TimesheetStatus.APPROVED]: 'Approved',
    [TimesheetStatus.REJECTED]: 'Rejected',
    [TimesheetStatus.REVISION_REQUESTED]: 'Revision Requested',
  };
  return labels[status] || status;
}
