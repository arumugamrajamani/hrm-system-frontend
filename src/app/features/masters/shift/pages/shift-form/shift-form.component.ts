import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ShiftStore } from '../../services/shift.store';
import { Shift } from '../../models/shift.model';
import { ToasterService } from '../../../../../core/services';

@Component({
  selector: 'app-shift-form',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-clock me-2"></i>
            {{ isEditMode() ? 'Edit Shift' : 'Add Shift' }}
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

          <form [formGroup]="shiftForm()" (ngSubmit)="onSubmit()">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="shift_name" class="form-label">
                  Shift Name <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="shift_name"
                  formControlName="shift_name"
                  [class.is-invalid]="isFieldInvalid('shift_name')"
                  placeholder="Enter shift name"
                />
                @if (isFieldInvalid('shift_name')) {
                  <div class="invalid-feedback d-block">
                    @if (hasError('shift_name', 'required')) {
                      Shift name is required
                    } @else if (hasError('shift_name', 'minlength')) {
                      Shift name must be at least 2 characters
                    } @else if (hasError('shift_name', 'maxlength')) {
                      Shift name cannot exceed 100 characters
                    } @else if (hasError('shift_name', 'serverError')) {
                      {{ getErrorMessage('shift_name') }}
                    }
                  </div>
                }
              </div>

              <div class="col-md-6 mb-3">
                <label for="shift_code" class="form-label">
                  Shift Code <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="shift_code"
                  formControlName="shift_code"
                  [class.is-invalid]="isFieldInvalid('shift_code')"
                  placeholder="e.g., SHIFT001"
                />
                @if (isFieldInvalid('shift_code')) {
                  <div class="invalid-feedback d-block">
                    @if (hasError('shift_code', 'required')) {
                      Shift code is required
                    } @else if (hasError('shift_code', 'minlength')) {
                      Shift code must be at least 2 characters
                    } @else if (hasError('shift_code', 'maxlength')) {
                      Shift code cannot exceed 20 characters
                    } @else if (hasError('shift_code', 'pattern')) {
                      Shift code can only contain letters, numbers, hyphens, and underscores
                    } @else if (hasError('shift_code', 'serverError')) {
                      {{ getErrorMessage('shift_code') }}
                    }
                  </div>
                }
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="start_time" class="form-label">
                  Start Time <span class="text-danger">*</span>
                </label>
                <input
                  type="time"
                  class="form-control"
                  id="start_time"
                  formControlName="start_time"
                  [class.is-invalid]="isFieldInvalid('start_time')"
                />
                @if (isFieldInvalid('start_time')) {
                  <div class="invalid-feedback d-block">
                    @if (hasError('start_time', 'required')) {
                      Start time is required
                    } @else if (hasError('start_time', 'serverError')) {
                      {{ getErrorMessage('start_time') }}
                    }
                  </div>
                }
              </div>

              <div class="col-md-6 mb-3">
                <label for="end_time" class="form-label">
                  End Time <span class="text-danger">*</span>
                </label>
                <input
                  type="time"
                  class="form-control"
                  id="end_time"
                  formControlName="end_time"
                  [class.is-invalid]="isFieldInvalid('end_time')"
                />
                @if (isFieldInvalid('end_time')) {
                  <div class="invalid-feedback d-block">
                    @if (hasError('end_time', 'required')) {
                      End time is required
                    } @else if (hasError('end_time', 'serverError')) {
                      {{ getErrorMessage('end_time') }}
                    }
                  </div>
                }
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="working_hours" class="form-label">
                  Working Hours <span class="text-danger">*</span>
                </label>
                <input
                  type="number"
                  class="form-control"
                  id="working_hours"
                  formControlName="working_hours"
                  [class.is-invalid]="isFieldInvalid('working_hours')"
                  placeholder="e.g., 8"
                  min="1"
                  max="24"
                />
                @if (isFieldInvalid('working_hours')) {
                  <div class="invalid-feedback d-block">
                    @if (hasError('working_hours', 'required')) {
                      Working hours is required
                    } @else if (hasError('working_hours', 'min')) {
                      Working hours must be at least 1
                    } @else if (hasError('working_hours', 'max')) {
                      Working hours cannot exceed 24
                    } @else if (hasError('working_hours', 'serverError')) {
                      {{ getErrorMessage('working_hours') }}
                    }
                  </div>
                }
              </div>

              <div class="col-md-6 mb-3">
                <label for="break_duration" class="form-label">Break Duration (minutes)</label>
                <input
                  type="number"
                  class="form-control"
                  id="break_duration"
                  formControlName="break_duration"
                  placeholder="e.g., 60"
                  min="0"
                  max="480"
                />
              </div>
            </div>

            <div class="row">
              <div class="col-md-4 mb-3">
                <label for="grace_period_minutes" class="form-label">Grace Period (minutes)</label>
                <input
                  type="number"
                  class="form-control"
                  id="grace_period_minutes"
                  formControlName="grace_period_minutes"
                  placeholder="e.g., 15"
                  min="0"
                  max="120"
                />
              </div>

              <div class="col-md-4 mb-3">
                <label for="late_threshold_minutes" class="form-label"
                  >Late Threshold (minutes)</label
                >
                <input
                  type="number"
                  class="form-control"
                  id="late_threshold_minutes"
                  formControlName="late_threshold_minutes"
                  placeholder="e.g., 30"
                  min="0"
                  max="120"
                />
              </div>

              <div class="col-md-4 mb-3">
                <label for="color" class="form-label">Color</label>
                <input
                  type="color"
                  class="form-control form-control-color"
                  id="color"
                  formControlName="color"
                  title="Choose shift color"
                />
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="is_flexible" class="form-label">Shift Type</label>
                <select class="form-select" id="is_flexible" formControlName="is_flexible">
                  <option [ngValue]="false">Fixed</option>
                  <option [ngValue]="true">Flexible</option>
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
                placeholder="Enter shift description (optional)"
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
                  {{ isEditMode() ? 'Update' : 'Create' }} Shift
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
export class ShiftFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  shiftForm = signal<FormGroup>({} as FormGroup);

  isEditMode = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  editingId = signal<number>(0);

  private globalError = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: ShiftStore,
    private toasterService: ToasterService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initForm();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.editingId.set(id);
      this.loadShift(id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    const form = this.fb.group({
      shift_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      shift_code: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(20),
          Validators.pattern(/^[A-Za-z0-9-_]+$/),
        ],
      ],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      working_hours: [
        { value: '', disabled: true },
        [Validators.required, Validators.min(1), Validators.max(24)],
      ],
      break_duration: ['', [Validators.min(0), Validators.max(480)]],
      grace_period_minutes: ['', [Validators.min(0), Validators.max(120)]],
      late_threshold_minutes: ['', [Validators.min(0), Validators.max(120)]],
      color: ['#007bff'],
      is_flexible: [false],
      status: ['active'],
      description: ['', Validators.maxLength(1000)],
    });

    this.shiftForm.set(form);
    this.setupWorkingHoursCalculation();
  }

  private setupWorkingHoursCalculation(): void {
    const startTimeControl = this.shiftForm().get('start_time');
    const endTimeControl = this.shiftForm().get('end_time');
    const workingHoursControl = this.shiftForm().get('working_hours');

    if (startTimeControl && endTimeControl && workingHoursControl) {
      startTimeControl.valueChanges.subscribe(() => this.calculateWorkingHours());
      endTimeControl.valueChanges.subscribe(() => this.calculateWorkingHours());
    }
  }

  private calculateWorkingHours(): void {
    const startTime = this.shiftForm().get('start_time')?.value;
    const endTime = this.shiftForm().get('end_time')?.value;

    if (startTime && endTime) {
      const start = this.parseTime(startTime);
      const end = this.parseTime(endTime);

      if (start !== null && end !== null) {
        let diff = end - start;
        if (diff < 0) {
          diff += 24 * 60; // Handle overnight shifts
        }
        const workingHours = Math.round((diff / 60) * 100) / 100;
        const workingHoursControl = this.shiftForm().get('working_hours');
        if (workingHoursControl) {
          workingHoursControl.setValue(workingHours, { emitEvent: false }); // Avoid infinite loop
        }
      }
    }
  }

  private parseTime(time: string): number | null {
    // Handle both HH:MM and HH:MM:SS formats
    const parts = time.split(':');
    if (parts.length >= 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      if (!isNaN(hours) && !isNaN(minutes)) {
        return hours * 60 + minutes;
      }
    }
    return null;
  }

  loadShift(id: number): void {
    this.isLoading.set(true);
    this.store.loadShiftById(id);

    // Use effect to react to selectedShift signal
    const stopEffect = effect((onCleanup) => {
      const shift = this.store.selectedShift();
      if (shift) {
        this.shiftForm().patchValue({
          shift_name: shift.name,
          shift_code: shift.code,
          start_time: shift.startTime,
          end_time: shift.endTime,
          // working_hours will be calculated automatically via calculateWorkingHours()
          break_duration: shift.breakDuration || '',
          grace_period_minutes: shift.gracePeriodMinutes || '',
          late_threshold_minutes: shift.lateThresholdMinutes || '',
          color: shift.color || '#007bff',
          is_flexible: shift.isFlexible,
          status: shift.status,
          description: shift.description || '',
        });
        // Trigger working hours calculation
        this.calculateWorkingHours();
        this.isLoading.set(false);
        this.cdr.markForCheck();
        stopEffect.destroy(); // Clean up effect after first run
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.shiftForm().get(fieldName);
    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched || field.errors?.['serverError'])
    );
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.shiftForm().get(fieldName);
    return !!(field && field.hasError(errorType));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.shiftForm().get(fieldName);
    if (field?.errors?.['serverError']) {
      return field.errors['serverError'];
    }
    return '';
  }

  isFormValid(): boolean {
    return this.shiftForm().valid;
  }

  onSubmit(): void {
    const form = this.shiftForm();

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

    // Convert time format from HH:MM to HH:MM:SS for API
    if (formData.start_time && formData.start_time.length === 5) {
      formData.start_time = formData.start_time + ':00';
    }
    if (formData.end_time && formData.end_time.length === 5) {
      formData.end_time = formData.end_time + ':00';
    }

    if (this.isEditMode()) {
      this.store.updateShift(this.editingId(), formData).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          if (response?.success) {
            this.toasterService.success('Success', 'Shift updated successfully');
            this.router.navigate(['/masters/shifts/list']);
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
      this.store.createShift(formData).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          if (response?.success) {
            this.toasterService.success('Success', 'Shift created successfully');
            this.router.navigate(['/masters/shifts/list']);
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
    this.router.navigate(['/masters/shifts/list']);
  }

  private handleError(error: any): void {
    let errorMessage = error?.error?.message || error?.message || 'An unexpected error occurred';

    if (error?.error?.errors && Array.isArray(error.error.errors)) {
      const errors = error.error.errors;
      if (errors.length > 0) {
        errorMessage = errors[0].message || errorMessage;
        const fieldName = this.mapApiFieldToFormField(errors[0].field);
        if (fieldName) {
          const field = this.shiftForm().get(fieldName);
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
      name: 'shift_name',
      code: 'shift_code',
      start_time: 'start_time',
      end_time: 'end_time',
      working_hours: 'working_hours',
      break_duration: 'break_duration',
      is_flexible: 'is_flexible',
      grace_period_minutes: 'grace_period_minutes',
      late_threshold_minutes: 'late_threshold_minutes',
      color: 'color',
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
