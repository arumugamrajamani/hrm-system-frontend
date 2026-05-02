import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { GradeStore } from '../../services/grade.store';
import { Grade } from '../../models/grade.model';
import { Permission } from '../../../../../core/models/rbac.models';
import { LoadingSkeletonComponent } from '../../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { ToasterService, ModalService } from '../../../../../core/services';

@Component({
  selector: 'app-grade-list',
  standalone: false,
  templateUrl: './grade-list.component.html',
  styleUrls: ['./grade-list.component.scss'],
})
export class GradeListComponent implements OnInit {
  readonly store = inject(GradeStore);
  readonly Math = Math;
  private router = inject(Router);
  private toasterService = inject(ToasterService);
  private modalService = inject(ModalService);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  private paginator?: MatPaginator;

  @ViewChild(MatPaginator)
  set matPaginator(paginator: MatPaginator | undefined) {
    if (!paginator) return;
    this.paginator = paginator;
  }

  displayedColumns = [
    'name',
    'code',
    'level',
    'minSalary',
    'maxSalary',
    'status',
    'employeeCount',
    'actions',
  ];
  dataSource = new MatTableDataSource<Grade>([]);

  searchTerm = signal<string>('');
  statusFilter = signal<string>('');
  skeletonRows = Array(5).fill(0);

  readonly Permission = Permission;

  ngOnInit(): void {
    this.store.loadGrades();
    this.setupSearchDebounce();
    this.loadDataSource();
  }

  private loadDataSource(): void {
    this.dataSource.data = this.store.grades();
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.store.loadGrades({ search: this.searchTerm(), page: 1 });
      });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.searchSubject.next(value);
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value);
    this.store.loadGrades({ status: value as any, page: 1 });
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.store.pagination().totalPages) return;
    this.store.loadGrades({ page, limit: this.store.pagination().limit });
  }

  onPageSizeChange(limit: number): void {
    this.store.loadGrades({ page: 1, limit });
  }

  reload(): void {
    this.store.loadGrades();
  }

  getVisiblePages(): number[] {
    const current = this.store.pagination().page;
    const total = this.store.pagination().totalPages;
    const pages: number[] = [];

    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  navigateToAdd(): void {
    this.router.navigate(['/masters/grades/add']);
  }

  navigateToEdit(grade: Grade): void {
    this.router.navigate(['/masters/grades/edit', grade.id]);
  }

  async onToggleStatus(grade: Grade): Promise<void> {
    const action = grade.status === 'active' ? 'deactivate' : 'activate';
    const confirmed = await this.modalService.confirm(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Grade`,
      `Are you sure you want to ${action} "${grade.name}"?`,
    );

    if (confirmed) {
      this.store.toggleStatus(grade.id).subscribe({
        next: (response) => {
          if (response?.success) {
            this.toasterService.success('Success', `Grade ${action}d successfully`);
            this.store.loadGrades();
          } else {
            this.toasterService.error('Error', response?.message || `Failed to ${action} grade`);
          }
        },
      });
    }
  }

  async onDelete(grade: Grade): Promise<void> {
    const confirmed = await this.modalService.confirm(
      'Delete Grade',
      `Are you sure you want to delete "${grade.name}"? This action cannot be undone.`,
    );

    if (confirmed) {
      this.store.deleteGrade(grade.id).subscribe({
        next: (response) => {
          if (response?.success) {
            this.toasterService.success('Success', 'Grade deleted successfully');
            this.store.loadGrades();
          } else {
            this.toasterService.error('Error', response?.message || 'Failed to delete grade');
          }
        },
      });
    }
  }
}
