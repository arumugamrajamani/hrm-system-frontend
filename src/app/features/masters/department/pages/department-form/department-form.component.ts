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
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { DepartmentStore } from '../../services/department.store';
import { Department } from '../../models/department.model';
import { ToasterService } from '../../../../../core/services';

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
        <div class="col-auto">
          <button class="btn btn-secondary" (click)="onCancel()">
            <i class="fas fa-arrow-left me-2"></i>
            Back
          </button>
        </div>
      </div>

      @if (hasGlobalError()) {
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          <i class="fas fa-exclamation-circle me-2"></i>
          {{ getGlobalError() }}
          <button type="button" class="btn-close" (click)="clearGlobalError()"></button>
        </div>
      }

      <div class="card shadow-sm">
        <div class="card-body">
          @if (isLoading()) {
            <div class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          }

          <form [formGroup]="departmentForm()" (ngSubmit)="onSubmit()">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="department_name" class="form-label">
                  Department Name <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="department_name"
                  formControlName="department_name"
                  [class.is-invalid]="isFieldInvalid('department_name')"
                  placeholder="Enter department name"
                />
                @if (isFieldInvalid('department_name')) {
                  <div class="invalid-feedback d-block">
                    @if (hasError('department_name', 'required')) {
                      Department name is required
                    } @else if (hasError('department_name', 'minlength')) {
                      Department name must be at least 2 characters
                    } @else if (hasError('department_name', 'maxlength')) {
                      Department name cannot exceed 100 characters
                    } @else if (hasError('department_name', 'serverError')) {
                      {{ getErrorMessage('department_name') }}
                    }
                  </div>
                }
              </div>

              <div class="col-md-6 mb-3">
                <label for="department_code" class="form-label">
                  Department Code <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="department_code"
                  formControlName="department_code"
                  [class.is-invalid]="isFieldInvalid('department_code')"
                  placeholder="e.g., DEPT001"
                />
                @if (isFieldInvalid('department_code')) {
                  <div class="invalid-feedback d-block">
                    @if (hasError('department_code', 'required')) {
                      Department code is required
                    } @else if (hasError('department_code', 'minlength')) {
                      Department code must be at least 2 characters
                    } @else if (hasError('department_code', 'maxlength')) {
                      Department code cannot exceed 20 characters
                    } @else if (hasError('department_code', 'pattern')) {
                      Department code can only contain letters, numbers, hyphens, and underscores
                    } @else if (hasError('department_code', 'serverError')) {
                      {{ getErrorMessage('department_code') }}
                    }
                  </div>
                }
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="parent_department_id" class="form-label">Parent Department</label>
                <select
                  class="form-select"
                  id="parent_department_id"
                  formControlName="parent_department_id"
                  [class.is-invalid]="isFieldInvalid('parent_department_id')"
                >
                  <option [ngValue]="null">No Parent (Root Department)</option>
                  @for (dept of availableParentDepartments(); track dept.id) {
                    @if (dept.id !== editingId()) {
                      <option [ngValue]="dept.id">{{ dept.name }}</option>
                    }
                  }
                </select>
              </div>

              <div class="col-md-6 mb-3">
                <label for="status" class="form-label">Status</label>
                <select class="form-select" id="status" formControlName="status">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div class="mb-3">
              <label for="description" class="form-label">Description</label>
              <textarea
                class="form-control"
                id="description"
                formControlName="description"
                rows="3"
                placeholder="Enter department description (optional)"
                [class.is-invalid]="isFieldInvalid('description')"
              ></textarea>
              @if (isFieldInvalid('description') && hasError('description', 'maxlength')) {
                <div class="invalid-feedback d-block">
                  Description cannot exceed 1000 characters
                </div>
              }
            </div>

            <div class="d-flex gap-2">
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="isSubmitting() || !isFormValid()"
              >
                @if (isSubmitting()) {
                  <span class="spinner-border spinner-border-sm me-2"></span>
                }
                @if (isSubmitting()) {
                  Processing...
                } @else {
                  {{ isEditMode() ? 'Update' : 'Create' }} Department
                }
              </button>
              <button type="button" class="btn btn-secondary" (click)="onCancel()">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class DepartmentFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  departmentForm = signal<FormGroup>({} as FormGroup);
  availableParentDepartments = signal<Department[]>([]);

  isEditMode = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  editingId = signal<number>(0);

  private globalError = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: DepartmentStore,
    private toasterService: ToasterService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadParentDepartments();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.editingId.set(id);
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
      status: ['active'],
      description: ['', Validators.maxLength(1000)],
    });

    this.departmentForm.set(form);
  }

  loadParentDepartments(): void {
    this.store.loadDepartments({ limit: 100, page: 1 });
    setTimeout(() => {
      this.availableParentDepartments.set(this.store.departments());
      this.cdr.markForCheck();
    }, 500);
  }

  loadDepartment(id: number): void {
    this.isLoading.set(true);
    this.store.loadById(id);

    setTimeout(() => {
      const dept = this.store.selectedDepartment();
      if (dept) {
        this.departmentForm().patchValue({
          department_name: dept.name,
          department_code: dept.code,
          parent_department_id: dept.parentId || null,
          status: dept.status,
          description: dept.description || '',
        });
      }
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }, 500);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.departmentForm().get(fieldName);
    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched || field.errors?.['serverError'])
    );
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.departmentForm().get(fieldName);
    return !!(field && field.hasError(errorType));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.departmentForm().get(fieldName);
    if (field?.errors?.['serverError']) {
      return field.errors['serverError'];
    }
    return '';
  }

  isFormValid(): boolean {
    return this.departmentForm().valid;
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

    if (this.isEditMode()) {
      this.store.update(this.editingId(), formData).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          if (response?.success) {
            this.toasterService.success('Success', 'Department updated successfully');
            this.router.navigate(['/masters/departments/list']);
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
      this.store.create(formData).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          if (response?.success) {
            this.toasterService.success('Success', 'Department created successfully');
            this.router.navigate(['/masters/departments/list']);
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
    this.router.navigate(['/masters/departments/list']);
  }

  private handleError(error: any): void {
    let errorMessage = error?.error?.message || error?.message || 'An unexpected error occurred';

    if (error?.error?.errors && Array.isArray(error.error.errors)) {
      const errors = error.error.errors;
      if (errors.length > 0) {
        errorMessage = errors[0].message || errorMessage;
        const fieldName = this.mapApiFieldToFormField(errors[0].field);
        if (fieldName) {
          const field = this.departmentForm().get(fieldName);
          if (field) {
            field.setErrors({ serverError: errors[0].message });
          }
        }
      }
    }

    this.globalError.set(errorMessage);
    this.toasterService.error('Error', errorMessage);
  }

  private mapApiFieldToFormField(apiField: string): string | null {
    const fieldMapping: Record<string, string> = {
      name: 'department_name',
      code: 'department_code',
      parent_id: 'parent_department_id',
      description: 'description',
      status: 'status',
    };
    return fieldMapping[apiField] || null;
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
