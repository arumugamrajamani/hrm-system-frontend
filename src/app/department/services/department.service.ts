import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Department, DepartmentNode } from '../models/department.model';
import { DepartmentApiService } from './department-api.service';
import { DepartmentHierarchyResponse } from './department-hierarchy.model';
import { DepartmentPaginationParams } from '../models/department-pagination-params.model';
import { PaginatedResponse } from '../../core/models';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private refreshTrigger = new Subject<void>();
  readonly refresh$ = this.refreshTrigger.asObservable();

  private departmentsCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000;

  private allDepartmentsCache: Department[] | null = null;
  private treeCache: DepartmentNode[] | null = null;
  private cacheTimestamp: number = 0;

  constructor(private apiService: DepartmentApiService) {}

  triggerRefresh(): void {
    this.refreshTrigger.next();
    this.clearCache();
  }

  private clearCache(): void {
    this.departmentsCache.clear();
    this.allDepartmentsCache = null;
    this.treeCache = null;
    this.cacheTimestamp = 0;
  }

  getDepartments(params: DepartmentPaginationParams): Observable<PaginatedResponse<Department>> {
    const cacheKey = JSON.stringify(params);
    const cached = this.departmentsCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return of(cached.data);
    }

    return this.apiService.getDepartments(params).pipe(
      tap((response) => {
        this.departmentsCache.set(cacheKey, {
          data: response,
          timestamp: Date.now(),
        });
      }),
      catchError(() => {
        return of({
          data: [],
          total: 0,
          page: params.page,
          limit: params.limit,
          totalPages: 0,
        });
      }),
    );
  }

  getDepartment(id: number): Observable<Department | null> {
    return this.apiService.getDepartment(id).pipe(
      map((response) => (response.success ? response.data! : null)),
      catchError(() => {
        return of(null);
      }),
    );
  }

  createDepartment(data: Partial<Department>): Observable<Department | null> {
    this.clearCache();

    return this.apiService.createDepartment(data).pipe(
      map((response) => {
        if (response.success) {
          this.triggerRefresh();
          return response.data!;
        }
        return null;
      }),
    );
  }

  updateDepartment(id: number, data: Partial<Department>): Observable<Department | null> {
    this.clearCache();

    return this.apiService.updateDepartment(id, data).pipe(
      map((response) => {
        if (response.success) {
          this.triggerRefresh();
          return response.data!;
        }
        return null;
      }),
    );
  }

  deleteDepartment(id: number): Observable<boolean> {
    this.clearCache();

    return this.apiService.deleteDepartment(id).pipe(
      map((response) => {
        if (response.success) {
          this.triggerRefresh();
          return true;
        }
        return false;
      }),
      catchError(() => {
        return of(false);
      }),
    );
  }

  activateDepartment(id: number): Observable<Department | null> {
    this.clearCache();

    return this.apiService.activateDepartment(id).pipe(
      map((response) => {
        if (response.success) {
          this.triggerRefresh();
          return response.data!;
        }
        return null;
      }),
      catchError(() => {
        return of(null);
      }),
    );
  }

  deactivateDepartment(id: number): Observable<Department | null> {
    this.clearCache();

    return this.apiService.deactivateDepartment(id).pipe(
      map((response) => {
        if (response.success) {
          this.triggerRefresh();
          return response.data!;
        }
        return null;
      }),
      catchError(() => {
        return of(null);
      }),
    );
  }

  getAllDepartments(): Observable<Department[]> {
    if (this.allDepartmentsCache) {
      return of(this.allDepartmentsCache);
    }

    return this.apiService
      .getDepartments({
        page: 1,
        limit: 1000,
      })
      .pipe(
        map((response) => {
          const departments = Array.isArray(response.data) ? response.data : [];
          this.allDepartmentsCache = departments;
          return departments;
        }),
        catchError(() => {
          this.allDepartmentsCache = [];
          return of([]);
        }),
      );
  }

  getRootDepartmentsForDropdown(): Observable<Department[]> {
    return this.apiService.getDepartmentHierarchy().pipe(
      map((response) => {
        if (response.success && response.data) {
          return response.data.map(
            (node) =>
              ({
                id: node.id,
                department_name: node.department_name,
                department_code: node.department_code,
                parent_department_id: node.parent_department_id ?? undefined,
                description: node.description,
                status: node.status as 'active' | 'inactive',
              }) as Department,
          );
        }
        return [];
      }),
      catchError(() => {
        return of([]);
      }),
    );
  }

  getDepartmentHierarchy(): Observable<DepartmentNode[]> {
    if (this.treeCache && Date.now() - this.cacheTimestamp < this.CACHE_DURATION) {
      return of(this.treeCache);
    }

    return this.apiService.getDepartmentHierarchy().pipe(
      map((response) => {
        if (response.success && response.data) {
          const tree = this.convertHierarchyToTree(response.data);
          this.treeCache = tree;
          this.cacheTimestamp = Date.now();
          return tree;
        }
        return [];
      }),
      catchError(() => {
        this.treeCache = [];
        return of([]);
      }),
    );
  }

  private convertHierarchyToTree(hierarchy: DepartmentHierarchyResponse[]): DepartmentNode[] {
    return hierarchy.map((node) => this.mapHierarchyNode(node));
  }

  private mapHierarchyNode(node: DepartmentHierarchyResponse): DepartmentNode {
    return {
      id: node.id,
      department_name: node.department_name,
      department_code: node.department_code,
      parent_department_id: node.parent_department_id ?? undefined,
      description: node.description,
      status: node.status as 'active' | 'inactive',
      children: node.children
        ? node.children.map((child: DepartmentHierarchyResponse) => this.mapHierarchyNode(child))
        : [],
      expanded: true,
      level: 0,
    };
  }

  buildDepartmentTree(departments: Department[]): DepartmentNode[] {
    if (!departments || departments.length === 0) {
      return [];
    }

    const nodeMap = new Map<number, DepartmentNode>();
    const roots: DepartmentNode[] = [];

    departments.forEach((dept) => {
      if (dept.id) {
        nodeMap.set(dept.id, {
          ...dept,
          children: [],
          expanded: true,
          level: 0,
        });
      }
    });

    departments.forEach((dept) => {
      if (dept.id) {
        const node = nodeMap.get(dept.id)!;
        if (dept.parent_department_id && nodeMap.has(dept.parent_department_id)) {
          const parent = nodeMap.get(dept.parent_department_id)!;
          parent.children!.push(node);
          node.level = (parent.level || 0) + 1;
        } else {
          roots.push(node);
        }
      }
    });

    return roots;
  }

  getCachedTree(): DepartmentNode[] | null {
    return this.treeCache;
  }

  setCachedTree(tree: DepartmentNode[]): void {
    this.treeCache = tree;
    this.cacheTimestamp = Date.now();
  }

  invalidateCache(): void {
    this.clearCache();
  }
}
