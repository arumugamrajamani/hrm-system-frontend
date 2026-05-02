export interface Grade {
  id: number;
  name: string;
  code: string;
  level: number;
  description?: string;
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  isActive: boolean;
  status: 'active' | 'inactive';
  employeeCount?: number;
  designationCount?: number;
}

export interface GradeFilters {
  search?: string;
  status?: 'active' | 'inactive';
  minLevel?: number;
  maxLevel?: number;
}

export interface CreateGradeDto {
  name: string;
  code: string;
  level: number;
  description?: string;
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  isActive?: boolean;
}

export interface UpdateGradeDto extends Partial<CreateGradeDto> {}
