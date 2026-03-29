export interface DepartmentHierarchyResponse {
  id: number;
  department_name: string;
  department_code: string;
  parent_department_id: number | null;
  description: string;
  status: string;
  children?: DepartmentHierarchyResponse[];
}
