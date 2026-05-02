import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
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
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EmployeeStore } from '../../services/employee.store';
import { EmployeeApiService } from '../../../employees/services/employee-api.service';
import {
  Employee,
  EmployeeDocument,
  BankDetails,
  EmergencyContact,
  Dependent,
} from '../../models/employee.model';
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
          <mat-tab-group>
            <!-- Personal & Official Info Tab -->
            <mat-tab label="Basic Info">
              <div class="card shadow-sm mb-4 mt-3">
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
                        <input
                          matInput
                          [matDatepicker]="dojPicker"
                          formControlName="dateOfJoining"
                        />
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
            </mat-tab>

            <!-- Job Details Tab -->
            @if (isEditMode()) {
              <mat-tab label="Job Details">
                <div class="card shadow-sm mb-4 mt-3">
                  <div class="card-header">
                    <h5 class="mb-0">
                      <mat-icon>business_center</mat-icon>
                      Job Details
                    </h5>
                  </div>
                  <div class="card-body">
                    <form [formGroup]="jobDetailsForm()">
                      <div class="row">
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
                        <div class="col-md-4 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Grade</mat-label>
                            <mat-select formControlName="gradeId">
                              <mat-option value="">Select Grade</mat-option>
                            </mat-select>
                          </mat-form-field>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-4 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Location</mat-label>
                            <mat-select formControlName="locationId">
                              <mat-option value="">Select Location</mat-option>
                            </mat-select>
                          </mat-form-field>
                        </div>
                        <div class="col-md-4 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Employment Type</mat-label>
                            <mat-select formControlName="employmentType">
                              <mat-option value="permanent">Permanent</mat-option>
                              <mat-option value="contract">Contract</mat-option>
                              <mat-option value="temporary">Temporary</mat-option>
                              <mat-option value="internship">Internship</mat-option>
                            </mat-select>
                          </mat-form-field>
                        </div>
                        <div class="col-md-4 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Date of Joining</mat-label>
                            <input
                              matInput
                              [matDatepicker]="jdDojPicker"
                              formControlName="dateOfJoining"
                            />
                            <mat-datepicker-toggle
                              matSuffix
                              [for]="jdDojPicker"
                            ></mat-datepicker-toggle>
                            <mat-datepicker #jdDojPicker></mat-datepicker>
                          </mat-form-field>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-4 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Probation Period (months)</mat-label>
                            <input matInput type="number" formControlName="probationPeriod" />
                          </mat-form-field>
                        </div>
                        <div class="col-md-4 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Confirmation Date</mat-label>
                            <input
                              matInput
                              [matDatepicker]="jdConfPicker"
                              formControlName="confirmationDate"
                            />
                            <mat-datepicker-toggle
                              matSuffix
                              [for]="jdConfPicker"
                            ></mat-datepicker-toggle>
                            <mat-datepicker #jdConfPicker></mat-datepicker>
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
                      <div class="row">
                        <div class="col-md-12">
                          <button
                            mat-flat-button
                            color="primary"
                            type="button"
                            (click)="saveJobDetails()"
                          >
                            <mat-icon>save</mat-icon>
                            Save Job Details
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </mat-tab>

              <!-- Addresses Tab -->
              <mat-tab label="Addresses">
                <div class="card shadow-sm mb-4 mt-3">
                  <div class="card-header">
                    <h5 class="mb-0">
                      <mat-icon>location_on</mat-icon>
                      Addresses
                    </h5>
                  </div>
                  <div class="card-body">
                    <form [formGroup]="addressForm()">
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Address Type</mat-label>
                            <mat-select formControlName="addressType">
                              <mat-option value="current">Current</mat-option>
                              <mat-option value="permanent">Permanent</mat-option>
                            </mat-select>
                          </mat-form-field>
                        </div>
                        <div class="col-md-6 mb-3">
                          <mat-checkbox formControlName="isCurrent"
                            >Set as Current Address</mat-checkbox
                          >
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-12 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Street Address</mat-label>
                            <input matInput formControlName="street" />
                          </mat-form-field>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-4 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>City</mat-label>
                            <input matInput formControlName="city" />
                          </mat-form-field>
                        </div>
                        <div class="col-md-4 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>State</mat-label>
                            <input matInput formControlName="state" />
                          </mat-form-field>
                        </div>
                        <div class="col-md-4 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Country</mat-label>
                            <input matInput formControlName="country" />
                          </mat-form-field>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-4 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Pincode</mat-label>
                            <input matInput formControlName="pincode" />
                          </mat-form-field>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-12">
                          <button
                            mat-flat-button
                            color="primary"
                            type="button"
                            (click)="addAddress()"
                          >
                            <mat-icon>add</mat-icon>
                            Add Address
                          </button>
                        </div>
                      </div>
                    </form>

                    @if (addresses().length > 0) {
                      <div class="mt-4">
                        <h6>Added Addresses</h6>
                        @for (addr of addresses(); track addr.id) {
                          <div class="card mb-2">
                            <div class="card-body">
                              <div class="d-flex justify-content-between">
                                <div>
                                  <strong>{{ addr.addressType | titlecase }} Address</strong>
                                  @if (addr.isCurrent) {
                                    <span class="badge bg-success ms-2">Current</span>
                                  }
                                  <p class="mb-0 mt-2">{{ addr.street }}</p>
                                  <p class="mb-0">
                                    {{ addr.city }}, {{ addr.state }} - {{ addr.pincode }}
                                  </p>
                                  <p class="mb-0">{{ addr.country }}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              </mat-tab>

              <!-- Bank Details Tab -->
              <mat-tab label="Bank Details">
                <div class="card shadow-sm mb-4 mt-3">
                  <div class="card-header">
                    <h5 class="mb-0">
                      <mat-icon>account_balance</mat-icon>
                      Bank Details
                    </h5>
                  </div>
                  <div class="card-body">
                    <form [formGroup]="bankDetailsForm()">
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Bank Name</mat-label>
                            <input matInput formControlName="bankName" />
                          </mat-form-field>
                        </div>
                        <div class="col-md-6 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Branch Name</mat-label>
                            <input matInput formControlName="branchName" />
                          </mat-form-field>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Account Number</mat-label>
                            <input matInput formControlName="accountNumber" />
                          </mat-form-field>
                        </div>
                        <div class="col-md-6 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>IFSC Code</mat-label>
                            <input matInput formControlName="ifscCode" />
                          </mat-form-field>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Account Holder Name</mat-label>
                            <input matInput formControlName="accountHolderName" />
                          </mat-form-field>
                        </div>
                        <div class="col-md-6 mb-3">
                          <mat-checkbox formControlName="isPrimary">Set as Primary</mat-checkbox>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-12">
                          <button
                            mat-flat-button
                            color="primary"
                            type="button"
                            (click)="saveBankDetails()"
                          >
                            <mat-icon>save</mat-icon>
                            Save Bank Details
                          </button>
                        </div>
                      </div>
                    </form>

                    @if (bankDetails()) {
                      <div class="mt-4">
                        <h6>Current Bank Details</h6>
                        <div class="card">
                          <div class="card-body">
                            <p><strong>Bank:</strong> {{ bankDetails()?.bankName }}</p>
                            <p><strong>Account:</strong> {{ bankDetails()?.accountNumber }}</p>
                            <p><strong>IFSC:</strong> {{ bankDetails()?.ifscCode }}</p>
                            <p><strong>Holder:</strong> {{ bankDetails()?.accountHolderName }}</p>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </mat-tab>

              <!-- Documents Tab -->
              <mat-tab label="Documents">
                <div class="card shadow-sm mb-4 mt-3">
                  <div class="card-header">
                    <h5 class="mb-0">
                      <mat-icon>description</mat-icon>
                      Documents
                    </h5>
                  </div>
                  <div class="card-body">
                    <form [formGroup]="documentForm()">
                      <div class="row">
                        <div class="col-md-4 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Document Type</mat-label>
                            <mat-select formControlName="documentType">
                              <mat-option value="id_proof">ID Proof</mat-option>
                              <mat-option value="address_proof">Address Proof</mat-option>
                              <mat-option value="education_certificate"
                                >Education Certificate</mat-option
                              >
                              <mat-option value="experience_letter">Experience Letter</mat-option>
                              <mat-option value="payslip">Payslip</mat-option>
                              <mat-option value="other">Other</mat-option>
                            </mat-select>
                          </mat-form-field>
                        </div>
                        <div class="col-md-4 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Document Name</mat-label>
                            <input matInput formControlName="documentName" />
                          </mat-form-field>
                        </div>
                        <div class="col-md-4 mb-3">
                          <input
                            type="file"
                            (change)="onFileSelected($event)"
                            class="form-control"
                          />
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-4 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Expiry Date</mat-label>
                            <input
                              matInput
                              [matDatepicker]="docExpPicker"
                              formControlName="expiryDate"
                            />
                            <mat-datepicker-toggle
                              matSuffix
                              [for]="docExpPicker"
                            ></mat-datepicker-toggle>
                            <mat-datepicker #docExpPicker></mat-datepicker>
                          </mat-form-field>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-12">
                          <button
                            mat-flat-button
                            color="primary"
                            type="button"
                            (click)="addDocument()"
                          >
                            <mat-icon>add</mat-icon>
                            Add Document
                          </button>
                        </div>
                      </div>
                    </form>

                    @if (documents().length > 0) {
                      <div class="mt-4">
                        <h6>Uploaded Documents</h6>
                        @for (doc of documents(); track doc.id) {
                          <div class="card mb-2">
                            <div class="card-body">
                              <div class="d-flex justify-content-between align-items-center">
                                <div>
                                  <strong>{{ doc.documentName }}</strong>
                                  <span class="badge bg-info ms-2">{{ doc.documentType }}</span>
                                  @if (doc.isVerified) {
                                    <span class="badge bg-success ms-2">Verified</span>
                                  }
                                </div>
                                <a [href]="doc.filePath" target="_blank" mat-icon-button>
                                  <mat-icon>download</mat-icon>
                                </a>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              </mat-tab>

              <!-- Education Tab -->
              <mat-tab label="Education">
                <div class="card shadow-sm mb-4 mt-3">
                  <div class="card-header">
                    <h5 class="mb-0">
                      <mat-icon>school</mat-icon>
                      Education
                    </h5>
                  </div>
                  <div class="card-body">
                    <form [formGroup]="educationForm()">
                      <div class="row">
                        <div class="col-md-4 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Degree</mat-label>
                            <input matInput formControlName="degree" />
                          </mat-form-field>
                        </div>
                        <div class="col-md-4 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Institution</mat-label>
                            <input matInput formControlName="institution" />
                          </mat-form-field>
                        </div>
                        <div class="col-md-4 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Field of Study</mat-label>
                            <input matInput formControlName="fieldOfStudy" />
                          </mat-form-field>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-3 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Start Year</mat-label>
                            <input matInput type="number" formControlName="startYear" />
                          </mat-form-field>
                        </div>
                        <div class="col-md-3 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>End Year</mat-label>
                            <input matInput type="number" formControlName="endYear" />
                          </mat-form-field>
                        </div>
                        <div class="col-md-3 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Grade/GPA</mat-label>
                            <input matInput formControlName="grade" />
                          </mat-form-field>
                        </div>
                        <div class="col-md-3 mb-3">
                          <mat-checkbox formControlName="isHighest"
                            >Highest Qualification</mat-checkbox
                          >
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-12">
                          <button
                            mat-flat-button
                            color="primary"
                            type="button"
                            (click)="addEducation()"
                          >
                            <mat-icon>add</mat-icon>
                            Add Education
                          </button>
                        </div>
                      </div>
                    </form>

                    @if (education().length > 0) {
                      <div class="mt-4">
                        <h6>Education History</h6>
                        @for (edu of education(); track edu.id) {
                          <div class="card mb-2">
                            <div class="card-body">
                              <div class="d-flex justify-content-between">
                                <div>
                                  <strong>{{ edu.degree }}</strong>
                                  @if (edu.isHighest) {
                                    <span class="badge bg-success ms-2">Highest</span>
                                  }
                                  <p class="mb-0 mt-2">{{ edu.institution }}</p>
                                  <p class="mb-0">
                                    {{ edu.fieldOfStudy }} | {{ edu.startYear }} - {{ edu.endYear }}
                                  </p>
                                  @if (edu.grade) {
                                    <p class="mb-0">Grade: {{ edu.grade }}</p>
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              </mat-tab>

              <!-- Experience Tab -->
              <mat-tab label="Experience">
                <div class="card shadow-sm mb-4 mt-3">
                  <div class="card-header">
                    <h5 class="mb-0">
                      <mat-icon>work_history</mat-icon>
                      Work Experience
                    </h5>
                  </div>
                  <div class="card-body">
                    <form [formGroup]="experienceForm()">
                      <div class="row">
                        <div class="col-md-4 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Company Name</mat-label>
                            <input matInput formControlName="companyName" />
                          </mat-form-field>
                        </div>
                        <div class="col-md-4 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Job Title</mat-label>
                            <input matInput formControlName="jobTitle" />
                          </mat-form-field>
                        </div>
                        <div class="col-md-4 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Employment Type</mat-label>
                            <mat-select formControlName="employmentType">
                              <mat-option value="full_time">Full Time</mat-option>
                              <mat-option value="part_time">Part Time</mat-option>
                              <mat-option value="contract">Contract</mat-option>
                              <mat-option value="internship">Internship</mat-option>
                            </mat-select>
                          </mat-form-field>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-3 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Start Date</mat-label>
                            <input
                              matInput
                              [matDatepicker]="expStartPicker"
                              formControlName="startDate"
                            />
                            <mat-datepicker-toggle
                              matSuffix
                              [for]="expStartPicker"
                            ></mat-datepicker-toggle>
                            <mat-datepicker #expStartPicker></mat-datepicker>
                          </mat-form-field>
                        </div>
                        <div class="col-md-3 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>End Date</mat-label>
                            <input
                              matInput
                              [matDatepicker]="expEndPicker"
                              formControlName="endDate"
                            />
                            <mat-datepicker-toggle
                              matSuffix
                              [for]="expEndPicker"
                            ></mat-datepicker-toggle>
                            <mat-datepicker #expEndPicker></mat-datepicker>
                          </mat-form-field>
                        </div>
                        <div class="col-md-3 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Location</mat-label>
                            <input matInput formControlName="location" />
                          </mat-form-field>
                        </div>
                        <div class="col-md-3 mb-3">
                          <mat-checkbox formControlName="isCurrent">Current Job</mat-checkbox>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-12 mb-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Description</mat-label>
                            <textarea matInput formControlName="description" rows="3"></textarea>
                          </mat-form-field>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-12">
                          <button
                            mat-flat-button
                            color="primary"
                            type="button"
                            (click)="addExperience()"
                          >
                            <mat-icon>add</mat-icon>
                            Add Experience
                          </button>
                        </div>
                      </div>
                    </form>

                    @if (experience().length > 0) {
                      <div class="mt-4">
                        <h6>Work Experience</h6>
                        @for (exp of experience(); track exp.id) {
                          <div class="card mb-2">
                            <div class="card-body">
                              <div class="d-flex justify-content-between">
                                <div>
                                  <strong>{{ exp.jobTitle }}</strong>
                                  @if (exp.isCurrent) {
                                    <span class="badge bg-success ms-2">Current</span>
                                  }
                                  <p class="mb-0 mt-2">{{ exp.companyName }}</p>
                                  <p class="mb-0">
                                    {{ exp.employmentType }} | {{ exp.startDate }} -
                                    {{ exp.endDate || 'Present' }}
                                  </p>
                                  <p class="mb-0">{{ exp.location }}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              </mat-tab>
            }
          </mat-tab-group>

          <div class="row mt-4">
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
      .col-md-6,
      .col-md-3,
      .col-md-12 {
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

      .mt-4 {
        margin-top: 24px;
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
  private employeeApi = inject(EmployeeApiService);
  private destroy$ = new Subject<void>();

  employeeId = signal<number>(0);
  isEditMode = signal<boolean>(false);
  employeeForm = signal<FormGroup>({} as FormGroup);

  // Additional forms for tabs
  jobDetailsForm = signal<FormGroup>({} as FormGroup);
  addressForm = signal<FormGroup>({} as FormGroup);
  bankDetailsForm = signal<FormGroup>({} as FormGroup);
  documentForm = signal<FormGroup>({} as FormGroup);
  educationForm = signal<FormGroup>({} as FormGroup);
  experienceForm = signal<FormGroup>({} as FormGroup);

  // Data signals
  addresses = signal<any[]>([]);
  bankDetails = signal<any>(null);
  documents = signal<any[]>([]);
  education = signal<any[]>([]);
  experience = signal<any[]>([]);
  selectedFile = signal<File | null>(null);

  ngOnInit(): void {
    this.initForms();
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.employeeId.set(id);
      this.store.loadEmployeeById(id);
      this.loadEmployeeData(id);

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

  private initForms(): void {
    // Main employee form
    const mainForm = this.fb.group({
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
    this.employeeForm.set(mainForm);

    // Job Details form
    this.jobDetailsForm.set(
      this.fb.group({
        departmentId: [''],
        designationId: [''],
        gradeId: [''],
        locationId: [''],
        employmentType: ['permanent'],
        dateOfJoining: [''],
        probationPeriod: [6],
        confirmationDate: [''],
        reportingManagerId: [''],
      }),
    );

    // Address form
    this.addressForm.set(
      this.fb.group({
        addressType: ['current', Validators.required],
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        country: ['', Validators.required],
        pincode: ['', Validators.required],
        isCurrent: [true],
      }),
    );

    // Bank Details form
    this.bankDetailsForm.set(
      this.fb.group({
        bankName: ['', Validators.required],
        branchName: [''],
        accountNumber: ['', Validators.required],
        ifscCode: ['', Validators.required],
        accountHolderName: ['', Validators.required],
        isPrimary: [true],
      }),
    );

    // Document form
    this.documentForm.set(
      this.fb.group({
        documentType: ['id_proof', Validators.required],
        documentName: ['', Validators.required],
        expiryDate: [''],
      }),
    );

    // Education form
    this.educationForm.set(
      this.fb.group({
        degree: ['', Validators.required],
        institution: ['', Validators.required],
        fieldOfStudy: [''],
        startYear: ['', Validators.required],
        endYear: [''],
        grade: [''],
        isHighest: [false],
      }),
    );

    // Experience form
    this.experienceForm.set(
      this.fb.group({
        companyName: ['', Validators.required],
        jobTitle: ['', Validators.required],
        employmentType: ['full_time'],
        startDate: ['', Validators.required],
        endDate: [''],
        location: [''],
        isCurrent: [false],
        description: [''],
      }),
    );
  }

  private loadEmployeeData(id: number): void {
    // Load job details
    this.employeeApi.getJobDetails(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.jobDetailsForm().patchValue(response.data);
        }
      },
    });

    // Load addresses
    this.employeeApi.getAddresses(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.addresses.set(response.data);
        }
      },
    });

    // Load bank details
    this.employeeApi.getBankDetails(id).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.length > 0) {
          this.bankDetails.set(response.data[0]);
          this.bankDetailsForm().patchValue(response.data[0]);
        }
      },
    });

    // Load documents
    this.employeeApi.getDocuments(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.documents.set(response.data);
        }
      },
    });

    // Load education
    this.employeeApi.getEducation(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.education.set(response.data);
        }
      },
    });

    // Load experience
    this.employeeApi.getExperience(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.experience.set(response.data);
        }
      },
    });
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    }
  }

  saveJobDetails(): void {
    if (this.jobDetailsForm().invalid) {
      this.jobDetailsForm().markAllAsTouched();
      return;
    }
    this.employeeApi.updateJobDetails(this.employeeId(), this.jobDetailsForm().value).subscribe({
      next: (response) => {
        if (response.success) {
          this.toaster.success('Success', 'Job details saved successfully');
        }
      },
    });
  }

  addAddress(): void {
    if (this.addressForm().invalid) {
      this.addressForm().markAllAsTouched();
      return;
    }
    this.employeeApi.addAddress(this.employeeId(), this.addressForm().value).subscribe({
      next: (response) => {
        if (response.success) {
          this.toaster.success('Success', 'Address added successfully');
          this.loadEmployeeData(this.employeeId());
          this.addressForm().reset({ addressType: 'current', isCurrent: true });
        }
      },
    });
  }

  saveBankDetails(): void {
    if (this.bankDetailsForm().invalid) {
      this.bankDetailsForm().markAllAsTouched();
      return;
    }
    this.employeeApi.updateBankDetails(this.employeeId(), this.bankDetailsForm().value).subscribe({
      next: (response) => {
        if (response.success) {
          this.toaster.success('Success', 'Bank details saved successfully');
          this.loadEmployeeData(this.employeeId());
        }
      },
    });
  }

  addDocument(): void {
    if (this.documentForm().invalid || !this.selectedFile()) {
      this.documentForm().markAllAsTouched();
      if (!this.selectedFile()) {
        this.toaster.error('Validation Error', 'Please select a file');
      }
      return;
    }

    const documentData = {
      ...this.documentForm().value,
      fileName: this.selectedFile()?.name,
    };

    this.employeeApi.addDocument(this.employeeId(), documentData).subscribe({
      next: (response) => {
        if (response.success) {
          this.toaster.success('Success', 'Document added successfully');
          this.loadEmployeeData(this.employeeId());
          this.documentForm().reset({ documentType: 'id_proof' });
          this.selectedFile.set(null);
        }
      },
    });
  }

  addEducation(): void {
    if (this.educationForm().invalid) {
      this.educationForm().markAllAsTouched();
      return;
    }
    this.employeeApi.addEducation(this.employeeId(), this.educationForm().value).subscribe({
      next: (response) => {
        if (response.success) {
          this.toaster.success('Success', 'Education added successfully');
          this.loadEmployeeData(this.employeeId());
          this.educationForm().reset();
        }
      },
    });
  }

  addExperience(): void {
    if (this.experienceForm().invalid) {
      this.experienceForm().markAllAsTouched();
      return;
    }
    this.employeeApi.addExperience(this.employeeId(), this.experienceForm().value).subscribe({
      next: (response) => {
        if (response.success) {
          this.toaster.success('Success', 'Experience added successfully');
          this.loadEmployeeData(this.employeeId());
          this.experienceForm().reset({ employmentType: 'full_time' });
        }
      },
    });
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
