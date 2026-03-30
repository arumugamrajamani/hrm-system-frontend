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
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss'],
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
