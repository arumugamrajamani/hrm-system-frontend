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
import { CourseService } from '../../services/course.service';
import { ToasterService, ModalService } from '../../../core/services';
import { Course } from '../../models';

@Component({
  selector: 'app-course-list',
  standalone: false,
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.scss'],
})
export class CourseListComponent implements OnInit, OnDestroy {
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

  displayedColumns = ['course_name', 'course_code', 'status', 'actions'];
  dataSource = new MatTableDataSource<Course>([]);

  courses = signal<Course[]>([]);
  searchTerm = signal<string>('');
  statusFilter = signal<string>('');

  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);

  isLoading = signal<boolean>(false);

  constructor(
    private courseService: CourseService,
    private toasterService: ToasterService,
    private modalService: ModalService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadCourses();
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
        this.loadCourses();
      });
  }

  loadCourses(): void {
    this.isLoading.set(true);

    const params = {
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm(),
      status: this.statusFilter(),
    };

    this.courseService
      .getCourses(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.courses.set(response.data || []);
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
          this.courses.set([]);
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

  onStatusChange(value: string): void {
    this.statusFilter.set(value);
    this.currentPage.set(1);
    this.loadCourses();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadCourses();
  }

  navigateToAdd(): void {
    this.router.navigate(['/course/add']);
  }

  navigateToEdit(course: Course): void {
    this.router.navigate(['/course/edit', course.id]);
  }

  async onDelete(course: Course): Promise<void> {
    const confirmed = await this.modalService.confirm(
      'Delete Course',
      `Are you sure you want to delete "${course.course_name}"? This action cannot be undone.`,
    );

    if (confirmed) {
      this.isLoading.set(true);
      this.courseService.deleteCourse(course.id!).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          if (response.success) {
            this.toasterService.success('Success', 'Course deleted successfully');
            this.loadCourses();
          } else {
            this.toasterService.error('Error', response.message);
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.isLoading.set(false);
          this.toasterService.error('Error', error.error?.message || 'Failed to delete course');
          this.cdr.markForCheck();
        },
      });
    }
  }

  async onToggleStatus(course: Course): Promise<void> {
    const action = course.status === 'active' ? 'deactivate' : 'activate';
    const confirmed = await this.modalService.confirm(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Course`,
      `Are you sure you want to ${action} "${course.course_name}"?`,
    );

    if (confirmed) {
      const request$ =
        course.status === 'active'
          ? this.courseService.deactivateCourse(course.id!)
          : this.courseService.activateCourse(course.id!);

      request$.subscribe({
        next: (response) => {
          if (response.success) {
            this.toasterService.success('Success', `Course ${action}d successfully`);
            this.loadCourses();
          } else {
            this.toasterService.error('Error', response.message);
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.toasterService.error('Error', error.error?.message || `Failed to ${action} course`);
          this.cdr.markForCheck();
        },
      });
    }
  }
}
