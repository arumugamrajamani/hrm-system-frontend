import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { EmployeeStore } from '../../services/employee.store';
import { Employee, EmploymentType, EmploymentStatus } from '../../models/employee.model';
import { ToasterService } from '../../../../core/services/toaster.service';

@Component({
  selector: 'app-employee-form',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-user-plus me-2"></i>
            {{ isEditMode() ? 'Edit' : 'Add' }} Employee
          </h2>
        </div>
      </div>

      @if (store.loading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else {
        <form [formGroup]="employeeForm()" (ngSubmit)="onSubmit()">
          <div class="card shadow-sm mb-4">
            <div class="card-header">
              <h5 class="mb-0">Personal Information</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label">First Name <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    formControlName="firstName"
                    [class.is-invalid]="isFieldInvalid('firstName')"
                  />
                  @if (isFieldInvalid('firstName')) {
                    <div class="invalid-feedback">First name is required</div>
                  }
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Last Name <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    formControlName="lastName"
                    [class.is-invalid]="isFieldInvalid('lastName')"
                  />
                  @if (isFieldInvalid('lastName')) {
                    <div class="invalid-feedback">Last name is required</div>
                  }
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Email <span class="text-danger">*</span></label>
                  <input
                    type="email"
                    class="form-control"
                    formControlName="email"
                    [class.is-invalid]="isFieldInvalid('email')"
                  />
                  @if (isFieldInvalid('email')) {
                    <div class="invalid-feedback">Valid email is required</div>
                  }
                </div>
              </div>
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label">Phone</label>
                  <input type="text" class="form-control" formControlName="phone" />
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Date of Birth</label>
                  <input type="date" class="form-control" formControlName="dateOfBirth" />
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Gender</label>
                  <select class="form-select" formControlName="gender">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="card shadow-sm mb-4">
            <div class="card-header">
              <h5 class="mb-0">Official Information</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label">Employee Code <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    formControlName="employeeCode"
                    [class.is-invalid]="isFieldInvalid('employeeCode')"
                  />
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Department</label>
                  <select class="form-select" formControlName="departmentId">
                    <option value="">Select Department</option>
                    <!-- Will be populated from API -->
                  </select>
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Designation</label>
                  <select class="form-select" formControlName="designationId">
                    <option value="">Select Designation</option>
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label">Employment Type</label>
                  <select class="form-select" formControlName="employmentType">
                    <option value="permanent">Permanent</option>
                    <option value="contract">Contract</option>
                    <option value="temporary">Temporary</option>
                    <option value="internship">Internship</option>
                    <option value="part_time">Part Time</option>
                  </select>
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Date of Joining</label>
                  <input type="date" class="form-control" formControlName="dateOfJoining" />
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Reporting Manager</label>
                  <select class="form-select" formControlName="reportingManagerId">
                    <option value="">Select Manager</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="card shadow-sm mb-4">
            <div class="card-header">
              <h5 class="mb-0">Employment Status</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Status</label>
                  <select class="form-select" formControlName="employmentStatus">
                    <option value="probation">Probation</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="resigned">Resigned</option>
                    <option value="terminated">Terminated</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Confirmation Date</label>
                  <input type="date" class="form-control" formControlName="confirmationDate" />
                </div>
              </div>
            </div>
          </div>

          <div class="card shadow-sm mb-4">
            <div class="card-header">
              <h5 class="mb-0">Compensation</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Salary</label>
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input type="number" class="form-control" formControlName="salary" />
                  </div>
                  @if (!store.canViewSalary()) {
                    <small class="text-muted">Contact HR to update salary</small>
                  }
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Status</label>
                  <select class="form-select" formControlName="status">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-auto">
              <button type="button" class="btn btn-secondary" (click)="onCancel()">Cancel</button>
            </div>
            <div class="col-auto">
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="employeeForm().invalid || store.loading()"
              >
                @if (store.loading()) {
                  <span class="spinner-border spinner-border-sm me-2"></span>
                }
                {{ isEditMode() ? 'Update' : 'Create' }} Employee
              </button>
            </div>
          </div>
        </form>
      }
    </div>
  `,
})
export class EmployeeFormComponent implements OnInit {
  readonly store = inject(EmployeeStore);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toaster = inject(ToasterService);
  private destroy$ = new Subject<void>();

  employeeId = signal<number>(0);
  isEditMode = signal<boolean>(false);
  employeeForm = signal<FormGroup>({} as FormGroup);

  ngOnInit(): void {
    this.initForm();
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.employeeId.set(id);
      this.store.loadEmployeeById(id);
    }
  }

  private initForm(): void {
    const form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      dateOfBirth: [''],
      gender: [''],
      employeeCode: ['', Validators.required],
      departmentId: [''],
      designationId: [''],
      employmentType: ['permanent'],
      dateOfJoining: [''],
      reportingManagerId: [''],
      employmentStatus: ['probation'],
      confirmationDate: [''],
      salary: [''],
      status: ['active'],
    });
    this.employeeForm.set(form);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.employeeForm().get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.employeeForm().invalid) {
      this.toaster.error('Validation Error', 'Please fill all required fields');
      return;
    }

    const formData = this.employeeForm().value;

    if (this.isEditMode()) {
      this.store.updateEmployee(this.employeeId(), formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.toaster.success('Success', 'Employee updated successfully');
            this.router.navigate(['/employees/list']);
          }
        },
      });
    } else {
      this.store.createEmployee(formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.toaster.success('Success', 'Employee created successfully');
            this.router.navigate(['/employees/list']);
          }
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/employees/list']);
  }
}
