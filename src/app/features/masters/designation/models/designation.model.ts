export interface Designation {
  id: number;
  name: string;
  code: string;
  departmentId?: number;
  departmentName?: string;
  gradeLevel?: number;
  description?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  updatedBy?: number;
  createdByUsername?: string;
  updatedByUsername?: string;
}

export interface DesignationFilters {
  search?: string;
  departmentId?: number;
  status?: 'active' | 'inactive';
}

export interface CreateDesignationDto {
  designation_name: string;
  designation_code?: string;
  department_id?: number;
  grade_level?: number;
  description?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateDesignationDto extends Partial<CreateDesignationDto> {}

export interface CodeResponse {
  designation_code: string;
}
