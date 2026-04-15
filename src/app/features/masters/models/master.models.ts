export interface Designation {
  id: number;
  name: string;
  code: string;
  description?: string;
  gradeId?: number;
  gradeName?: string;
  departmentId?: number;
  departmentName?: string;
  isActive: boolean;
  status: 'active' | 'inactive';
  employeeCount?: number;
}

export interface Grade {
  id: number;
  name: string;
  code: string;
  description?: string;
  level: number;
  minSalary?: number;
  maxSalary?: number;
  isActive: boolean;
  status: 'active' | 'inactive';
}

export interface Location {
  id: number;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  isPrimary: boolean;
  isActive: boolean;
  status: 'active' | 'inactive';
}

export interface EmploymentType {
  id: number;
  name: string;
  code: string;
  description?: string;
  isPermanent: boolean;
  isActive: boolean;
  status: 'active' | 'inactive';
}

export interface Shift {
  id: number;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  workingHours: number;
  breakDuration?: number;
  isFlexible: boolean;
  isActive: boolean;
  status: 'active' | 'inactive';
}

export interface Holiday {
  id: number;
  date: string;
  name: string;
  type: 'national' | 'state' | 'festival' | 'optional';
  isOptional: boolean;
  year: number;
  locationId?: number;
  locationName?: string;
}
