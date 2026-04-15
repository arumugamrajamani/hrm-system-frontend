export enum PayrollStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  PAID = 'paid',
}

export enum SalaryComponentType {
  EARNING = 'earning',
  DEDUCTION = 'deduction',
}

export interface SalaryComponent {
  id: number;
  name: string;
  code: string;
  type: SalaryComponentType;
  isTaxable: boolean;
  isFixed: boolean;
  calculationType?: 'percentage' | 'fixed' | 'formula';
  calculationValue?: number;
  applicableFrom?: string;
  isActive: boolean;
}

export interface PayrollRun {
  id: number;
  month: number;
  year: number;
  status: PayrollStatus;
  totalEmployees: number;
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
  processedAt?: string;
  processedBy?: number;
  approvedAt?: string;
  approvedBy?: number;
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

export interface SalaryStructure {
  id: number;
  employeeId: number;
  effectiveFrom: string;
  effectiveTo?: string;
  basicSalary: number;
  components: SalaryStructureItem[];
}

export interface SalaryStructureItem {
  id: number;
  salaryStructureId: number;
  componentId: number;
  componentName?: string;
  componentType: SalaryComponentType;
  amount: number;
  isTaxable: boolean;
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
    [PayrollStatus.APPROVED]: 'Approved',
    [PayrollStatus.PAID]: 'Paid',
  };
  return labels[status || ''] || 'Unknown';
}

export function getComponentTypeLabel(type: SalaryComponentType): string {
  return type === SalaryComponentType.EARNING ? 'Earning' : 'Deduction';
}
