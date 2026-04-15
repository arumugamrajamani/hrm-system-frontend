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
import { Subject, takeUntil } from 'rxjs';
import { LocationStore } from '../../services/location.store';
import { Location } from '../../models/location.model';
import { ToasterService } from '../../../../../core/services';

@Component({
  selector: 'app-location-form',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-map-marker-alt me-2"></i>
            {{ isEditMode() ? 'Edit Location' : 'Add Location' }}
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
                <i class="fas fa-building me-2"></i>
                Location Information
              </h5>
            </div>
            <div class="card-body">
              @if (isLoading()) {
                <div class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              }

              <form [formGroup]="locationForm()" (ngSubmit)="onSubmit()">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="location_name" class="form-label">
                      Location Name <span class="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="location_name"
                      formControlName="location_name"
                      [class.is-invalid]="isFieldInvalid('location_name')"
                      placeholder="Enter location name"
                    />
                    @if (isFieldInvalid('location_name')) {
                      <div class="invalid-feedback d-block">
                        @if (hasError('location_name', 'required')) {
                          Location name is required
                        } @else if (hasError('location_name', 'minlength')) {
                          Location name must be at least 2 characters
                        } @else if (hasError('location_name', 'maxlength')) {
                          Location name cannot exceed 100 characters
                        } @else if (hasError('location_name', 'serverError')) {
                          {{ getErrorMessage('location_name') }}
                        }
                      </div>
                    }
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="location_code" class="form-label">
                      Location Code <span class="text-danger">*</span>
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
                      id="location_code"
                      formControlName="location_code"
                      [class.is-invalid]="isFieldInvalid('location_code')"
                      placeholder="e.g., LOC001"
                    />
                    @if (isFieldInvalid('location_code')) {
                      <div class="invalid-feedback d-block">
                        @if (hasError('location_code', 'required')) {
                          Location code is required
                        } @else if (hasError('location_code', 'minlength')) {
                          Location code must be at least 2 characters
                        } @else if (hasError('location_code', 'maxlength')) {
                          Location code cannot exceed 20 characters
                        } @else if (hasError('location_code', 'pattern')) {
                          Location code can only contain letters, numbers, hyphens, and underscores
                        } @else if (hasError('location_code', 'serverError')) {
                          {{ getErrorMessage('location_code') }}
                        }
                      </div>
                    }
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="parent_location_id" class="form-label">Parent Location</label>
                    <select
                      class="form-select"
                      id="parent_location_id"
                      formControlName="parent_location_id"
                      [class.is-invalid]="isFieldInvalid('parent_location_id')"
                    >
                      <option [ngValue]="null">No Parent (Root Location)</option>
                      @for (loc of availableParentLocations(); track loc.id) {
                        @if (loc.id !== editingId()) {
                          <option [ngValue]="loc.id">{{ loc.name }} ({{ loc.code }})</option>
                        }
                      }
                    </select>
                    <small class="form-text text-muted">
                      Select a parent location to create hierarchy
                    </small>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="is_headquarters" class="form-label">Type</label>
                    <div class="form-check mt-2">
                      <input
                        type="checkbox"
                        class="form-check-input"
                        id="is_headquarters"
                        formControlName="is_headquarters"
                      />
                      <label class="form-check-label" for="is_headquarters">
                        Set as Headquarters
                      </label>
                    </div>
                    <small class="form-text text-muted">
                      Only one location can be headquarters
                    </small>
                  </div>
                </div>

                <hr class="my-4" />

                <h6 class="mb-3 text-muted">
                  <i class="fas fa-map-pin me-2"></i>
                  Address Details
                </h6>

                <div class="mb-3">
                  <label for="address" class="form-label">Address</label>
                  <textarea
                    class="form-control"
                    id="address"
                    formControlName="address"
                    rows="2"
                    placeholder="Enter full address (optional)"
                    [class.is-invalid]="isFieldInvalid('address')"
                  ></textarea>
                </div>

                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label for="city" class="form-label">
                      City <span class="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="city"
                      formControlName="city"
                      [class.is-invalid]="isFieldInvalid('city')"
                      placeholder="Enter city"
                    />
                    @if (isFieldInvalid('city')) {
                      <div class="invalid-feedback d-block">
                        @if (hasError('city', 'required')) {
                          City is required
                        }
                      </div>
                    }
                  </div>

                  <div class="col-md-4 mb-3">
                    <label for="state" class="form-label">
                      State <span class="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="state"
                      formControlName="state"
                      [class.is-invalid]="isFieldInvalid('state')"
                      placeholder="Enter state"
                    />
                    @if (isFieldInvalid('state')) {
                      <div class="invalid-feedback d-block">
                        @if (hasError('state', 'required')) {
                          State is required
                        }
                      </div>
                    }
                  </div>

                  <div class="col-md-4 mb-3">
                    <label for="pincode" class="form-label">Pincode</label>
                    <input
                      type="text"
                      class="form-control"
                      id="pincode"
                      formControlName="pincode"
                      placeholder="Enter pincode"
                      [class.is-invalid]="isFieldInvalid('pincode')"
                    />
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="country" class="form-label">Country</label>
                    <input
                      type="text"
                      class="form-control"
                      id="country"
                      formControlName="country"
                      placeholder="Enter country"
                    />
                  </div>
                </div>

                <hr class="my-4" />

                <h6 class="mb-3 text-muted">
                  <i class="fas fa-phone-alt me-2"></i>
                  Contact Details
                </h6>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="phone" class="form-label">Phone</label>
                    <input
                      type="text"
                      class="form-control"
                      id="phone"
                      formControlName="phone"
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      formControlName="email"
                      placeholder="location@company.com"
                      [class.is-invalid]="isFieldInvalid('email')"
                    />
                    @if (isFieldInvalid('email') && hasError('email', 'email')) {
                      <div class="invalid-feedback d-block">Please enter a valid email address</div>
                    }
                  </div>
                </div>

                <hr class="my-4" />

                <h6 class="mb-3 text-muted">
                  <i class="fas fa-info-circle me-2"></i>
                  Additional Information
                </h6>

                <div class="mb-3">
                  <label for="description" class="form-label">Description</label>
                  <textarea
                    class="form-control"
                    id="description"
                    formControlName="description"
                    rows="3"
                    placeholder="Enter location description (optional)"
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
                      {{ isEditMode() ? 'Update' : 'Create' }} Location
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
                  <small>Use descriptive names like "Mumbai Branch" or "Delhi Office"</small>
                </li>
                <li class="mb-3">
                  <i class="fas fa-check text-success me-2"></i>
                  <small>Location codes should be unique and meaningful</small>
                </li>
                <li class="mb-3">
                  <i class="fas fa-check text-success me-2"></i>
                  <small>Create a hierarchy by selecting parent locations</small>
                </li>
                <li class="mb-3">
                  <i class="fas fa-star text-warning me-2"></i>
                  <small>Only one location can be designated as headquarters</small>
                </li>
                <li class="mb-0">
                  <i class="fas fa-map-marker-alt text-danger me-2"></i>
                  <small>Each location can have its own contact details</small>
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
export class LocationFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  locationForm = signal<FormGroup>({} as FormGroup);
  availableParentLocations = signal<Location[]>([]);

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
    private store: LocationStore,
    private toasterService: ToasterService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadParentLocations();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.editingId.set(id);
      this.loadLocation(id);
    } else {
      this.isDataLoaded.set(true);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    const form = this.fb.group({
      location_name: [
        '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      ],
      location_code: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(20),
          Validators.pattern(/^[A-Za-z0-9-_]+$/),
        ],
      ],
      parent_location_id: [null],
      address: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      country: ['India'],
      pincode: [''],
      phone: [''],
      email: ['', [Validators.email]],
      is_headquarters: [false],
      description: ['', Validators.maxLength(1000)],
      status: ['active'],
    });

    this.locationForm.set(form);
  }

  loadParentLocations(): void {
    this.store.loadLocations({ limit: 100, page: 1 });
    setTimeout(() => {
      this.availableParentLocations.set(this.store.locations());
      this.cdr.markForCheck();
    }, 500);
  }

  loadLocation(id: number): void {
    this.isLoading.set(true);
    this.store.loadById(id);

    let attempts = 0;
    const maxAttempts = 20;

    const checkLocation = setInterval(() => {
      attempts++;
      const loc = this.store.selectedLocation();
      const hasError = this.store.error();

      if (loc && loc.id === Number(id)) {
        clearInterval(checkLocation);
        this.isDataLoaded.set(true);
        this.locationForm().patchValue({
          location_name: loc.name,
          location_code: loc.code,
          parent_location_id: loc.parentId || null,
          address: loc.address || '',
          city: loc.city,
          state: loc.state,
          country: loc.country || 'India',
          pincode: loc.pincode || '',
          phone: loc.phone || '',
          email: loc.email || '',
          is_headquarters: loc.isHeadquarters,
          description: loc.description || '',
          status: loc.status,
        });
        this.isLoading.set(false);
        this.cdr.markForCheck();
      } else if (hasError || attempts >= maxAttempts) {
        clearInterval(checkLocation);
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
        if (response?.success && response.data?.branch_code) {
          this.locationForm().patchValue({
            location_code: response.data.branch_code,
          });
          this.toasterService.success(
            'Code Generated',
            `Generated code: ${response.data.branch_code}`,
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
    const field = this.locationForm().get(fieldName);
    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched || field.errors?.['serverError'])
    );
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.locationForm().get(fieldName);
    return !!(field && field.hasError(errorType));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.locationForm().get(fieldName);
    if (field?.errors?.['serverError']) {
      return field.errors['serverError'];
    }
    return '';
  }

  isFormValid(): boolean {
    return this.locationForm().valid;
  }

  onSubmit(): void {
    if (this.isEditMode() && !this.isDataLoaded()) {
      this.toasterService.error('Error', 'Please wait for data to load');
      return;
    }

    const form = this.locationForm();

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
            this.toasterService.success('Success', 'Location updated successfully');
            this.router.navigate(['/masters/locations/list']);
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
            this.toasterService.success('Success', 'Location created successfully');
            this.router.navigate(['/masters/locations/list']);
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
    this.router.navigate(['/masters/locations/list']);
  }

  private handleError(error: any): void {
    let errorMessage = error?.error?.message || error?.message || 'An unexpected error occurred';

    if (error?.error?.errors && Array.isArray(error.error.errors)) {
      const errors = error.error.errors;
      if (errors.length > 0) {
        errorMessage = errors[0].message || errorMessage;
        const fieldName = this.mapApiFieldToFormField(errors[0].field);
        if (fieldName) {
          const field = this.locationForm().get(fieldName);
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
      name: 'location_name',
      code: 'location_code',
      parent_id: 'parent_location_id',
      address: 'address',
      city: 'city',
      state: 'state',
      country: 'country',
      pincode: 'pincode',
      phone: 'phone',
      email: 'email',
      is_headquarters: 'is_headquarters',
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
