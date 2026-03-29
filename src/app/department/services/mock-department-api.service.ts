import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../../core/models';
import { Department } from '../models/department.model';

@Injectable({
  providedIn: 'root',
})
export class MockDepartmentApiService {
  private mockDepartments: Department[] = [
    {
      id: 1,
      department_name: 'Human Resources',
      department_code: 'HR',
      parent_department_id: undefined,
      description: 'Handles employee relations, recruitment, and benefits',
      status: 'active',
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-15'),
    },
    {
      id: 2,
      department_name: 'Engineering',
      department_code: 'ENG',
      parent_department_id: undefined,
      description: 'Software development and technical operations',
      status: 'active',
      created_at: new Date('2024-01-10'),
      updated_at: new Date('2024-02-20'),
    },
    {
      id: 3,
      department_name: 'Frontend Team',
      department_code: 'ENG-FE',
      parent_department_id: 2,
      parent_department_name: 'Engineering',
      description: 'Frontend development team focusing on web interfaces',
      status: 'active',
      created_at: new Date('2024-02-01'),
      updated_at: new Date('2024-02-01'),
    },
    {
      id: 4,
      department_name: 'Backend Team',
      department_code: 'ENG-BE',
      parent_department_id: 2,
      parent_department_name: 'Engineering',
      description: 'Backend development and API architecture',
      status: 'active',
      created_at: new Date('2024-02-01'),
      updated_at: new Date('2024-02-01'),
    },
    {
      id: 5,
      department_name: 'DevOps',
      department_code: 'ENG-DO',
      parent_department_id: 2,
      parent_department_name: 'Engineering',
      description: 'Infrastructure and deployment automation',
      status: 'active',
      created_at: new Date('2024-02-15'),
      updated_at: new Date('2024-02-15'),
    },
    {
      id: 6,
      department_name: 'Finance',
      department_code: 'FIN',
      parent_department_id: undefined,
      description: 'Financial planning, accounting, and reporting',
      status: 'active',
      created_at: new Date('2024-01-20'),
      updated_at: new Date('2024-01-20'),
    },
    {
      id: 7,
      department_name: 'Marketing',
      department_code: 'MKT',
      parent_department_id: undefined,
      description: 'Marketing campaigns and brand management',
      status: 'active',
      created_at: new Date('2024-01-25'),
      updated_at: new Date('2024-03-01'),
    },
    {
      id: 8,
      department_name: 'Sales',
      department_code: 'SALES',
      parent_department_id: undefined,
      description: 'Sales operations and client relationships',
      status: 'inactive',
      created_at: new Date('2024-01-18'),
      updated_at: new Date('2024-03-10'),
    },
    {
      id: 9,
      department_name: 'Product Management',
      department_code: 'PROD',
      parent_department_id: undefined,
      description: 'Product strategy and roadmap planning',
      status: 'active',
      created_at: new Date('2024-02-05'),
      updated_at: new Date('2024-02-05'),
    },
    {
      id: 10,
      department_name: 'Quality Assurance',
      department_code: 'QA',
      parent_department_id: 2,
      parent_department_name: 'Engineering',
      description: 'Testing and quality control',
      status: 'active',
      created_at: new Date('2024-02-10'),
      updated_at: new Date('2024-02-10'),
    },
  ];

  private nextId = 11;

  getDepartments(params: any): Observable<PaginatedResponse<Department>> {
    let filtered = [...this.mockDepartments];

    if (params.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.department_name.toLowerCase().includes(search) ||
          d.department_code.toLowerCase().includes(search),
      );
    }

    if (params.status && params.status !== 'all') {
      filtered = filtered.filter((d) => d.status === params.status);
    }

    if (params.sortBy) {
      filtered.sort((a: any, b: any) => {
        const aVal = a[params.sortBy];
        const bVal = b[params.sortBy];
        const order = params.sortOrder === 'desc' ? -1 : 1;
        return aVal > bVal ? order : -order;
      });
    }

    const total = filtered.length;
    const start = (params.page - 1) * params.limit;
    const end = start + params.limit;
    const data = filtered.slice(start, end);

    return of({
      data,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    }).pipe(delay(300));
  }

  getDepartment(id: number): Observable<ApiResponse<Department>> {
    const department = this.mockDepartments.find((d) => d.id === id);
    return of({
      success: !!department,
      message: department ? 'Department found' : 'Department not found',
      data: department || undefined,
    }).pipe(delay(200));
  }

  createDepartment(department: Partial<Department>): Observable<ApiResponse<Department>> {
    const newDepartment: Department = {
      ...department,
      id: this.nextId++,
      created_at: new Date(),
      updated_at: new Date(),
    } as Department;

    this.mockDepartments.push(newDepartment);

    return of({
      success: true,
      message: 'Department created successfully',
      data: newDepartment,
    }).pipe(delay(400));
  }

  updateDepartment(
    id: number,
    department: Partial<Department>,
  ): Observable<ApiResponse<Department>> {
    const index = this.mockDepartments.findIndex((d) => d.id === id);
    if (index === -1) {
      return of({
        success: false,
        message: 'Department not found',
      }).pipe(delay(200));
    }

    this.mockDepartments[index] = {
      ...this.mockDepartments[index],
      ...department,
      updated_at: new Date(),
    };

    return of({
      success: true,
      message: 'Department updated successfully',
      data: this.mockDepartments[index],
    }).pipe(delay(400));
  }

  deleteDepartment(id: number): Observable<ApiResponse> {
    const index = this.mockDepartments.findIndex((d) => d.id === id);
    if (index === -1) {
      return of({
        success: false,
        message: 'Department not found',
      }).pipe(delay(200));
    }

    this.mockDepartments.splice(index, 1);

    return of({
      success: true,
      message: 'Department deleted successfully',
    }).pipe(delay(300));
  }

  getAllDepartments(): Observable<ApiResponse<Department[]>> {
    return of({
      success: true,
      message: 'All departments retrieved',
      data: this.mockDepartments,
    }).pipe(delay(200));
  }

  checkNameUnique(name: string, excludeId?: number): Observable<ApiResponse<boolean>> {
    const exists = this.mockDepartments.some(
      (d) => d.department_name.toLowerCase() === name.toLowerCase() && d.id !== excludeId,
    );
    return of({
      success: true,
      message: 'Name check completed',
      data: !exists,
    }).pipe(delay(150));
  }

  checkCodeUnique(code: string, excludeId?: number): Observable<ApiResponse<boolean>> {
    const exists = this.mockDepartments.some(
      (d) => d.department_code.toLowerCase() === code.toLowerCase() && d.id !== excludeId,
    );
    return of({
      success: true,
      message: 'Code check completed',
      data: !exists,
    }).pipe(delay(150));
  }

  resetMockData(): void {
    this.mockDepartments = [
      {
        id: 1,
        department_name: 'Human Resources',
        department_code: 'HR',
        parent_department_id: undefined,
        description: 'Handles employee relations, recruitment, and benefits',
        status: 'active',
        created_at: new Date('2024-01-15'),
        updated_at: new Date('2024-01-15'),
      },
      {
        id: 2,
        department_name: 'Engineering',
        department_code: 'ENG',
        parent_department_id: undefined,
        description: 'Software development and technical operations',
        status: 'active',
        created_at: new Date('2024-01-10'),
        updated_at: new Date('2024-02-20'),
      },
    ];
    this.nextId = 3;
  }
}
