import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { EmployeeStore } from '../../services/employee.store';
import { Employee } from '../../models/employee.model';
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
          <mat-progress-spinner mode="indeterminate" diameter="48"></mat-progress-spinner>
          <p class="mt-3 text-muted">Loading...</p>
        </div>
      } @else {
        <form [formGroup]="employeeForm()" (ngSubmit)="onSubmit()">
          <div class="card shadow-sm mb-4">
            <div class="card-header">
              <h5 class="mb-0">
                <mat-icon>person</mat-icon>
                Personal Information
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4 mb-3">
                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>First Name <span class="text-danger">*</span></mat-label>
                    <input matInput formControlName="firstName" />
                    @if (isFieldInvalid('firstName')) {
                      <mat-error>First name is required (min 2 characters)</mat-error>
                    }
                  </mat-form-field>
                </div>
                <div class="col-md-4 mb-3">
                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>Last Name <span class="text-danger">*</span></mat-label>
                    <input matInput formControlName="lastName" />
                    @if (isFieldInvalid('lastName')) {
                      <mat-error>Last name is required (min 2 characters)</mat-error>
                    }
                  </mat-form-field>
                </div>
                <div class="col-md-4 mb-3">
                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>Email <span class="text-danger">*</span></mat-label>
                    <input matInput type="email" formControlName="email" />
                    <mat-icon matSuffix>email</mat-icon>
                    @if (isFieldInvalid('email')) {
                      <mat-error>Valid email is required</mat-error>
                    }
                  </mat-form-field>
                </div>
              </div>
              <div class="row">
                <div class="col-md-4 mb-3">
                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>Phone</mat-label>
                    <input matInput formControlName="phone" />
                    <mat-icon matSuffix>phone</mat-icon>
                  </mat-form-field>
                </div>
                <div class="col-md-4 mb-3">
                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>Date of Birth</mat-label>
                    <input matInput [matDatepicker]="dobPicker" formControlName="dateOfBirth" />
                    <mat-datepicker-toggle matSuffix [for]="dobPicker"></mat-datepicker-toggle>
                    <mat-datepicker #dobPicker></mat-datepicker>
                  </mat-form-field>
                </div>
                <div class="col-md-4 mb-3">
                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>Gender</mat-label>
                    <mat-select formControlName="gender">
                      <mat-option value="">Select</mat-option>
                      <mat-option value="male">Male</mat-option>
                      <mat-option value="female">Female</mat-option>
                      <mat-option value="other">Other</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>
            </div>
          </div>

          <div class="card shadow-sm mb-4">
            <div class="card-header">
              <h5 class="mb-0">
                <mat-icon>work</mat-icon>
                Official Information
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4 mb-3">
                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>Employee Code <span class="text-danger">*</span></mat-label>
                    <input matInput formControlName="employeeCode" />
                    @if (isFieldInvalid('employeeCode')) {
                      <mat-error>Employee code is required</mat-error>
                    }
                  </mat-form-field>
                </div>
                <div class="col-md-4 mb-3">
                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>Department</mat-label>
                    <mat-select formControlName="departmentId">
                      <mat-option value="">Select Department</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
                <div class="col-md-4 mb-3">
                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>Designation</mat-label>
                    <mat-select formControlName="designationId">
                      <mat-option value="">Select Designation</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>
              <div class="row">
                <div class="col-md-4 mb-3">
                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>Employment Type</mat-label>
                    <mat-select formControlName="employmentType">
                      <mat-option value="permanent">Permanent</mat-option>
                      <mat-option value="contract">Contract</mat-option>
                      <mat-option value="temporary">Temporary</mat-option>
                      <mat-option value="internship">Internship</mat-option>
                      <mat-option value="part_time">Part Time</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
                <div class="col-md-4 mb-3">
                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>Date of Joining</mat-label>
                    <input matInput [matDatepicker]="dojPicker" formControlName="dateOfJoining" />
                    <mat-datepicker-toggle matSuffix [for]="dojPicker"></mat-datepicker-toggle>
                    <mat-datepicker #dojPicker></mat-datepicker>
                  </mat-form-field>
                </div>
                <div class="col-md-4 mb-3">
                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>Reporting Manager</mat-label>
                    <mat-select formControlName="reportingManagerId">
                      <mat-option value="">Select Manager</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>
            </div>
          </div>

          <div class="card shadow-sm mb-4">
            <div class="card-header">
              <h5 class="mb-0">
                <mat-icon>assignment</mat-icon>
                Employment Status
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>Status</mat-label>
                    <mat-select formControlName="employmentStatus">
                      <mat-option value="probation">Probation</mat-option>
                      <mat-option value="confirmed">Confirmed</mat-option>
                      <mat-option value="resigned">Resigned</mat-option>
                      <mat-option value="terminated">Terminated</mat-option>
                      <mat-option value="retired">Retired</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
                <div class="col-md-6 mb-3">
                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>Confirmation Date</mat-label>
                    <input
                      matInput
                      [matDatepicker]="confPicker"
                      formControlName="confirmationDate"
                    />
                    <mat-datepicker-toggle matSuffix [for]="confPicker"></mat-datepicker-toggle>
                    <mat-datepicker #confPicker></mat-datepicker>
                  </mat-form-field>
                </div>
              </div>
            </div>
          </div>

          @if (store.canViewSalary()) {
            <div class="card shadow-sm mb-4">
              <div class="card-header">
                <h5 class="mb-0">
                  <mat-icon>payments</mat-icon>
                  Compensation
                </h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <mat-form-field appearance="outline" class="w-100">
                      <mat-label>Salary</mat-label>
                      <span matPrefix>$&nbsp;</span>
                      <input matInput type="number" formControlName="salary" />
                    </mat-form-field>
                  </div>
                  <div class="col-md-6 mb-3">
                    <mat-form-field appearance="outline" class="w-100">
                      <mat-label>Account Status</mat-label>
                      <mat-select formControlName="status">
                        <mat-option value="active">Active</mat-option>
                        <mat-option value="inactive">Inactive</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                </div>
              </div>
            </div>
          }

          <div class="row">
            <div class="col-auto">
              <button mat-button type="button" (click)="onCancel()">
                <mat-icon>close</mat-icon>
                Cancel
              </button>
            </div>
            <div class="col-auto">
              <button
                mat-flat-button
                color="primary"
                type="submit"
                [disabled]="employeeForm().invalid || store.loading()"
              >
                @if (store.loading()) {
                  <mat-progress-spinner mode="indeterminate" diameter="20"></mat-progress-spinner>
                } @else {
                  <mat-icon>{{ isEditMode() ? 'save' : 'add' }}</mat-icon>
                }
                {{ isEditMode() ? 'Update' : 'Create' }} Employee
              </button>
            </div>
          </div>
        </form>
      }
    </div>
  `,
  styles: [
    `
      .page-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
      }

      .card {
        border: none;
        border-radius: 8px;
      }

      .card-header {
        background-color: #f8f9fa;
        border-bottom: 1px solid #e9ecef;
        padding: 16px 20px;
      }

      .card-header h5 {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
      }

      .card-body {
        padding: 20px;
      }

      .w-100 {
        width: 100%;
      }

      .text-muted {
        color: #6c757d;
      }

      .text-danger {
        color: #dc3545;
      }

      .row {
        display: flex;
        flex-wrap: wrap;
        margin: 0 -12px;
      }

      .col-md-4,
      .col-md-6 {
        padding: 0 12px;
      }

      .col-auto {
        flex: 0 0 auto;
        padding: 0 12px;
      }

      .mb-3 {
        margin-bottom: 16px;
      }

      .mb-4 {
        margin-bottom: 24px;
      }

      .mt-3 {
        margin-top: 16px;
      }

      .py-5 {
        padding-top: 48px;
        padding-bottom: 48px;
      }

      button[mat-flat-button] {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      button[mat-button] {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    `,
  ],
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

      const checkEmployee = () => {
        const employee = this.store.selected() as unknown as Employee | null;
        if (employee && employee.id) {
          this.patchForm(employee);
        } else {
          setTimeout(checkEmployee, 100);
        }
      };
      checkEmployee();
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

  private patchForm(employee: Employee): void {
    this.employeeForm().patchValue({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone || '',
      dateOfBirth: employee.dateOfBirth || '',
      gender: '',
      employeeCode: employee.employeeCode,
      departmentId: employee.departmentId || '',
      designationId: employee.designationId || '',
      employmentType: employee.employmentType || 'permanent',
      dateOfJoining: employee.dateOfJoining || '',
      reportingManagerId: employee.reportingManagerId || '',
      employmentStatus: employee.employmentStatus || 'probation',
      confirmationDate: employee.confirmationDate || '',
      salary: employee.salary || '',
      status: employee.status || 'active',
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.employeeForm().get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.employeeForm().invalid) {
      this.employeeForm().markAllAsTouched();
      this.toaster.error('Validation Error', 'Please fill all required fields correctly');
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
