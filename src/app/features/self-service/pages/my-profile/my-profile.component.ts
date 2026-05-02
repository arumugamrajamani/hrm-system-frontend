import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SelfServiceStore } from '../../services/self-service.store';
import { SelfServiceApiService } from '../../services/self-service-api.service';
import { ESSProfileUpdate } from '../../models/self-service.model';

@Component({
  selector: 'app-my-profile',
  standalone: false,
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss'],
})
export class MyProfileComponent implements OnInit {
  personalInfoForm: FormGroup;
  bankDetailsForm: FormGroup;
  profileUpdates: ESSProfileUpdate[] = [];
  loading = false;
  selectedTab = 0;

  personalInfo = {
    name: 'John Doe',
    email: 'john.doe@company.com',
    phone: '+1234567890',
    address: '123 Main St',
    dateOfBirth: '1990-01-01',
    emergencyContact: 'Jane Doe - +1234567891',
  };

  officialInfo = {
    employeeId: 'EMP001',
    designation: 'Software Engineer',
    department: 'IT',
    joiningDate: '2023-01-15',
    manager: 'Jane Smith',
    employmentType: 'Full Time',
    workLocation: 'Head Office',
  };

  documents = [
    {
      id: 1,
      name: 'Offer Letter',
      type: 'offer_letter',
      uploadedAt: '2023-01-15',
      status: 'verified',
    },
    { id: 2, name: 'ID Proof', type: 'id_proof', uploadedAt: '2023-01-15', status: 'verified' },
    {
      id: 3,
      name: 'Address Proof',
      type: 'address_proof',
      uploadedAt: '2023-01-15',
      status: 'pending',
    },
  ];

  bankDetails = {
    accountName: 'John Doe',
    accountNumber: '****1234',
    bankName: 'Example Bank',
    ifscCode: 'EXMP0001234',
    branch: 'Main Branch',
  };

  constructor(
    private fb: FormBuilder,
    private store: SelfServiceStore,
    private api: SelfServiceApiService,
  ) {
    this.personalInfoForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: [''],
      dateOfBirth: [''],
      emergencyContact: [''],
    });

    this.bankDetailsForm = this.fb.group({
      accountName: ['', Validators.required],
      accountNumber: ['', Validators.required],
      bankName: ['', Validators.required],
      ifscCode: ['', Validators.required],
      branch: [''],
    });
  }

  ngOnInit(): void {
    this.personalInfoForm.patchValue(this.personalInfo);
    this.bankDetailsForm.patchValue(this.bankDetails);
    this.store.profileUpdates$.subscribe((updates) => (this.profileUpdates = updates));
    this.store.loadProfileUpdates();
  }

  onSubmitPersonalInfo(): void {
    if (this.personalInfoForm.valid) {
      const formData = this.personalInfoForm.value;
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== this.personalInfo[key as keyof typeof this.personalInfo]) {
          this.requestUpdate(
            key,
            this.personalInfo[key as keyof typeof this.personalInfo],
            formData[key],
          );
        }
      });
    }
  }

  onSubmitBankDetails(): void {
    if (this.bankDetailsForm.valid) {
      this.api
        .requestProfileUpdate({
          field: 'bankDetails',
          currentValue: JSON.stringify(this.bankDetails),
          requestedValue: JSON.stringify(this.bankDetailsForm.value),
          status: 'pending',
          requestedAt: new Date().toISOString(),
        })
        .subscribe(() => this.store.loadProfileUpdates());
    }
  }

  requestUpdate(field: string, current: string, requested: string): void {
    this.api
      .requestProfileUpdate({
        field,
        currentValue: current,
        requestedValue: requested,
        status: 'pending',
        requestedAt: new Date().toISOString(),
      })
      .subscribe(() => this.store.loadProfileUpdates());
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red',
    };
    return colors[status?.toLowerCase()] || 'gray';
  }
}
