export enum ReportType {
  ATTENDANCE = 'attendance',
  LEAVE = 'leave',
  PAYROLL = 'payroll',
  EMPLOYEE = 'employee',
  DEPARTMENT = 'department',
  CUSTOM = 'custom',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
}

export interface Report {
  id: number;
  name: string;
  description?: string;
  type: ReportType;
  category?: string;
  createdAt: string;
  createdBy?: number;
  parameters?: ReportParameter[];
}

export interface ReportParameter {
  name: string;
  label: string;
  type: 'date' | 'month' | 'year' | 'select' | 'multiselect' | 'text';
  required: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string;
}

export interface ReportFilter {
  fromDate?: string;
  toDate?: string;
  departmentId?: number;
  employeeId?: number;
  month?: number;
  year?: number;
  format?: ReportFormat;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'card' | 'chart' | 'table' | 'metric';
  size: 'small' | 'medium' | 'large';
  dataSource: string;
  refreshInterval?: number;
  config?: Record<string, any>;
}

export interface MetricData {
  label: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format?: 'number' | 'currency' | 'percentage';
}

export interface ChartData {
  labels: string[];
  datasets: { label: string; data: number[]; backgroundColor?: string[] }[];
}

export interface AttendanceSummaryReport {
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalOnLeave: number;
  attendancePercentage: number;
  departmentWise: { department: string; present: number; absent: number; percentage: number }[];
  dailyBreakdown: { date: string; present: number; absent: number }[];
}

export interface LeaveSummaryReport {
  totalApproved: number;
  totalPending: number;
  totalRejected: number;
  byType: { leaveType: string; count: number; days: number }[];
  byDepartment: { department: string; count: number }[];
  topApplicants: { employeeName: string; count: number }[];
}

export interface PayrollSummaryReport {
  totalPayroll: number;
  totalEarnings: number;
  totalDeductions: number;
  averageSalary: number;
  byDepartment: { department: string; total: number; employees: number }[];
  salaryDistribution: { range: string; count: number }[];
}

export interface EmployeeReport {
  totalEmployees: number;
  activeEmployees: number;
  newJoinings: number;
  resignations: number;
  byDepartment: { department: string; count: number }[];
  byDesignation: { designation: string; count: number }[];
  byAgeGroup: { range: string; count: number }[];
  byGender: { gender: string; count: number }[];
}

export function getReportTypeLabel(type: ReportType): string {
  const labels: Record<ReportType, string> = {
    [ReportType.ATTENDANCE]: 'Attendance Report',
    [ReportType.LEAVE]: 'Leave Report',
    [ReportType.PAYROLL]: 'Payroll Report',
    [ReportType.EMPLOYEE]: 'Employee Report',
    [ReportType.DEPARTMENT]: 'Department Report',
    [ReportType.CUSTOM]: 'Custom Report',
  };
  return labels[type] || type;
}
