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
import { Subject, takeUntil } from 'rxjs';
import { DepartmentService } from '../../services/department.service';
import { ToasterService } from '../../../core/services';
import { Department } from '../../models/department.model';

@Component({
  selector: 'app-department-form',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-building me-2"></i>
            {{ isEditMode() ? 'Edit Department' : 'Add Department' }}
          </h2>
        </div>
      </div>

      <div class="row">
        <div class="col-lg-8">
          <div class="card shadow-sm">
            <div class="card-body">
              @if (hasGlobalError()) {
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  <strong>Error:</strong> {{ getGlobalError() }}
                  <button type="button" class="btn-close" (click)="clearGlobalError()"></button>
                </div>
              }

              <form [formGroup]="departmentForm()" (ngSubmit)="onSubmit()">
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label for="departmentName" class="form-label">
                      Department Name <span class="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="departmentName"
                      formControlName="department_name"
                      [class.is-invalid]="isFieldInvalid('department_name')"
                      placeholder="Enter department name"
                    />
                    @if (isFieldInvalid('department_name')) {
                      <div class="invalid-feedback d-block">
                        @if (departmentForm().get('department_name')?.errors?.['required']) {
                          Department name is required
                        } @else if (
                          departmentForm().get('department_name')?.errors?.['minlength']
                        ) {
                          Department name must be at least 2 characters
                        } @else if (
                          departmentForm().get('department_name')?.errors?.['serverError']
                        ) {
                          <i class="fas fa-exclamation-circle me-1"></i>
                          {{ departmentForm().get('department_name')?.errors?.['serverError'] }}
                        }
                      </div>
                    }
                  </div>

                  <div class="col-md-6">
                    <label for="departmentCode" class="form-label">
                      Department Code <span class="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="departmentCode"
                      formControlName="department_code"
                      [class.is-invalid]="isFieldInvalid('department_code')"
                      placeholder="e.g., DEPT001"
                    />
                    @if (isFieldInvalid('department_code')) {
                      <div class="invalid-feedback d-block">
                        @if (departmentForm().get('department_code')?.errors?.['required']) {
                          Department code is required
                        } @else if (departmentForm().get('department_code')?.errors?.['pattern']) {
                          Department code can only contain letters, numbers, and hyphens
                        } @else if (
                          departmentForm().get('department_code')?.errors?.['serverError']
                        ) {
                          <i class="fas fa-exclamation-circle me-1"></i>
                          {{ departmentForm().get('department_code')?.errors?.['serverError'] }}
                        }
                      </div>
                    }
                  </div>
                </div>

                <div class="row mb-3">
                  <div class="col-md-6">
                    <label for="parentDepartment" class="form-label">Parent Department</label>
                    <select
                      class="form-select"
                      id="parentDepartment"
                      formControlName="parent_department_id"
                      [class.is-invalid]="isFieldInvalid('parent_department_id')"
                    >
                      <option [ngValue]="null">No Parent (Root Department)</option>
                      @if (rootDepartments().length > 0) {
                        @for (dept of rootDepartments(); track dept.id) {
                          <option [ngValue]="dept.id">
                            {{ dept.department_name }} ({{ dept.department_code }})
                          </option>
                        }
                      } @else {
                        <option disabled>No root departments available</option>
                      }
                    </select>
                    @if (isFieldInvalid('parent_department_id')) {
                      <div class="invalid-feedback d-block">Cannot select self as parent</div>
                    }
                    <small class="form-text text-muted">
                      Only root departments (without parent) can be selected
                    </small>
                    <div class="form-text text-muted">
                      Available options: {{ rootDepartments().length }}
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label for="status" class="form-label">Status</label>
                    <div class="form-check form-switch mt-2">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        id="status"
                        formControlName="status"
                        (change)="onStatusChange($event)"
                      />
                      <label class="form-check-label" for="status">
                        {{
                          departmentForm().get('status')?.value === 'active' ? 'Active' : 'Inactive'
                        }}
                      </label>
                    </div>
                    <small class="form-text text-muted">
                      Inactive departments won't appear in active lists
                    </small>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="description" class="form-label">Description</label>
                  <textarea
                    class="form-control"
                    id="description"
                    formControlName="description"
                    rows="4"
                    placeholder="Enter department description (optional)"
                  ></textarea>
                </div>

                <div class="d-flex gap-2">
                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="!isFormValid() || isSubmitting()"
                  >
                    @if (isSubmitting()) {
                      <span class="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    } @else {
                      <i class="fas fa-save me-2"></i>
                      {{ isEditMode() ? 'Update' : 'Create' }} Department
                    }
                  </button>
                  <button type="button" class="btn btn-secondary" (click)="onCancel()">
                    <i class="fas fa-times me-2"></i>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card shadow-sm">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-info-circle me-2"></i>
                Help
              </h5>
            </div>
            <div class="card-body">
              <ul class="list-unstyled">
                <li class="mb-3">
                  <i class="fas fa-check-circle text-success me-2"></i>
                  Department name is required and must be unique
                </li>
                <li class="mb-3">
                  <i class="fas fa-check-circle text-success me-2"></i>
                  Department code must be unique (e.g., DEPT001)
                </li>
                <li class="mb-3">
                  <i class="fas fa-check-circle text-success me-2"></i>
                  Select a parent department to create hierarchy
                </li>
                <li class="mb-3">
                  <i class="fas fa-check-circle text-success me-2"></i>
                  Active departments are visible in the system
                </li>
              </ul>
            </div>
          </div>

          @if (isEditMode() && department()) {
            <div class="card shadow-sm mt-3">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="fas fa-history me-2"></i>
                  Department Info
                </h5>
              </div>
              <div class="card-body">
                <p class="mb-2"><strong>ID:</strong> {{ department()?.id }}</p>
                <p class="mb-2">
                  <strong>Created:</strong> {{ department()?.created_at | date: 'medium' }}
                </p>
                <p class="mb-0">
                  <strong>Updated:</strong> {{ department()?.updated_at | date: 'medium' }}
                </p>
              </div>
            </div>
          }
        </div>
      </div>
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

      .form-label {
        font-weight: 500;
        color: #495057;
        margin-bottom: 0.5rem;
      }

      .form-control:focus,
      .form-select:focus {
        border-color: #0d6efd;
        box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
      }

      .form-switch .form-check-input {
        width: 3em;
        height: 1.5em;
        cursor: pointer;
      }

      .form-switch .form-check-input:checked {
        background-color: #28a745;
        border-color: #28a745;
      }

      .invalid-feedback {
        display: block;
        width: 100%;
        margin-top: 0.25rem;
        font-size: 0.875em;
        color: #dc3545;
      }

      .invalid-feedback.server-error {
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 0.25rem;
        padding: 0.5rem 0.75rem;
        color: #721c24;
        margin-top: 0.5rem;
      }

      .invalid-feedback i {
        color: #dc3545;
      }

      .alert {
        border-radius: 0.375rem;
        margin-bottom: 1.5rem;
      }

      .alert-danger {
        background-color: #f8d7da;
        border-color: #f5c2c5;
        color: #842029;
      }

      .btn-close {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
      }

      .card-header {
        background-color: #f8f9fa;
        border-bottom: 2px solid #e9ecef;
        font-weight: 500;
      }

      .btn:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      .list-unstyled li {
        font-size: 0.9rem;
        color: #6c757d;
      }

      .form-text {
        font-size: 0.875rem;
        color: #6c757d;
        margin-top: 0.25rem;
      }
    `,
  ],
})
export class DepartmentFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  departmentForm = signal<FormGroup>({} as FormGroup);
  department = signal<Department | null>(null);
  rootDepartments = signal<Department[]>([]);

  isEditMode = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  departmentId = signal<number>(0);

  private globalError = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private toasterService: ToasterService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRootDepartments();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.departmentId.set(id);
      this.loadDepartment(id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    const form = this.fb.group({
      department_name: [
        '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      ],
      department_code: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(20),
          Validators.pattern(/^[A-Za-z0-9-_]+$/),
        ],
      ],
      parent_department_id: [null],
      description: ['', Validators.maxLength(500)],
      status: ['active'],
    });

    this.departmentForm.set(form);
  }

  loadRootDepartments(): void {
    // Use the new method that gets root departments from hierarchy endpoint
    this.departmentService.getRootDepartmentsForDropdown().subscribe({
      next: (departments) => {
        console.log('Root departments loaded:', departments);
        this.rootDepartments.set(departments);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading root departments:', error);
        this.rootDepartments.set([]);
        this.cdr.markForCheck();
      },
    });
  }

  loadDepartment(id: number): void {
    this.departmentService.getDepartment(id).subscribe((dept) => {
      if (dept) {
        this.department.set(dept);

        const rootDepts = this.rootDepartments().filter((d) => d.id !== id);
        this.rootDepartments.set(rootDepts);

        this.departmentForm().patchValue({
          department_name: dept.department_name,
          department_code: dept.department_code,
          parent_department_id: dept.parent_department_id || null,
          description: dept.description || '',
          status: dept.status,
        });

        this.cdr.markForCheck();
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.departmentForm().get(fieldName);
    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched || field.errors?.['serverError'])
    );
  }

  isFormValid(): boolean {
    const form = this.departmentForm();
    return form.valid;
  }

  onStatusChange(event: any): void {
    const checked = event.target.checked;
    this.departmentForm().patchValue({
      status: checked ? 'active' : 'inactive',
    });
  }

  onSubmit(): void {
    const form = this.departmentForm();

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

    if (formData.status === 'active' || formData.status === true) {
      formData.status = 'active';
    } else {
      formData.status = 'inactive';
    }

    if (this.isEditMode()) {
      this.departmentService.updateDepartment(this.departmentId(), formData).subscribe({
        next: (result) => {
          this.isSubmitting.set(false);
          if (result) {
            this.toasterService.success('Success', 'Department updated successfully');
            this.router.navigate(['/department/list']);
          } else {
            this.toasterService.error(
              'Update Failed',
              'Failed to update department. Please try again.',
            );
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.handleError(error, form);
          this.cdr.markForCheck();
        },
      });
    } else {
      this.departmentService.createDepartment(formData).subscribe({
        next: (result) => {
          this.isSubmitting.set(false);
          if (result) {
            this.toasterService.success('Success', 'Department created successfully');
            this.router.navigate(['/department/list']);
          } else {
            this.toasterService.error(
              'Create Failed',
              'Failed to create department. Please try again.',
            );
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.handleError(error, form);
          this.cdr.markForCheck();
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/department/list']);
  }

  private handleError(error: any, form: FormGroup): void {
    // Clear previous server errors
    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      if (control?.errors?.['serverError']) {
        const errors = { ...control.errors };
        delete errors['serverError'];
        control.setErrors(Object.keys(errors).length ? errors : null);
      }
    });

    // Clear global error
    this.globalError.set('');

    // Try to extract error message from various possible structures
    let errorMessage = 'An unexpected error occurred. Please try again.';

    // Handle array format: [{ field: "parent_department_id", message: "..." }]
    if (error.error?.errors && Array.isArray(error.error.errors)) {
      const errors = error.error.errors;
      if (errors.length > 0) {
        const firstError = errors[0];
        errorMessage = firstError.message || errorMessage;

        // Map field to form control
        const fieldName = firstError.field;
        if (fieldName) {
          if (fieldName.includes('name') || fieldName === 'department_name') {
            form.get('department_name')?.setErrors({ serverError: firstError.message });
          } else if (fieldName.includes('code') || fieldName === 'department_code') {
            form.get('department_code')?.setErrors({ serverError: firstError.message });
          } else if (fieldName === 'parent_department_id') {
            form.get('parent_department_id')?.setErrors({ serverError: firstError.message });
          } else if (fieldName === 'description') {
            form.get('description')?.setErrors({ serverError: firstError.message });
          }
        }
      }
    } else if (error.error?.message) {
      // Direct message property
      errorMessage = error.error.message;
    } else if (error.error?.errors) {
      // Validation errors object - get first error
      const errors = error.error.errors;
      if (typeof errors === 'object' && !Array.isArray(errors)) {
        const firstKey = Object.keys(errors)[0];
        if (firstKey) {
          const fieldError = errors[firstKey];
          errorMessage = Array.isArray(fieldError) ? fieldError[0] : fieldError;

          // Also show error on the specific field
          if (firstKey.includes('name') || firstKey === 'department_name') {
            form.get('department_name')?.setErrors({ serverError: errorMessage });
          } else if (firstKey.includes('code') || firstKey === 'department_code') {
            form.get('department_code')?.setErrors({ serverError: errorMessage });
          } else if (firstKey === 'parent_department_id') {
            form.get('parent_department_id')?.setErrors({ serverError: errorMessage });
          } else if (firstKey === 'description') {
            form.get('description')?.setErrors({ serverError: errorMessage });
          }
        }
      } else if (Array.isArray(errors)) {
        errorMessage = errors[0];
      }
    } else if (error.message) {
      // Fallback to error.message
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // Set global error for display
    this.globalError.set(errorMessage);

    // Show toast notification with the exact error message
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
