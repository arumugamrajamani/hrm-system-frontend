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
  templateUrl: './department-form.component.html',
  styleUrls: ['./department-form.component.scss'],
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

        this.updateParentFieldValidation();
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

  hasParentDepartment(): boolean {
    const dept = this.department();
    return !!dept?.parent_department_id;
  }

  showParentDepartmentField(): boolean {
    if (!this.isEditMode()) {
      return true;
    }
    return this.hasParentDepartment();
  }

  updateParentFieldValidation(): void {
    const parentField = this.departmentForm().get('parent_department_id');
    if (this.isEditMode() && !this.hasParentDepartment()) {
      parentField?.clearValidators();
    } else {
      parentField?.setValidators([]);
    }
    parentField?.updateValueAndValidity();
  }
}
