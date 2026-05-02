export enum PayrollStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  PREVIEW = 'preview',
  APPROVED = 'approved',
  RELEASED = 'released',
  LOCKED = 'locked',
  PAID = 'paid',
}

export enum SalaryComponentType {
  EARNING = 'earning',
  DEDUCTION = 'deduction',
}

export interface PayrollRecord {
  id: number;
  payrollRunId: number;
  employeeId: number;
  employeeName?: string;
  departmentName?: string;
  designationName?: string;
  basicSalary: number;
  grossEarnings: number;
  totalDeductions: number;
  netPay: number;
  bankName?: string;
  accountNumber?: string;
  status: PayrollStatus;
}

export interface PayrollFilter {
  month?: number;
  year?: number;
  departmentId?: number;
  status?: PayrollStatus;
  employeeId?: number;
}

export function getPayrollStatusLabel(status: PayrollStatus | undefined): string {
  const labels: Record<string, string> = {
    [PayrollStatus.DRAFT]: 'Draft',
    [PayrollStatus.PROCESSING]: 'Processing',
    [PayrollStatus.PREVIEW]: 'Preview',
    [PayrollStatus.APPROVED]: 'Approved',
    [PayrollStatus.RELEASED]: 'Released',
    [PayrollStatus.LOCKED]: 'Locked',
    [PayrollStatus.PAID]: 'Paid',
  };
  return labels[status || ''] || 'Unknown';
}

export function getComponentTypeLabel(type: SalaryComponentType): string {
  return type === SalaryComponentType.EARNING ? 'Earning' : 'Deduction';
}

// Salary Components
export interface SalaryComponent {
  id: number;
  name: string;
  code: string;
  type: 'earning' | 'deduction' | 'reimbursement';
  category: 'basic' | 'allowance' | 'bonus' | 'statutory' | 'loan' | 'tax' | 'other';
  isTaxable: boolean;
  isStatutory: boolean;
  calculationType: 'fixed' | 'percentage' | 'formula';
  percentageOf?: string;
  formula?: string;
  isActive: boolean;
  displayOrder: number;
}

// Salary Structure
export interface SalaryStructure {
  id: number;
  name: string;
  gradeId?: number;
  gradeName?: string;
  departmentId?: number;
  departmentName?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  components: SalaryStructureComponent[];
  totalMonthly: number;
  totalAnnual: number;
  status: 'draft' | 'active' | 'archived';
}

export interface SalaryStructureComponent {
  id: number;
  structureId: number;
  componentId: number;
  componentName: string;
  componentType: 'earning' | 'deduction';
  amount: number;
  isPercentage: boolean;
  percentageValue?: number;
}

// Pay Cycle
export interface PayCycle {
  id: number;
  name: string;
  frequency: 'monthly' | 'bi_weekly' | 'weekly';
  payDay: number;
  cutoffDay: number;
  isActive: boolean;
  description?: string;
}

// Payroll Run
export interface PayrollRun {
  id: number;
  payCycleId: number;
  payCycleName?: string;
  period: {
    month: number;
    year: number;
    startDate: string;
    endDate: string;
  };
  month: number;
  year: number;
  status: PayrollStatus;
  totalEmployees: number;
  processedEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  totalEarnings: number;
  netPay: number;
  startedAt?: string;
  completedAt?: string;
  processedAt?: string;
  approvedBy?: number;
  approvedByName?: string;
  approvedAt?: string;
  releasedBy?: number;
  releasedByName?: string;
  releasedAt?: string;
}

export interface PayrollRunEmployee {
  id: number;
  payrollRunId: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  departmentName?: string;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  status: 'pending' | 'processed' | 'error';
  errorMessage?: string;
  earnings: { component: string; amount: number }[];
  deductionDetails: { component: string; amount: number }[];
}

export interface PayrollSettings {
  id: number;
  companyCurrency: string;
  financialYearStart: string;
  payrollCutoffDay: number;
  payDay: number;
  autoLockPayroll: boolean;
  lockDaysAfterRelease: number;
  makerCheckerEnabled: boolean;
}
