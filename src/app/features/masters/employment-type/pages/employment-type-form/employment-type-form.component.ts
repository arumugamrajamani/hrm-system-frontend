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
                <div class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="isPermanent"
                    formControlName="isPermanent"
                  />
                  <label class="form-check-label" for="isPermanent"> Permanent Employment </label>
                </div>
              </div>

              <div class="col-md-6 mb-3">
                <label for="status" class="form-label">Status</label>
                <select class="form-select" id="status" formControlName="status">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div class="row">
              <div class="col-md-4 mb-3">
                <label for="probationMonths" class="form-label">Probation Period (Months)</label>
                <input
                  type="number"
                  class="form-control"
                  id="probationMonths"
                  formControlName="probationMonths"
                  [class.is-invalid]="isFieldInvalid('probationMonths')"
                  placeholder="e.g., 6"
                  min="0"
                  max="36"
                />
                @if (isFieldInvalid('probationMonths') && hasError('probationMonths', 'min')) {
                  <div class="invalid-feedback d-block">Probation months cannot be negative</div>
                }
                @if (isFieldInvalid('probationMonths') && hasError('probationMonths', 'max')) {
                  <div class="invalid-feedback d-block">Probation months cannot exceed 36</div>
                }
              </div>

              <div class="col-md-4 mb-3">
                <label for="noticePeriodDays" class="form-label">Notice Period (Days)</label>
                <input
                  type="number"
                  class="form-control"
                  id="noticePeriodDays"
                  formControlName="noticePeriodDays"
                  [class.is-invalid]="isFieldInvalid('noticePeriodDays')"
                  placeholder="e.g., 30"
                  min="0"
                  max="180"
                />
                @if (isFieldInvalid('noticePeriodDays') && hasError('noticePeriodDays', 'min')) {
                  <div class="invalid-feedback d-block">Notice period cannot be negative</div>
                }
                @if (isFieldInvalid('noticePeriodDays') && hasError('noticePeriodDays', 'max')) {
                  <div class="invalid-feedback d-block">Notice period cannot exceed 180 days</div>
                }
              </div>

              <div class="col-md-4 mb-3">
                <label for="maxContractDuration" class="form-label"
                  >Max Contract Duration (Months)</label
                >
                <input
                  type="number"
                  class="form-control"
                  id="maxContractDuration"
                  formControlName="maxContractDuration"
                  [class.is-invalid]="isFieldInvalid('maxContractDuration')"
                  placeholder="e.g., 24"
                  min="0"
                  max="120"
                />
                @if (
                  isFieldInvalid('maxContractDuration') && hasError('maxContractDuration', 'min')
                ) {
                  <div class="invalid-feedback d-block">
                    Max contract duration cannot be negative
                  </div>
                }
                @if (
                  isFieldInvalid('maxContractDuration') && hasError('maxContractDuration', 'max')
                ) {
                  <div class="invalid-feedback d-block">
                    Max contract duration cannot exceed 120 months
                  </div>
                }
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
      isPermanent: [true],
      probationMonths: [null, [Validators.min(0), Validators.max(36)]],
      noticePeriodDays: [null, [Validators.min(0), Validators.max(180)]],
      maxContractDuration: [null, [Validators.min(0), Validators.max(120)]],
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
          isPermanent: empType.isPermanent,
          probationMonths: empType.probationMonths || null,
          noticePeriodDays: empType.noticePeriodDays || null,
          maxContractDuration: empType.maxContractDuration || null,
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
      name: 'name',
      code: 'code',
      description: 'description',
      isPermanent: 'isPermanent',
      probationMonths: 'probationMonths',
      noticePeriodDays: 'noticePeriodDays',
      maxContractDuration: 'maxContractDuration',
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
