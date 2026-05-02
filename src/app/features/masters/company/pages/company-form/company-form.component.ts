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
import { CompanyStore } from '../../services/company.store';
import { Company } from '../../models/company.model';
import { ToasterService } from '../../../../../core/services';

@Component({
  selector: 'app-company-form',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.scss'],
})
export class CompanyFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  companyForm = signal<FormGroup>({} as FormGroup);

  isEditMode = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  editingId = signal<number>(0);

  private globalError = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: CompanyStore,
    private toasterService: ToasterService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initForm();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.editingId.set(id);
      this.loadCompany(id);
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
      legal_name: [''],
      registration_number: [''],
      tax_id: [''],
      gstin: [''],
      pan: [''],
      cin: [''],
      industry: [''],
      website: [''],
      email: ['', Validators.email],
      phone: [''],
      fax: [''],
      address: [''],
      city: [''],
      state: [''],
      country: [''],
      pincode: [''],
      established_date: [''],
      fiscal_year_start: [''],
      status: ['active'],
    });

    this.companyForm.set(form);
  }

  loadCompany(id: number): void {
    this.isLoading.set(true);
    this.store.loadCompanyById(id);

    setTimeout(() => {
      const company = this.store.selectedCompany();
      if (company) {
        this.companyForm().patchValue({
          name: company.name,
          code: company.code,
          legal_name: company.legalName || '',
          registration_number: company.registrationNumber || '',
          tax_id: company.taxId || '',
          gstin: company.gstin || '',
          pan: company.pan || '',
          cin: company.cin || '',
          industry: company.industry || '',
          website: company.website || '',
          email: company.email || '',
          phone: company.phone || '',
          fax: company.fax || '',
          address: company.address || '',
          city: company.city || '',
          state: company.state || '',
          country: company.country || '',
          pincode: company.pincode || '',
          established_date: company.establishedDate || '',
          fiscal_year_start: company.fiscalYearStart || '',
          status: company.status,
        });
      }
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }, 500);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.companyForm().get(fieldName);
    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched || field.errors?.['serverError'])
    );
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.companyForm().get(fieldName);
    return !!(field && field.hasError(errorType));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.companyForm().get(fieldName);
    if (field?.errors?.['serverError']) {
      return field.errors['serverError'];
    }
    return '';
  }

  isFormValid(): boolean {
    return this.companyForm().valid;
  }

  onSubmit(): void {
    const form = this.companyForm();

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
            this.toasterService.success('Success', 'Company updated successfully');
            this.router.navigate(['/masters/companies/list']);
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
            this.toasterService.success('Success', 'Company created successfully');
            this.router.navigate(['/masters/companies/list']);
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
    this.router.navigate(['/masters/companies/list']);
  }

  private handleError(error: any): void {
    let errorMessage = error?.error?.message || error?.message || 'An unexpected error occurred';

    if (error?.error?.errors && Array.isArray(error.error.errors)) {
      const errors = error.error.errors;
      if (errors.length > 0) {
        errorMessage = errors[0].message || errorMessage;
        const fieldName = this.mapApiFieldToFormField(errors[0].field);
        if (fieldName) {
          const field = this.companyForm().get(fieldName);
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
      legal_name: 'legal_name',
      registration_number: 'registration_number',
      tax_id: 'tax_id',
      gstin: 'gstin',
      pan: 'pan',
      cin: 'cin',
      industry: 'industry',
      website: 'website',
      email: 'email',
      phone: 'phone',
      fax: 'fax',
      address: 'address',
      city: 'city',
      state: 'state',
      country: 'country',
      pincode: 'pincode',
      established_date: 'established_date',
      fiscal_year_start: 'fiscal_year_start',
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
