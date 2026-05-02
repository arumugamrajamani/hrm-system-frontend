import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { CompanyStore } from '../../services/company.store';
import { Company } from '../../models/company.model';
import { Permission } from '../../../../../core/models/rbac.models';
import { LoadingSkeletonComponent } from '../../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { ToasterService, ModalService } from '../../../../../core/services';

@Component({
  selector: 'app-company-list',
  standalone: false,
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss'],
})
export class CompanyListComponent implements OnInit {
  readonly store = inject(CompanyStore);
  readonly Math = Math;
  private router = inject(Router);
  private toasterService = inject(ToasterService);
  private modalService = inject(ModalService);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  private stateSubject = new Subject<string>();

  private paginator?: MatPaginator;

  @ViewChild(MatPaginator)
  set matPaginator(paginator: MatPaginator | undefined) {
    if (!paginator) return;
    this.paginator = paginator;
  }

  displayedColumns = [
    'name',
    'code',
    'city',
    'state',
    'country',
    'status',
    'employeeCount',
    'actions',
  ];
  dataSource = new MatTableDataSource<Company>([]);

  searchTerm = signal<string>('');
  statusFilter = signal<string>('');
  stateFilter = signal<string>('');
  skeletonRows = Array(5).fill(0);

  readonly Permission = Permission;

  ngOnInit(): void {
    this.store.loadCompanies();
    this.setupSearchDebounce();
    this.setupStateDebounce();
  }

  private loadDataSource(): void {
    this.dataSource.data = this.store.companies();
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.store.loadCompanies({ search: this.searchTerm(), page: 1 });
      });
  }

  private setupStateDebounce(): void {
    this.stateSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.store.loadCompanies({ state: this.stateFilter(), page: 1 });
      });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.searchSubject.next(value);
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value);
    this.store.loadCompanies({ status: value as any, page: 1 });
  }

  onStateChange(value: string): void {
    this.stateFilter.set(value);
    this.stateSubject.next(value);
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.store.pagination().totalPages) return;
    this.store.loadCompanies({ page, limit: this.store.pagination().limit });
  }

  onPageSizeChange(limit: number): void {
    this.store.loadCompanies({ page: 1, limit });
  }

  reload(): void {
    this.store.loadCompanies();
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
    this.router.navigate(['/masters/companies/add']);
  }

  navigateToEdit(company: Company): void {
    this.router.navigate(['/masters/companies/edit', company.id]);
  }

  async onToggleStatus(company: Company): Promise<void> {
    const action = company.status === 'active' ? 'deactivate' : 'activate';
    const confirmed = await this.modalService.confirm(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Company`,
      `Are you sure you want to ${action} "${company.name}"?`,
    );

    if (confirmed) {
      this.store.toggleStatus(company.id).subscribe({
        next: (response) => {
          if (response?.success) {
            this.toasterService.success('Success', `Company ${action}d successfully`);
            this.store.loadCompanies();
          } else {
            this.toasterService.error('Error', response?.message || `Failed to ${action} company`);
          }
        },
      });
    }
  }

  async onDelete(company: Company): Promise<void> {
    const confirmed = await this.modalService.confirm(
      'Delete Company',
      `Are you sure you want to delete "${company.name}"? This action cannot be undone.`,
    );

    if (confirmed) {
      this.store.delete(company.id).subscribe({
        next: (response) => {
          if (response?.success) {
            this.toasterService.success('Success', 'Company deleted successfully');
            this.store.loadCompanies();
          } else {
            this.toasterService.error('Error', response?.message || 'Failed to delete company');
          }
        },
      });
    }
  }
}
