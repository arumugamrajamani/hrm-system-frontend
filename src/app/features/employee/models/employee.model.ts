import { Role, Permission } from '../../../core/models/rbac.models';

export enum EmploymentStatus {
  DRAFT = 'draft',
  PROBATION = 'probation',
  CONFIRMED = 'confirmed',
  RESIGNED = 'resigned',
  TERMINATED = 'terminated',
  RETIRED = 'retired',
}

export enum EmploymentType {
  PERMANENT = 'permanent',
  CONTRACT = 'contract',
  TEMPORARY = 'temporary',
  INTERNSHIP = 'internship',
  PART_TIME = 'part_time',
}

export interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone?: string;
  profilePhoto?: string;

  // Official Info
  departmentId?: number;
  departmentName?: string;
  designationId?: number;
  designationName?: string;
  locationId?: number;
  locationName?: string;
  employmentType?: EmploymentType;
  employmentStatus?: EmploymentStatus;

  // Reporting
  reportingManagerId?: number;
  reportingManagerName?: string;

  // Dates
  dateOfBirth?: string;
  dateOfJoining?: string;
  confirmationDate?: string;

  // Salary (sensitive - should be masked for most users)
  salary?: number;

  // Status
  isActive: boolean;
  status: 'active' | 'inactive';

  // System
  createdBy?: number;
  createdAt?: string;
  updatedBy?: number;
  updatedAt?: string;
}

export interface EmployeeFilters {
  search?: string;
  departmentId?: number;
  designationId?: number;
  locationId?: number;
  employmentType?: EmploymentType;
  employmentStatus?: EmploymentStatus;
  reportingManagerId?: number;
  isActive?: boolean;
  status?: 'active' | 'inactive';
}

export interface EmployeeProfile extends Employee {
  emergencyContacts?: EmergencyContact[];
  dependents?: Dependent[];
  documents?: EmployeeDocument[];
  bankDetails?: BankDetails;
  taxDetails?: TaxDetails;
}

export interface EmergencyContact {
  id: number;
  employeeId: number;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
}

export interface Dependent {
  id: number;
  employeeId: number;
  name: string;
  relationship: string;
  dateOfBirth?: string;
  isNominee: boolean;
}

export interface EmployeeDocument {
  id: number;
  employeeId: number;
  documentType: string;
  documentName: string;
  fileName: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  expiryDate?: string;
  isVerified: boolean;
  uploadedAt?: string;
}

export interface BankDetails {
  id: number;
  employeeId: number;
  bankName: string;
  branchName?: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  isPrimary: boolean;
}

export interface TaxDetails {
  id: number;
  employeeId: number;
  panNumber?: string;
  aadharNumber?: string;
  uanNumber?: string;
}

export interface EmployeeListItem {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  phone?: string;
  departmentName?: string;
  designationName?: string;
  locationName?: string;
  employmentStatus?: EmploymentStatus;
  reportingManagerName?: string;
  profilePhoto?: string;
  status: 'active' | 'inactive';
}

export function getEmploymentStatusLabel(status: EmploymentStatus): string {
  const labels: Record<EmploymentStatus, string> = {
    [EmploymentStatus.DRAFT]: 'Draft',
    [EmploymentStatus.PROBATION]: 'On Probation',
    [EmploymentStatus.CONFIRMED]: 'Confirmed',
    [EmploymentStatus.RESIGNED]: 'Resigned',
    [EmploymentStatus.TERMINATED]: 'Terminated',
    [EmploymentStatus.RETIRED]: 'Retired',
  };
  return labels[status] || status;
}

export function getEmploymentTypeLabel(type: EmploymentType): string {
  const labels: Record<EmploymentType, string> = {
    [EmploymentType.PERMANENT]: 'Permanent',
    [EmploymentType.CONTRACT]: 'Contract',
    [EmploymentType.TEMPORARY]: 'Temporary',
    [EmploymentType.INTERNSHIP]: 'Internship',
    [EmploymentType.PART_TIME]: 'Part Time',
  };
  return labels[type] || type;
}

// Compensation and Salary History
export interface CompensationStructure {
  id: number;
  employeeId: number;
  effectiveFrom: string;
  effectiveTo?: string;
  currency: string;
  components: SalaryComponent[];
  totalAnnualCTC: number;
  totalMonthlyGross: number;
  status: 'active' | 'draft' | 'archived';
}

export interface SalaryComponent {
  id: number;
  structureId: number;
  componentType: 'earning' | 'deduction' | 'reimbursement';
  componentName: string;
  componentCode: string;
  amount: number;
  isPercentageBased: boolean;
  percentageOf?: string;
  isTaxable: boolean;
  isStatutory: boolean;
}

export interface SalaryRevision {
  id: number;
  employeeId: number;
  revisionType: 'increment' | 'decrement' | 'promotion' | 'transfer' | 'correction';
  effectiveDate: string;
  oldCTC: number;
  newCTC: number;
  percentageChange: number;
  reason?: string;
  approvedBy?: number;
  approvedByName?: string;
  approvedAt?: string;
}

// Transfer and Promotion History
export interface EmployeeTransfer {
  id: number;
  employeeId: number;
  transferType: 'department' | 'location' | 'designation' | 'grade' | 'company';
  effectiveDate: string;
  fromDepartmentId?: number;
  fromDepartmentName?: string;
  toDepartmentId?: number;
  toDepartmentName?: string;
  fromLocationId?: number;
  fromLocationName?: string;
  toLocationId?: number;
  toLocationName?: string;
  fromDesignationId?: number;
  fromDesignationName?: string;
  toDesignationId?: number;
  toDesignationName?: string;
  reason?: string;
  approvedBy?: number;
  approvedByName?: string;
  remarks?: string;
}

export interface EmployeePromotion {
  id: number;
  employeeId: number;
  effectiveDate: string;
  fromDesignationId: number;
  fromDesignationName: string;
  fromGradeId?: number;
  fromGradeName?: string;
  toDesignationId: number;
  toDesignationName: string;
  toGradeId?: number;
  toGradeName?: string;
  fromSalary?: number;
  toSalary?: number;
  reason?: string;
  approvedBy?: number;
  approvedByName?: string;
  remarks?: string;
}

// Employee Lifecycle History
export interface EmployeeLifecycleEvent {
  id: number;
  employeeId: number;
  eventType:
    | 'joined'
    | 'confirmed'
    | 'transferred'
    | 'promoted'
    | 'resigned'
    | 'terminated'
    | 'retired'
    | 'reactivated';
  eventDate: string;
  details?: string;
  performedBy?: number;
  performedByName?: string;
}

// Profile completeness
export interface ProfileCompleteness {
  overall: number;
  personalInfo: number;
  officialInfo: number;
  emergencyContacts: number;
  dependents: number;
  documents: number;
  bankDetails: number;
  taxDetails: number;
  missingFields: string[];
}

// Attendance/Leave summary for profile
export interface EmployeeAttendanceSummary {
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  halfDays: number;
  lateCount: number;
  earlyLeaveCount: number;
  overtimeHours: number;
  period: {
    from: string;
    to: string;
  };
}

export interface EmployeeLeaveSummary {
  leaveBalances: {
    leaveTypeId: number;
    leaveTypeName: string;
    totalAllocated: number;
    used: number;
    balance: number;
    carryForward: number;
  }[];
}
