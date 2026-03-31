import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { EducationService } from '../../services/education.service';
import { ToasterService, ModalService } from '../../../core/services';
import { Education } from '../../models';

@Component({
  selector: 'app-education-list',
  standalone: false,
  templateUrl: './education-list.component.html',
  styleUrls: ['./education-list.component.scss'],
})
export class EducationListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  private paginator?: MatPaginator;

  @ViewChild(MatPaginator)
  set matPaginator(paginator: MatPaginator | undefined) {
    if (!paginator) return;

    this.paginator = paginator;
    this.dataSource.paginator = paginator;
    this.syncPaginator();
  }

  displayedColumns = ['education_name', 'education_code', 'level', 'status', 'actions'];
  dataSource = new MatTableDataSource<Education>([]);

  educations = signal<Education[]>([]);
  searchTerm = signal<string>('');
  levelFilter = signal<string>('');
  statusFilter = signal<string>('');

  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);

  isLoading = signal<boolean>(false);

  levels = ['School', 'UG', 'PG', 'Doctorate', 'Certification'];

  constructor(
    private educationService: EducationService,
    private toasterService: ToasterService,
    private modalService: ModalService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadEducations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadEducations();
      });
  }

  loadEducations(): void {
    this.isLoading.set(true);

    const params = {
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm(),
      level: this.levelFilter(),
      status: this.statusFilter(),
    };

    this.educationService
      .getEducations(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.educations.set(response.data || []);
            this.dataSource.data = response.data || [];
            this.totalElements.set(response.pagination?.total || 0);
            this.totalPages.set(response.pagination?.totalPages || 0);
            this.syncPaginator();
          }
          this.isLoading.set(false);
          this.cdr.markForCheck();
        },
        error: () => {
          this.isLoading.set(false);
          this.educations.set([]);
          this.dataSource.data = [];
          this.cdr.markForCheck();
        },
      });
  }

  private syncPaginator(): void {
    if (!this.paginator) return;

    if (this.paginator.length !== this.totalElements()) {
      this.paginator.length = this.totalElements();
    }

    const expectedIndex = this.currentPage() - 1;
    if (this.paginator.pageIndex !== expectedIndex) {
      this.paginator.pageIndex = expectedIndex;
    }

    if (this.paginator.pageSize !== this.pageSize()) {
      this.paginator.pageSize = this.pageSize();
    }
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.searchSubject.next(value);
  }

  onLevelChange(value: string): void {
    this.levelFilter.set(value);
    this.currentPage.set(1);
    this.loadEducations();
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value);
    this.currentPage.set(1);
    this.loadEducations();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadEducations();
  }

  navigateToAdd(): void {
    this.router.navigate(['/educations/add']);
  }

  navigateToEdit(education: Education): void {
    this.router.navigate(['/educations/edit', education.id]);
  }

  async onDelete(education: Education): Promise<void> {
    const confirmed = await this.modalService.confirm(
      'Delete Education',
      `Are you sure you want to delete "${education.education_name}"? This action cannot be undone.`,
    );

    if (confirmed) {
      this.isLoading.set(true);
      this.educationService.deleteEducation(education.id!).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          if (response.success) {
            this.toasterService.success('Success', 'Education deleted successfully');
            this.loadEducations();
          } else {
            this.toasterService.error('Error', response.message);
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.isLoading.set(false);
          this.toasterService.error('Error', error.error?.message || 'Failed to delete education');
          this.cdr.markForCheck();
        },
      });
    }
  }

  async onToggleStatus(education: Education): Promise<void> {
    const action = education.status === 'active' ? 'deactivate' : 'activate';
    const confirmed = await this.modalService.confirm(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Education`,
      `Are you sure you want to ${action} "${education.education_name}"?`,
    );

    if (confirmed) {
      const request$ =
        education.status === 'active'
          ? this.educationService.deactivateEducation(education.id!)
          : this.educationService.activateEducation(education.id!);

      request$.subscribe({
        next: (response) => {
          if (response.success) {
            this.toasterService.success('Success', `Education ${action}d successfully`);
            this.loadEducations();
          } else {
            this.toasterService.error('Error', response.message);
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.toasterService.error(
            'Error',
            error.error?.message || `Failed to ${action} education`,
          );
          this.cdr.markForCheck();
        },
      });
    }
  }
}
