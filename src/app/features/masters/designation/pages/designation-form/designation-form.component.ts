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
import { DesignationStore } from '../../services/designation.store';
import { Designation } from '../../models/designation.model';
import { DepartmentStore } from '../../../department/services/department.store';
import { Department } from '../../../department/models/department.model';
import { ToasterService } from '../../../../../core/services';

@Component({
  selector: 'app-designation-form',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-briefcase me-2"></i>
            {{ isEditMode() ? 'Edit Designation' : 'Add Designation' }}
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

      <div class="row">
        <div class="col-md-8">
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">
                <i class="fas fa-briefcase me-2"></i>
                Designation Information
              </h5>
            </div>
            <div class="card-body position-relative">
              @if (isLoading()) {
                <div
                  class="position-absolute top-0 start-0 end-0 bottom-0 bg-white bg-opacity-75 d-flex align-items-center justify-content-center z-3"
                  style="border-radius: 0.5rem;"
                >
                  <div class="text-center">
                    <div class="spinner-border text-primary mb-2" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="text-muted mb-0">Loading designation...</p>
                  </div>
                </div>
              }

              <form
                [formGroup]="designationForm()"
                (ngSubmit)="onSubmit()"
                [ngClass]="{ 'opacity-50': isLoading() }"
              >
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="designation_name" class="form-label">
                      Designation Name <span class="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="designation_name"
                      formControlName="designation_name"
                      [class.is-invalid]="isFieldInvalid('designation_name')"
                      placeholder="Enter designation name"
                    />
                    @if (isFieldInvalid('designation_name')) {
                      <div class="invalid-feedback d-block">
                        @if (hasError('designation_name', 'required')) {
                          Designation name is required
                        } @else if (hasError('designation_name', 'minlength')) {
                          Designation name must be at least 2 characters
                        } @else if (hasError('designation_name', 'maxlength')) {
                          Designation name cannot exceed 100 characters
                        } @else if (hasError('designation_name', 'serverError')) {
                          {{ getErrorMessage('designation_name') }}
                        }
                      </div>
                    }
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="designation_code" class="form-label">
                      Designation Code
                      <button
                        type="button"
                        class="btn btn-sm btn-link p-0 ms-2"
                        (click)="generateCode()"
                        title="Generate Code"
                      >
                        <i class="fas fa-magic"></i>
                      </button>
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="designation_code"
                      formControlName="designation_code"
                      [class.is-invalid]="isFieldInvalid('designation_code')"
                      placeholder="e.g., DES001"
                    />
                    <small class="form-text text-muted">Auto-generated if left empty</small>
                    @if (isFieldInvalid('designation_code')) {
                      <div class="invalid-feedback d-block">
                        @if (hasError('designation_code', 'pattern')) {
                          Code can only contain letters, numbers, hyphens, and underscores
                        } @else if (hasError('designation_code', 'serverError')) {
                          {{ getErrorMessage('designation_code') }}
                        }
                      </div>
                    }
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="department_id" class="form-label">Department</label>
                    <select class="form-select" id="department_id" formControlName="department_id">
                      <option [ngValue]="null">No Department</option>
                      @for (dept of departments(); track dept.id) {
                        <option [ngValue]="dept.id">{{ dept.name }} ({{ dept.code }})</option>
                      }
                    </select>
                    <small class="form-text text-muted">
                      Select a department for this designation (optional)
                    </small>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="grade_level" class="form-label">Grade Level</label>
                    <input
                      type="number"
                      class="form-control"
                      id="grade_level"
                      formControlName="grade_level"
                      placeholder="e.g., 1-20"
                      min="1"
                      max="20"
                    />
                    <small class="form-text text-muted">Enter grade level (1-20)</small>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="description" class="form-label">Description</label>
                  <textarea
                    class="form-control"
                    id="description"
                    formControlName="description"
                    rows="3"
                    placeholder="Enter designation description (optional)"
                    [class.is-invalid]="isFieldInvalid('description')"
                  ></textarea>
                  @if (isFieldInvalid('description') && hasError('description', 'maxlength')) {
                    <div class="invalid-feedback d-block">
                      Description cannot exceed 1000 characters
                    </div>
                  }
                </div>

                <div class="mb-4">
                  <label for="status" class="form-label">Status</label>
                  <select class="form-select" id="status" formControlName="status">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div class="d-flex gap-2">
                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="
                      isSubmitting() || !isFormValid() || (isEditMode() && !isDataLoaded())
                    "
                  >
                    @if (isSubmitting()) {
                      <span class="spinner-border spinner-border-sm me-2"></span>
                      Processing...
                    } @else if (isEditMode() && !isDataLoaded()) {
                      <span class="spinner-border spinner-border-sm me-2"></span>
                      Loading...
                    } @else {
                      <i class="fas fa-save me-2"></i>
                      {{ isEditMode() ? 'Update' : 'Create' }} Designation
                    }
                  </button>
                  <button type="button" class="btn btn-secondary" (click)="onCancel()">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card shadow-sm sticky-top" style="top: 20px;">
            <div class="card-header bg-light">
              <h5 class="mb-0">
                <i class="fas fa-lightbulb me-2"></i>
                Tips
              </h5>
            </div>
            <div class="card-body">
              <ul class="list-unstyled mb-0">
                <li class="mb-3">
                  <i class="fas fa-check text-success me-2"></i>
                  <small>Use clear titles like "Software Engineer" or "Senior Manager"</small>
                </li>
                <li class="mb-3">
                  <i class="fas fa-check text-success me-2"></i>
                  <small>Designation codes are auto-generated if not provided</small>
                </li>
                <li class="mb-3">
                  <i class="fas fa-check text-success me-2"></i>
                  <small>Assign departments to organize designations</small>
                </li>
                <li class="mb-3">
                  <i class="fas fa-layer-group text-info me-2"></i>
                  <small>Use grade levels to define hierarchy (1 = lowest, 20 = highest)</small>
                </li>
                <li class="mb-0">
                  <i class="fas fa-toggle-on text-success me-2"></i>
                  <small>Only active designations can be assigned to employees</small>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-title {
        font-weight: 600;
        color: #2c3e50;
      }
      .card {
        border: none;
        border-radius: 0.5rem;
      }
      .form-label {
        font-weight: 500;
        color: #495057;
      }
    `,
  ],
})
export class DesignationFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  designationForm = signal<FormGroup>({} as FormGroup);
  departments = signal<Department[]>([]);

  isEditMode = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isDataLoaded = signal<boolean>(false);
  editingId = signal<number>(0);

  private globalError = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: DesignationStore,
    private departmentStore: DepartmentStore,
    private toasterService: ToasterService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadDepartments();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.editingId.set(id);
      this.loadDesignation(id);
    } else {
      this.isDataLoaded.set(true);
    }
  }

  private loadDepartments(): void {
    this.departmentStore.loadDepartments({ limit: 1000 });
    setTimeout(() => {
      this.departments.set(this.departmentStore.departments());
      this.cdr.markForCheck();
    }, 500);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    const form = this.fb.group({
      designation_name: [
        '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      ],
      designation_code: ['', [Validators.pattern(/^[A-Za-z0-9-_]*$/)]],
      department_id: [null],
      grade_level: [null, [Validators.min(1), Validators.max(20)]],
      description: ['', Validators.maxLength(1000)],
      status: ['active'],
    });

    this.designationForm.set(form);

    // Don't validate until data is loaded
    if (this.isEditMode()) {
      form.markAsPristine();
      form.markAsUntouched();
    }
  }

  loadDesignation(id: number): void {
    this.isLoading.set(true);
    this.isDataLoaded.set(false);
    this.store.loadById(id);

    let attempts = 0;
    const maxAttempts = 20;

    const checkDesignation = setInterval(() => {
      attempts++;
      const des = this.store.selectedDesignation();
      const hasError = this.store.error();

      if (des && des.id === Number(id)) {
        clearInterval(checkDesignation);
        this.isDataLoaded.set(true);

        // Mark form as pristine before patching to avoid validation errors
        this.designationForm().markAsPristine();
        this.designationForm().markAsUntouched();

        this.designationForm().patchValue(
          {
            designation_name: des.name,
            designation_code: des.code,
            department_id: des.departmentId || null,
            grade_level: des.gradeLevel || null,
            description: des.description || '',
            status: des.status,
          },
          { emitEvent: false },
        );

        this.isLoading.set(false);
        this.cdr.markForCheck();
      } else if (hasError || attempts >= maxAttempts) {
        clearInterval(checkDesignation);
        this.isLoading.set(false);
        this.isDataLoaded.set(true);
        if (hasError) {
          this.globalError.set(hasError);
          this.toasterService.error('Error', hasError);
        }
        this.cdr.markForCheck();
      }
    }, 200);
  }

  generateCode(): void {
    this.store.generateCode().subscribe({
      next: (response) => {
        if (response?.success && response.data?.designation_code) {
          this.designationForm().patchValue({
            designation_code: response.data.designation_code,
          });
          this.toasterService.success(
            'Code Generated',
            `Generated code: ${response.data.designation_code}`,
          );
        }
      },
      error: (err) => {
        this.toasterService.error('Error', 'Failed to generate code');
      },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    if (!this.isDataLoaded()) {
      return false;
    }
    const field = this.designationForm().get(fieldName);
    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched || field.errors?.['serverError'])
    );
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.designationForm().get(fieldName);
    return !!(field && field.hasError(errorType));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.designationForm().get(fieldName);
    if (field?.errors?.['serverError']) {
      return field.errors['serverError'];
    }
    return '';
  }

  isFormValid(): boolean {
    return this.designationForm().valid;
  }

  onSubmit(): void {
    if (this.isEditMode() && !this.isDataLoaded()) {
      this.toasterService.error('Error', 'Please wait for data to load');
      return;
    }

    const form = this.designationForm();

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

    if (formData.department_id === null) {
      delete formData.department_id;
    }
    if (formData.grade_level === null) {
      delete formData.grade_level;
    }

    if (this.isEditMode()) {
      this.store.update(this.editingId(), formData).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          if (response?.success) {
            this.toasterService.success('Success', 'Designation updated successfully');
            this.router.navigate(['/masters/designations/list']);
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
            this.toasterService.success('Success', 'Designation created successfully');
            this.router.navigate(['/masters/designations/list']);
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
    this.router.navigate(['/masters/designations/list']);
  }

  private handleError(error: any): void {
    let errorMessage = error?.error?.message || error?.message || 'An unexpected error occurred';

    if (error?.error?.errors && Array.isArray(error.error.errors)) {
      const errors = error.error.errors;
      if (errors.length > 0) {
        errorMessage = errors[0].message || errorMessage;
        const fieldName = this.mapApiFieldToFormField(errors[0].field);
        if (fieldName) {
          const field = this.designationForm().get(fieldName);
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
      name: 'designation_name',
      code: 'designation_code',
      department_id: 'department_id',
      grade_level: 'grade_level',
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
