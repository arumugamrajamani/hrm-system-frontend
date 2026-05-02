export interface EmploymentType {
  id: number;
  name: string;
  code: string;
  description?: string;
  isPermanent: boolean;
  probationMonths?: number;
  noticePeriodDays?: number;
  maxContractDuration?: number;
  benefits?: string[];
  isActive: boolean;
  status: 'active' | 'inactive';
  employeeCount?: number;
}

export interface EmploymentTypeFilters {
  search?: string;
  status?: 'active' | 'inactive';
  isPermanent?: boolean;
}
