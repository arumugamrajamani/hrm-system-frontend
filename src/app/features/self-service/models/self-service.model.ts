export interface ESSDashboard {
  employee: {
    id: number;
    name: string;
    designation: string;
    department: string;
    joiningDate: string;
    profilePhoto?: string;
  };
  quickStats: {
    leaveBalance: number;
    pendingApprovals: number;
    timesheetStatus: string;
    nextPayrollDate?: string;
  };
  recentActivities: Activity[];
}

export interface Activity {
  id: number;
  type: 'leave' | 'timesheet' | 'payroll' | 'announcement' | 'task';
  title: string;
  description: string;
  date: string;
  status?: string;
  icon?: string;
}

export interface ESSProfileUpdate {
  field: string;
  currentValue: string;
  requestedValue: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approvedAt?: string;
  remarks?: string;
}

export interface ESSQuickAction {
  id: string;
  label: string;
  icon: string;
  route: string;
  color: string;
  description: string;
}
