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
import { EmploymentTypeStore } from '../../services/employment-type.store';
import { EmploymentType } from '../../models/employment-type.model';
import { ToasterService } from '../../../../../core/services';

@Component({
  selector: 'app-employment-type-form',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-briefcase me-2"></i>
            {{ isEditMode() ? 'Edit Employment Type' : 'Add Employment Type' }}
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

          <form [formGroup]="employmentTypeForm()" (ngSubmit)="onSubmit()">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="name" class="form-label">
                  Employment Type Name <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="name"
                  formControlName="name"
                  [class.is-invalid]="isFieldInvalid('name')"
                  placeholder="Enter employment type name"
                />
                @if (isFieldInvalid('name')) {
                  <div class="invalid-feedback d-block">
                    @if (hasError('name', 'required')) {
                      Employment type name is required
                    } @else if (hasError('name', 'minlength')) {
                      Employment type name must be at least 2 characters
                    } @else if (hasError('name', 'maxlength')) {
                      Employment type name cannot exceed 100 characters
                    } @else if (hasError('name', 'serverError')) {
                      {{ getErrorMessage('name') }}
                    }
                  </div>
                }
              </div>

              <div class="col-md-6 mb-3">
                <label for="code" class="form-label">
                  Code <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="code"
                  formControlName="code"
                  [class.is-invalid]="isFieldInvalid('code')"
                  placeholder="e.g., FULLTIME"
                />
                @if (isFieldInvalid('code')) {
                  <div class="invalid-feedback d-block">
                    @if (hasError('code', 'required')) {
                      Code is required
                    } @else if (hasError('code', 'minlength')) {
                      Code must be at least 2 characters
                    } @else if (hasError('code', 'maxlength')) {
                      Code cannot exceed 20 characters
                    } @else if (hasError('code', 'pattern')) {
                      Code can only contain letters, numbers, hyphens, and underscores
                    } @else if (hasError('code', 'serverError')) {
                      {{ getErrorMessage('code') }}
                    }
                  </div>
                }
              </div>
            </div>

            <div class="row">
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
                placeholder="Enter description (optional)"
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
                  {{ isEditMode() ? 'Update' : 'Create' }} Employment Type
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
export class EmploymentTypeFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  employmentTypeForm = signal<FormGroup>({} as FormGroup);

  isEditMode = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  editingId = signal<number>(0);

  private globalError = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: EmploymentTypeStore,
    private toasterService: ToasterService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initForm();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.editingId.set(id);
      this.loadEmploymentType(id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    const form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      code: [
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

    this.employmentTypeForm.set(form);
  }

  loadEmploymentType(id: number): void {
    this.isLoading.set(true);
    this.store.loadEmploymentTypeById(id);

    setTimeout(() => {
      const empType = this.store.selectedEmploymentType();
      if (empType) {
        this.employmentTypeForm().patchValue({
          name: empType.name,
          code: empType.code,
          description: empType.description || '',
          status: empType.status,
        });
      }
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }, 500);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.employmentTypeForm().get(fieldName);
    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched || field.errors?.['serverError'])
    );
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.employmentTypeForm().get(fieldName);
    return !!(field && field.hasError(errorType));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.employmentTypeForm().get(fieldName);
    if (field?.errors?.['serverError']) {
      return field.errors['serverError'];
    }
    return '';
  }

  isFormValid(): boolean {
    return this.employmentTypeForm().valid;
  }

  onSubmit(): void {
    const form = this.employmentTypeForm();

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
      this.store.updateEmploymentType(this.editingId(), formData).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          if (response?.success) {
            this.toasterService.success('Success', 'Employment type updated successfully');
            this.router.navigate(['/masters/employment-types/list']);
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
      this.store.createEmploymentType(formData).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          if (response?.success) {
            this.toasterService.success('Success', 'Employment type created successfully');
            this.router.navigate(['/masters/employment-types/list']);
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
    this.router.navigate(['/masters/employment-types/list']);
  }

  private handleError(error: any): void {
    let errorMessage = error?.error?.message || error?.message || 'An unexpected error occurred';

    if (error?.error?.errors && Array.isArray(error.error.errors)) {
      const errors = error.error.errors;
      if (errors.length > 0) {
        errorMessage = errors[0].message || errorMessage;
        const fieldName = this.mapApiFieldToFormField(errors[0].field);
        if (fieldName) {
          const field = this.employmentTypeForm().get(fieldName);
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
      employment_type_name: 'name',
      employment_type_code: 'code',
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
