import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { DepartmentTableComponent } from '../../components/department-table/department-table.component';
import { DepartmentTreeComponent } from '../../components/department-tree/department-tree.component';
import { DepartmentService } from '../../services/department.service';
import { ToasterService, ModalService } from '../../../core/services';
import { Department, DepartmentNode } from '../../models/department.model';
import { DepartmentPaginationParams } from '../../models/department-pagination-params.model';

@Component({
  selector: 'app-department-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-building me-2"></i>
            Department Management
          </h2>
        </div>
        <div class="col-auto">
          <button class="btn btn-primary" (click)="navigateToAdd()">
            <i class="fas fa-plus me-2"></i>
            Add Department
          </button>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-md-6">
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-search"></i>
            </span>
            <input
              type="text"
              class="form-control"
              placeholder="Search by name or code..."
              [ngModel]="searchTerm()"
              (ngModelChange)="onSearchChange($event)"
            />
          </div>
        </div>
        <div class="col-md-3">
          <select
            class="form-select"
            [ngModel]="statusFilter()"
            (ngModelChange)="onStatusChange($event)"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div class="col-md-3">
          <div class="btn-group w-100" role="group">
            <input
              type="radio"
              class="btn-check"
              name="viewMode"
              id="tableView"
              value="table"
              [ngModel]="viewMode()"
              (ngModelChange)="onViewModeChange($event)"
            />
            <label class="btn btn-outline-primary" for="tableView">
              <i class="fas fa-table me-1"></i> Table
            </label>

            <input
              type="radio"
              class="btn-check"
              name="viewMode"
              id="treeView"
              value="tree"
              [ngModel]="viewMode()"
              (ngModelChange)="onViewModeChange($event)"
            />
            <label class="btn btn-outline-primary" for="treeView">
              <i class="fas fa-sitemap me-1"></i> Tree
            </label>
          </div>
        </div>
      </div>

      @if (isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 text-muted">Loading departments...</p>
        </div>
      } @else if (viewMode() === 'table') {
        <div class="card shadow-sm">
          <div class="card-body">
            <app-department-table
              [departments]="departments()"
              [pageSize]="pageSize()"
              [totalElements]="totalElements()"
              [currentPage]="currentPage()"
              (edit)="navigateToEdit($event)"
              (delete)="onDelete($event)"
              (page)="onPageChange($event)"
              (sort)="onSortChange($event)"
            >
            </app-department-table>
          </div>
        </div>
      } @else {
        <div class="card shadow-sm">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="fas fa-sitemap me-2"></i>
              Department Hierarchy
            </h5>
          </div>
          <div class="card-body">
            <app-department-tree [treeData]="departmentTree()" (nodeSelect)="onNodeSelect($event)">
            </app-department-tree>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .page-title {
        font-size: 1.75rem;
        font-weight: 600;
        color: #333;
        margin-bottom: 0;
      }

      .card {
        border: none;
        border-radius: 10px;
      }

      .input-group-text {
        background-color: #f8f9fa;
        border-right: none;
      }

      .form-control:focus {
        border-color: #0d6efd;
        box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
      }

      .btn-group .btn {
        border-radius: 6px;
      }

      .btn-group .btn-check:checked + .btn {
        background-color: #0d6efd;
        color: white;
      }

      .card-header {
        background-color: #fff;
        border-bottom: 2px solid #f0f0f0;
        font-weight: 500;
      }

      .spinner-border {
        width: 3rem;
        height: 3rem;
      }
    `,
  ],
})
export class DepartmentListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  departments = signal<Department[]>([]);
  departmentTree = signal<DepartmentNode[]>([]);

  searchTerm = signal<string>('');
  statusFilter = signal<string>('all');
  viewMode = signal<'table' | 'tree'>('table');

  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalElements = signal<number>(0);
  sortColumn = signal<string>('department_name');
  sortOrder = signal<'asc' | 'desc'>('asc');

  isLoading = signal<boolean>(false);

  constructor(
    private departmentService: DepartmentService,
    private toasterService: ToasterService,
    private modalService: ModalService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadInitialData();

    this.departmentService.refresh$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadDepartments();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadDepartments();
      });
  }

  private loadInitialData(): void {
    this.loadDepartments();

    if (this.viewMode() === 'tree') {
      this.loadAllDepartments();
    }
  }

  loadDepartments(): void {
    this.isLoading.set(true);

    const params: DepartmentPaginationParams = {
      page: this.currentPage(),
      limit: this.pageSize(),
      sortBy: this.sortColumn(),
      sortOrder: this.sortOrder(),
      search: this.searchTerm(),
      status: this.statusFilter() as any,
    };

    this.departmentService.getDepartments(params).subscribe({
      next: (response) => {
        if (response) {
          this.departments.set(response.data);
          this.totalElements.set(response.total);
        }
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading.set(false);
        this.departments.set([]);
        this.cdr.markForCheck();
      },
    });
  }

  loadAllDepartments(): void {
    this.departmentService.getDepartmentHierarchy().subscribe((tree) => {
      if (tree) {
        this.departmentTree.set(tree);
        this.cdr.markForCheck();
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.searchSubject.next(value);
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value);
    this.currentPage.set(1);
    this.loadDepartments();
  }

  onViewModeChange(value: 'table' | 'tree'): void {
    this.viewMode.set(value);

    if (value === 'tree' && this.departmentTree().length === 0) {
      this.loadAllDepartments();
    }
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadDepartments();
  }

  onSortChange(event: { active: string; direction: string }): void {
    this.sortColumn.set(event.active);
    this.sortOrder.set(event.direction === 'desc' ? 'desc' : 'asc');
    this.loadDepartments();
  }

  navigateToAdd(): void {
    this.router.navigate(['/department/add']);
  }

  navigateToEdit(department: Department): void {
    this.router.navigate(['/department/edit', department.id]);
  }

  async onDelete(department: Department): Promise<void> {
    const confirmed = await this.modalService.confirm(
      'Delete Department',
      `Are you sure you want to delete "${department.department_name}"? This action cannot be undone.`,
    );

    if (confirmed) {
      this.isLoading.set(true);

      this.departmentService.deleteDepartment(department.id!).subscribe({
        next: (success) => {
          if (success) {
            this.toasterService.success('Success', 'Department deleted successfully');
            this.loadDepartments();
            if (this.viewMode() === 'tree') {
              this.loadAllDepartments();
            }
          } else {
            this.toasterService.error('Error', 'Failed to delete department');
            this.isLoading.set(false);
          }
          this.cdr.markForCheck();
        },
        error: () => {
          this.toasterService.error('Error', 'Failed to delete department');
          this.isLoading.set(false);
          this.cdr.markForCheck();
        },
      });
    }
  }

  onNodeSelect(node: DepartmentNode): void {
    console.log('Selected department:', node);
  }
}
