import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { Department } from '../../models/department.model';
import { ModalService } from '../../../core/services';

@Component({
  selector: 'app-department-table',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-responsive">
      <table
        mat-table
        [dataSource]="dataSource"
        matSort
        (matSortChange)="onSortChange($event)"
        class="table table-hover"
      >
        <ng-container matColumnDef="department_name">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Department Name</th>
          <td mat-cell *matCellDef="let dept">{{ dept.department_name }}</td>
        </ng-container>

        <ng-container matColumnDef="department_code">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Code</th>
          <td mat-cell *matCellDef="let dept">
            <span class="badge bg-secondary">{{ dept.department_code }}</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="parent_department_name">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Parent Department</th>
          <td mat-cell *matCellDef="let dept">
            {{ dept.parent_department_name || '-' }}
          </td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
          <td mat-cell *matCellDef="let dept">
            @if (dept.status === 'active') {
              <span class="badge bg-success">Active</span>
            } @else {
              <span class="badge bg-danger">Inactive</span>
            }
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let dept">
            <button class="btn btn-sm btn-primary me-2" (click)="onEdit(dept)" title="Edit">
              <i class="fas fa-pencil-alt"></i>
            </button>
            <button class="btn btn-sm btn-danger" (click)="onDelete(dept)" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>

        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell text-center py-4" [attr.colspan]="displayedColumns.length">
            <div class="text-muted">
              <i class="fas fa-inbox fa-2x mb-2 d-block"></i>
              No departments found
            </div>
          </td>
        </tr>
      </table>

      @if (totalElements > 0) {
        <mat-paginator
          [pageSizeOptions]="[10, 25, 50, 100]"
          [pageSize]="pageSize"
          [length]="totalElements"
          [pageIndex]="currentPage - 1"
          (page)="onPageChange($event)"
        >
        </mat-paginator>
      }
    </div>
  `,
  styles: [
    `
      .table-responsive {
        overflow-x: auto;
      }

      .table {
        margin-bottom: 0;
        min-width: 800px;
      }

      .badge {
        font-size: 0.85rem;
        padding: 0.4em 0.8em;
      }

      .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.875rem;
      }

      .btn {
        transition: all 0.2s ease;
      }

      .btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .mat-mdc-row:hover {
        background-color: rgba(0, 123, 255, 0.04);
      }

      .mat-mdc-cell {
        padding: 12px 8px;
        vertical-align: middle;
      }

      .mat-mdc-header-cell {
        font-weight: 600;
        color: #495057;
        background-color: #f8f9fa;
        border-bottom: 2px solid #dee2e6;
      }

      .text-muted {
        color: #6c757d;
      }

      @media (max-width: 768px) {
        .table {
          font-size: 0.875rem;
        }

        .btn-sm {
          padding: 0.2rem 0.4rem;
          font-size: 0.75rem;
        }
      }
    `,
  ],
})
export class DepartmentTableComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() departments: Department[] = [];
  @Input() pageSize: number = 10;
  @Input() totalElements: number = 0;
  @Input() currentPage: number = 1;
  @Output() edit = new EventEmitter<Department>();
  @Output() delete = new EventEmitter<Department>();
  @Output() page = new EventEmitter<{ pageIndex: number; pageSize: number }>();
  @Output() sort = new EventEmitter<{ active: string; direction: string }>();

  @ViewChild(MatSort) sortDir!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns = [
    'department_name',
    'department_code',
    'parent_department_name',
    'status',
    'actions',
  ];
  dataSource = new MatTableDataSource<Department>([]);

  constructor(
    private modalService: ModalService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit() {
    this.dataSource.sort = this.sortDir;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['departments']) {
      this.dataSource.data = this.departments;
    }
  }

  ngOnDestroy() {
    if (this.dataSource) {
      this.dataSource.disconnect();
    }
  }

  onEdit(department: Department): void {
    this.edit.emit(department);
  }

  async onDelete(department: Department): Promise<void> {
    const confirmed = await this.modalService.confirm(
      'Delete Department',
      `Are you sure you want to delete "${department.department_name}"? This action cannot be undone.`,
    );

    if (confirmed) {
      this.delete.emit(department);
    }
  }

  onPageChange(event: PageEvent): void {
    this.page.emit({
      pageIndex: event.pageIndex + 1,
      pageSize: event.pageSize,
    });
  }

  onSortChange(event: any): void {
    this.sort.emit({
      active: event.active,
      direction: event.direction,
    });
  }
}
