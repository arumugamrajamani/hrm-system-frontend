export interface Department {
  id?: number;
  department_name: string;
  department_code: string;
  parent_department_id?: number;
  parent_department_name?: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at?: Date;
  updated_at?: Date;
}

export interface DepartmentNode extends Department {
  children?: DepartmentNode[];
  expanded?: boolean;
  level?: number;
}
