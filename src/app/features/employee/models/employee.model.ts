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
