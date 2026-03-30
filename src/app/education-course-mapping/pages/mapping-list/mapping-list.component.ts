import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { EducationCourseMappingService } from '../../services/mapping.service';
import { EducationService } from '../../../education/services';
import { CourseService } from '../../../course/services';
import { ToasterService, ModalService } from '../../../core/services';
import { Education } from '../../../education/models';
import { Course } from '../../../course/models';
import { EducationCourseMapping } from '../../models';

@Component({
  selector: 'app-mapping-list',
  standalone: false,
  templateUrl: './mapping-list.component.html',
  styleUrls: ['./mapping-list.component.scss'],
})
export class MappingListComponent implements OnInit, OnDestroy {
  Math = Math;

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  allMappings: EducationCourseMapping[] = [];

  educations = signal<Education[]>([]);
  courses = signal<Course[]>([]);

  filteredMappings = signal<EducationCourseMapping[]>([]);
  paginatedMappings = signal<EducationCourseMapping[]>([]);

  searchTerm = signal<string>('');
  educationFilter = signal<number | null>(null);
  courseFilter = signal<number | null>(null);

  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalElements = signal<number>(0);

  isLoading = signal<boolean>(false);
  showCreateModal = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  selectedEducationId: number | null = null;
  selectedCourseId: number | null = null;
  educationSearch = signal<string>('');
  courseSearch = signal<string>('');
  educationDropdownOpen = false;
  courseDropdownOpen = false;
  educationTouched = false;
  courseTouched = false;

  constructor(
    private mappingService: EducationCourseMappingService,
    private educationService: EducationService,
    private courseService: CourseService,
    private toasterService: ToasterService,
    private modalService: ModalService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadEducations();
    this.loadCourses();
    this.loadMappings();
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
        this.applyFilters();
      });
  }

  private applyFilters(): void {
    let data = [...this.allMappings];

    if (this.searchTerm()) {
      const search = this.searchTerm().toLowerCase();
      data = data.filter(
        (m: EducationCourseMapping) =>
          m.education_name?.toLowerCase().includes(search) ||
          m.education_code?.toLowerCase().includes(search) ||
          m.course_name?.toLowerCase().includes(search) ||
          m.course_code?.toLowerCase().includes(search),
      );
    }

    if (this.educationFilter()) {
      data = data.filter((m: EducationCourseMapping) => m.education_id === this.educationFilter());
    }

    if (this.courseFilter()) {
      data = data.filter((m: EducationCourseMapping) => m.course_id === this.courseFilter());
    }

    this.totalElements.set(data.length);
    this.filteredMappings.set(data);
    this.updatePaginatedData();
  }

  private updatePaginatedData(): void {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    const paginatedData = this.filteredMappings().slice(startIndex, endIndex);
    this.paginatedMappings.set(paginatedData);
  }

  loadMappings(): void {
    this.isLoading.set(true);
    this.mappingService.getAllMappings().subscribe({
      next: (response) => {
        if (response && response.success) {
          this.allMappings = response.data || [];
          this.applyFilters();
        } else {
          this.allMappings = [];
          this.filteredMappings.set([]);
          this.paginatedMappings.set([]);
          this.totalElements.set(0);
        }
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading mappings:', err);
        this.isLoading.set(false);
        this.allMappings = [];
        this.filteredMappings.set([]);
        this.paginatedMappings.set([]);
        this.totalElements.set(0);
        this.cdr.markForCheck();
      },
    });
  }

  testApi(): void {
    console.log('Testing Education API...');
    this.educationService.getEducations({ status: 'active', limit: 100 }).subscribe({
      next: (res) => {
        console.log('Education API Result:', res);
        alert('Check console for API result!');
      },
      error: (err) => {
        console.error('Education API Error:', err);
        alert('Error - check console!');
      },
    });
  }

  loadEducations(): void {
    this.educationService.getEducations({ status: 'active', limit: 100 }).subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          this.educations.set(response.data);
        } else {
          this.educations.set([]);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading educations:', err);
        this.educations.set([]);
        this.cdr.markForCheck();
      },
    });
  }

  loadCourses(): void {
    this.courseService.getCourses({ status: 'active', limit: 100 }).subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          this.courses.set(response.data);
        } else {
          this.courses.set([]);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading courses:', err);
        this.courses.set([]);
        this.cdr.markForCheck();
      },
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.searchSubject.next(value);
  }

  onEducationFilterChange(value: string): void {
    const val = value ? Number(value) : null;
    this.educationFilter.set(val);
    this.currentPage.set(1);
    this.applyFilters();
  }

  onCourseFilterChange(value: string): void {
    const val = value ? Number(value) : null;
    this.courseFilter.set(val);
    this.currentPage.set(1);
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.updatePaginatedData();
    this.cdr.markForCheck();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.updatePaginatedData();
    this.cdr.markForCheck();
  }

  get totalPages(): number {
    return Math.ceil(this.totalElements() / this.pageSize());
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.currentPage();
    const pages: number[] = [];

    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);

    if (end - start < 4) {
      if (start === 1) {
        end = Math.min(total, start + 4);
      } else {
        start = Math.max(1, end - 4);
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  openCreateModal(): void {
    this.selectedEducationId = null;
    this.selectedCourseId = null;
    this.educationSearch.set('');
    this.courseSearch.set('');
    this.educationDropdownOpen = false;
    this.courseDropdownOpen = false;
    this.educationTouched = false;
    this.courseTouched = false;
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.selectedEducationId = null;
    this.selectedCourseId = null;
    this.educationSearch.set('');
    this.courseSearch.set('');
    this.educationDropdownOpen = false;
    this.courseDropdownOpen = false;
  }

  getFilteredEducations(): Education[] {
    const search = this.educationSearch().toLowerCase();
    if (!search) return this.educations();
    return this.educations().filter(
      (e) =>
        e.education_name.toLowerCase().includes(search) ||
        e.education_code.toLowerCase().includes(search),
    );
  }

  getFilteredCourses(): Course[] {
    const search = this.courseSearch().toLowerCase();
    if (!search) return this.courses();
    return this.courses().filter(
      (c) =>
        c.course_name.toLowerCase().includes(search) ||
        c.course_code.toLowerCase().includes(search),
    );
  }

  onEducationSearch(event: any): void {
    this.educationSearch.set(event.target.value);
    this.educationDropdownOpen = true;
    const filtered = this.getFilteredEducations();
    if (filtered.length === 1 && event.target.value) {
      this.selectedEducationId = filtered[0].id!;
    }
  }

  onCourseSearch(event: any): void {
    this.courseSearch.set(event.target.value);
    this.courseDropdownOpen = true;
    const filtered = this.getFilteredCourses();
    if (filtered.length === 1 && event.target.value) {
      this.selectedCourseId = filtered[0].id!;
    }
  }

  selectEducation(edu: Education): void {
    this.selectedEducationId = edu.id!;
    this.educationSearch.set('');
    this.educationDropdownOpen = false;
    this.educationTouched = true;
    this.cdr.markForCheck();
  }

  selectCourse(course: Course): void {
    this.selectedCourseId = course.id!;
    this.courseSearch.set('');
    this.courseDropdownOpen = false;
    this.courseTouched = true;
    this.cdr.markForCheck();
  }

  onEducationBlur(): void {
    setTimeout(() => {
      this.educationDropdownOpen = false;
      this.educationTouched = true;
      this.cdr.markForCheck();
    }, 200);
  }

  onCourseBlur(): void {
    setTimeout(() => {
      this.courseDropdownOpen = false;
      this.courseTouched = true;
      this.cdr.markForCheck();
    }, 200);
  }

  getEducationDisplay(): string {
    if (!this.selectedEducationId) return '';
    const edu = this.educations().find((e) => e.id === this.selectedEducationId);
    return edu ? `${edu.education_name} (${edu.education_code})` : '';
  }

  getCourseDisplay(): string {
    if (!this.selectedCourseId) return '';
    const course = this.courses().find((c) => c.id === this.selectedCourseId);
    return course ? `${course.course_name} (${course.course_code})` : '';
  }

  onSubmitForm(form: any): void {
    if (!form.valid) {
      this.toasterService.error('Validation Error', 'Please select both education and course');
      return;
    }

    if (!this.selectedEducationId || !this.selectedCourseId) {
      this.toasterService.error('Validation Error', 'Please select both education and course');
      return;
    }

    this.isSubmitting.set(true);
    const formData = {
      education_id: Number(this.selectedEducationId),
      course_id: Number(this.selectedCourseId),
    };

    this.mappingService.createMapping(formData).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        if (response.success) {
          this.toasterService.success('Success', 'Mapping created successfully');
          this.closeCreateModal();
          this.loadMappings();
        } else {
          this.toasterService.error('Error', response.message);
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.toasterService.error('Error', error.error?.message || 'Failed to create mapping');
        this.cdr.markForCheck();
      },
    });
  }

  async onDelete(mapping: EducationCourseMapping): Promise<void> {
    const confirmed = await this.modalService.confirm(
      'Delete Mapping',
      `Are you sure you want to delete the mapping between "${mapping.education_name}" and "${mapping.course_name}"?`,
    );

    if (confirmed) {
      this.isLoading.set(true);
      this.mappingService.deleteMapping(mapping.id!).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          if (response.success) {
            this.toasterService.success('Success', 'Mapping deleted successfully');
            this.loadMappings();
          } else {
            this.toasterService.error('Error', response.message);
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.isLoading.set(false);
          this.toasterService.error('Error', error.error?.message || 'Failed to delete mapping');
          this.cdr.markForCheck();
        },
      });
    }
  }
}
