export interface EmploymentType {
  id?: number;
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
  created_by_username?: string;
  updated_by_username?: string;
}

export interface EmploymentTypeFilters {
  search?: string;
  status?: 'active' | 'inactive';
}
