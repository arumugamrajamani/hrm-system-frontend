import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { CourseService } from '../../services/course.service';
import { ToasterService } from '../../../core/services';
import { Course } from '../../models';

@Component({
  selector: 'app-course-form',
  standalone: false,
  templateUrl: './course-form.component.html',
  styleUrls: ['./course-form.component.scss'],
})
export class CourseFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  courseForm = signal<FormGroup>({} as FormGroup);
  course = signal<Course | null>(null);

  isEditMode = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  courseId = signal<number>(0);

  private globalError = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private toasterService: ToasterService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initForm();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.courseId.set(id);
      this.loadCourse(id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    const form = this.fb.group({
      course_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      course_code: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(20),
          Validators.pattern(/^[A-Za-z0-9-_]+$/),
        ],
      ],
      description: ['', Validators.maxLength(1000)],
      status: ['active'],
    });

    this.courseForm.set(form);
  }

  loadCourse(id: number): void {
    this.courseService.getCourseById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.course.set(response.data);
          this.courseForm().patchValue({
            course_name: response.data.course_name,
            course_code: response.data.course_code,
            description: response.data.description || '',
            status: response.data.status,
          });
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.toasterService.error('Error', error.error?.message || 'Failed to load course');
        this.cdr.markForCheck();
      },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.courseForm().get(fieldName);
    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched || field.errors?.['serverError'])
    );
  }

  isFormValid(): boolean {
    return this.courseForm().valid;
  }

  onSubmit(): void {
    const form = this.courseForm();

    Object.keys(form.controls).forEach((key) => {
      form.get(key)?.markAsTouched();
    });

    if (form.invalid) {
      this.toasterService.error('Validation Error', 'Please fix the form errors before submitting');
      this.cdr.markForCheck();
      return;
    }

    this.isSubmitting.set(true);
    const formData = { ...form.value };

    if (this.isEditMode()) {
      this.courseService.updateCourse(this.courseId(), formData).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          if (response.success) {
            this.toasterService.success('Success', 'Course updated successfully');
            this.router.navigate(['/courses/list']);
          } else {
            this.handleError(response);
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.handleError(error);
          this.cdr.markForCheck();
        },
      });
    } else {
      this.courseService.createCourse(formData).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          if (response.success) {
            this.toasterService.success('Success', 'Course created successfully');
            this.router.navigate(['/courses/list']);
          } else {
            this.handleError(response);
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.handleError(error);
          this.cdr.markForCheck();
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/courses/list']);
  }

  private handleError(error: any): void {
    let errorMessage = error.error?.message || 'An unexpected error occurred';

    if (error.error?.errors && Array.isArray(error.error.errors)) {
      const errors = error.error.errors;
      if (errors.length > 0) {
        errorMessage = errors[0].message || errorMessage;
        const fieldName = errors[0].field;
        if (fieldName) {
          const field = this.courseForm().get(fieldName);
          if (field) {
            field.setErrors({ serverError: errors[0].message });
          }
        }
      }
    }

    this.globalError.set(errorMessage);
    this.toasterService.error('Error', errorMessage);
  }

  hasGlobalError(): boolean {
    return this.globalError() !== '';
  }

  getGlobalError(): string {
    return this.globalError();
  }

  clearGlobalError(): void {
    this.globalError.set('');
  }
}
