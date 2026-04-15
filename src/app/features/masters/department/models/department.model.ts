export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  parentId?: number;
  parentName?: string;
  headId?: number;
  headName?: string;
  locationId?: number;
  locationName?: string;
  isActive: boolean;
  status: 'active' | 'inactive';
  employeeCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentTree extends Department {
  children: DepartmentTree[];
}

export interface DepartmentFilters {
  search?: string;
  parentId?: number;
  locationId?: number;
  isActive?: boolean;
  status?: 'active' | 'inactive';
}

export interface CreateDepartmentDto {
  name: string;
  code: string;
  description?: string;
  parentId?: number;
  headId?: number;
  locationId?: number;
  isActive?: boolean;
}

export interface UpdateDepartmentDto extends Partial<CreateDepartmentDto> {}

export function buildDepartmentTree(departments: Department[]): DepartmentTree[] {
  const map = new Map<number, DepartmentTree>();
  const roots: DepartmentTree[] = [];

  departments.forEach((dept) => {
    map.set(dept.id, { ...dept, children: [] });
  });

  departments.forEach((dept) => {
    const node = map.get(dept.id)!;
    if (dept.parentId && map.has(dept.parentId)) {
      map.get(dept.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}
