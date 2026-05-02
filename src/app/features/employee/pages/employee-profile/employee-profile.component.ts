import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmployeeStore } from '../../services/employee.store';
import {
  EmployeeProfile,
  EmployeeDocument,
  EmergencyContact,
  Dependent,
  BankDetails,
  TaxDetails,
  getEmploymentStatusLabel,
} from '../../models/employee.model';
import { RbacService } from '../../../../core/services/rbac.service';
import { ScopeRbacService } from '../../../../core/services/scope-rbac.service';
import { Permission } from '../../../../core/models/rbac.models';
import { ToasterService } from '../../../../core/services';

type ProfileTab =
  | 'overview'
  | 'documents'
  | 'contacts'
  | 'dependents'
  | 'compensation'
  | 'bankTax'
  | 'history';

@Component({
  selector: 'app-employee-profile',
  standalone: false,
  template: `
    <div class="employee-profile">
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (error()) {
        <div class="error-container">
          <p>{{ error() }}</p>
          <button mat-raised-button color="primary" (click)="loadProfile(employee()!.id)">
            Retry
          </button>
        </div>
      } @else if (employee()) {
        <div class="profile-header">
          <div class="header-left">
            <div class="avatar">
              @if (employee()?.profilePhoto) {
                <img [src]="employee()!.profilePhoto" [alt]="employee()!.fullName" />
              } @else {
                <div class="avatar-placeholder">{{ getInitials() }}</div>
              }
            </div>
            <div class="header-info">
              <h1>{{ employee()!.fullName }}</h1>
              <p class="designation">
                {{ employee()!.designationName }} - {{ employee()!.departmentName }}
              </p>
              <div class="meta">
                <span
                  class="badge"
                  [class.badge-success]="employee()!.status === 'active'"
                  [class.badge-warning]="employee()!.status !== 'active'"
                >
                  {{ getEmploymentStatusLabel(employee()!.employmentStatus!) }}
                </span>
                <span class="employee-code">{{ employee()!.employeeCode }}</span>
                @if (employee()!.locationName) {
                  <span class="location"
                    ><i class="fas fa-map-marker-alt"></i> {{ employee()!.locationName }}</span
                  >
                }
              </div>
            </div>
          </div>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="editEmployee()">
              <mat-icon>edit</mat-icon> Edit
            </button>
            <button mat-button (click)="goBack()"><mat-icon>arrow_back</mat-icon> Back</button>
          </div>
        </div>

        <div class="profile-completeness" *ngIf="profileCompleteness()">
          <div class="completeness-bar">
            <span>Profile Completeness: {{ profileCompleteness() }}%</span>
            <div class="bar-bg">
              <div class="bar-fill" [style.width.%]="profileCompleteness()"></div>
            </div>
          </div>
        </div>

        <mat-tab-group
          [(selectedIndex)]="activeTabIndex"
          (selectedIndexChange)="onTabChange($event)"
          class="profile-tabs"
        >
          <mat-tab label="Overview">
            <ng-template matTabContent>
              <div class="tab-content">
                <div class="info-grid">
                  <div class="info-card">
                    <h3>Personal Information</h3>
                    <div class="info-row">
                      <label>Email</label><span>{{ employee()!.email }}</span>
                    </div>
                    <div class="info-row">
                      <label>Phone</label><span>{{ employee()!.phone || '-' }}</span>
                    </div>
                    <div class="info-row">
                      <label>Date of Birth</label
                      ><span>{{ (employee()!.dateOfBirth | date: 'mediumDate') || '-' }}</span>
                    </div>
                    <div class="info-row">
                      <label>Date of Joining</label
                      ><span>{{ (employee()!.dateOfJoining | date: 'mediumDate') || '-' }}</span>
                    </div>
                    @if (employee()!.confirmationDate) {
                      <div class="info-row">
                        <label>Confirmation Date</label
                        ><span>{{ employee()!.confirmationDate | date: 'mediumDate' }}</span>
                      </div>
                    }
                  </div>
                  <div class="info-card">
                    <h3>Official Information</h3>
                    <div class="info-row">
                      <label>Department</label><span>{{ employee()!.departmentName || '-' }}</span>
                    </div>
                    <div class="info-row">
                      <label>Designation</label
                      ><span>{{ employee()!.designationName || '-' }}</span>
                    </div>
                    <div class="info-row">
                      <label>Employment Type</label
                      ><span>{{ employee()!.employmentType || '-' }}</span>
                    </div>
                    <div class="info-row">
                      <label>Reporting Manager</label
                      ><span>{{ employee()!.reportingManagerName || '-' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </ng-template>
          </mat-tab>

          <mat-tab label="Documents ({{ documents().length }})">
            <ng-template matTabContent>
              <div class="tab-content">
                @if (documents().length === 0) {
                  <div class="empty-state">No documents uploaded</div>
                } @else {
                  <table mat-table [dataSource]="documents()" class="data-table">
                    <ng-container matColumnDef="documentName">
                      <th mat-header-cell *matHeaderCellDef>Document</th>
                      <td mat-cell *matCellDef="let doc">{{ doc.documentName }}</td>
                    </ng-container>
                    <ng-container matColumnDef="documentType">
                      <th mat-header-cell *matHeaderCellDef>Type</th>
                      <td mat-cell *matCellDef="let doc">
                        <span class="badge bg-secondary">{{ doc.documentType }}</span>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="expiryDate">
                      <th mat-header-cell *matHeaderCellDef>Expiry</th>
                      <td mat-cell *matCellDef="let doc">
                        {{ (doc.expiryDate | date: 'mediumDate') || '-' }}
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="isVerified">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let doc">
                        @if (doc.isVerified) {
                          <span class="badge bg-success">Verified</span>
                        } @else {
                          <span class="badge bg-warning">Pending</span>
                        }
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let doc">
                        <button mat-icon-button matTooltip="Download">
                          <mat-icon>download</mat-icon>
                        </button>
                      </td>
                    </ng-container>
                    <tr
                      mat-header-row
                      *matHeaderRowDef="[
                        'documentName',
                        'documentType',
                        'expiryDate',
                        'isVerified',
                        'actions',
                      ]"
                    ></tr>
                    <tr
                      mat-row
                      *matRowDef="
                        let row;
                        columns: [
                          'documentName',
                          'documentType',
                          'expiryDate',
                          'isVerified',
                          'actions',
                        ]
                      "
                    ></tr>
                  </table>
                }
              </div>
            </ng-template>
          </mat-tab>

          <mat-tab label="Emergency Contacts ({{ contacts().length }})">
            <ng-template matTabContent>
              <div class="tab-content">
                @if (contacts().length === 0) {
                  <div class="empty-state">No emergency contacts added</div>
                } @else {
                  <table mat-table [dataSource]="contacts()" class="data-table">
                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef>Name</th>
                      <td mat-cell *matCellDef="let c">{{ c.name }}</td>
                    </ng-container>
                    <ng-container matColumnDef="relationship">
                      <th mat-header-cell *matHeaderCellDef>Relationship</th>
                      <td mat-cell *matCellDef="let c">{{ c.relationship }}</td>
                    </ng-container>
                    <ng-container matColumnDef="phone">
                      <th mat-header-cell *matHeaderCellDef>Phone</th>
                      <td mat-cell *matCellDef="let c">{{ c.phone }}</td>
                    </ng-container>
                    <ng-container matColumnDef="email">
                      <th mat-header-cell *matHeaderCellDef>Email</th>
                      <td mat-cell *matCellDef="let c">{{ c.email || '-' }}</td>
                    </ng-container>
                    <ng-container matColumnDef="isPrimary">
                      <th mat-header-cell *matHeaderCellDef>Primary</th>
                      <td mat-cell *matCellDef="let c">
                        @if (c.isPrimary) {
                          <mat-icon color="primary">star</mat-icon>
                        }
                      </td>
                    </ng-container>
                    <tr
                      mat-header-row
                      *matHeaderRowDef="['name', 'relationship', 'phone', 'email', 'isPrimary']"
                    ></tr>
                    <tr
                      mat-row
                      *matRowDef="
                        let row;
                        columns: ['name', 'relationship', 'phone', 'email', 'isPrimary']
                      "
                    ></tr>
                  </table>
                }
              </div>
            </ng-template>
          </mat-tab>

          <mat-tab label="Dependents ({{ dependents().length }})">
            <ng-template matTabContent>
              <div class="tab-content">
                @if (dependents().length === 0) {
                  <div class="empty-state">No dependents added</div>
                } @else {
                  <table mat-table [dataSource]="dependents()" class="data-table">
                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef>Name</th>
                      <td mat-cell *matCellDef="let d">{{ d.name }}</td>
                    </ng-container>
                    <ng-container matColumnDef="relationship">
                      <th mat-header-cell *matHeaderCellDef>Relationship</th>
                      <td mat-cell *matCellDef="let d">{{ d.relationship }}</td>
                    </ng-container>
                    <ng-container matColumnDef="dateOfBirth">
                      <th mat-header-cell *matHeaderCellDef>Date of Birth</th>
                      <td mat-cell *matCellDef="let d">
                        {{ (d.dateOfBirth | date: 'mediumDate') || '-' }}
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="isNominee">
                      <th mat-header-cell *matHeaderCellDef>Nominee</th>
                      <td mat-cell *matCellDef="let d">
                        @if (d.isNominee) {
                          <mat-icon color="accent">verified</mat-icon>
                        }
                      </td>
                    </ng-container>
                    <tr
                      mat-header-row
                      *matHeaderRowDef="['name', 'relationship', 'dateOfBirth', 'isNominee']"
                    ></tr>
                    <tr
                      mat-row
                      *matRowDef="
                        let row;
                        columns: ['name', 'relationship', 'dateOfBirth', 'isNominee']
                      "
                    ></tr>
                  </table>
                }
              </div>
            </ng-template>
          </mat-tab>

          <mat-tab label="Compensation">
            <ng-template matTabContent>
              <div class="tab-content">
                <div class="info-card">
                  <h3>Salary Details</h3>
                  @if (canViewSalary()) {
                    <div class="info-row">
                      <label>Annual CTC</label
                      ><span class="salary-value">{{ formatCurrency(employee()!.salary) }}</span>
                    </div>
                  } @else {
                    <div class="info-row">
                      <label>Salary</label><span class="masked">•••••••• (Contact HR)</span>
                    </div>
                  }
                </div>
              </div>
            </ng-template>
          </mat-tab>

          <mat-tab label="Bank & Tax">
            <ng-template matTabContent>
              <div class="tab-content">
                <div class="info-grid">
                  <div class="info-card">
                    <h3>Bank Details</h3>
                    @if (canViewBankDetails()) {
                      <div class="info-row">
                        <label>Bank Name</label><span>{{ bankDetails()?.bankName || '-' }}</span>
                      </div>
                      <div class="info-row">
                        <label>Account Number</label
                        ><span>{{ bankDetails()?.accountNumber || '-' }}</span>
                      </div>
                      <div class="info-row">
                        <label>IFSC Code</label><span>{{ bankDetails()?.ifscCode || '-' }}</span>
                      </div>
                      <div class="info-row">
                        <label>Account Holder</label
                        ><span>{{ bankDetails()?.accountHolderName || '-' }}</span>
                      </div>
                    } @else {
                      <div class="masked-content">Bank details are confidential</div>
                    }
                  </div>
                  <div class="info-card">
                    <h3>Tax Details</h3>
                    @if (canViewTaxDetails()) {
                      <div class="info-row">
                        <label>PAN Number</label
                        ><span>{{ maskValue(taxDetails()?.panNumber) }}</span>
                      </div>
                      <div class="info-row">
                        <label>Aadhar Number</label
                        ><span>{{ maskValue(taxDetails()?.aadharNumber) }}</span>
                      </div>
                      <div class="info-row">
                        <label>UAN Number</label><span>{{ taxDetails()?.uanNumber || '-' }}</span>
                      </div>
                    } @else {
                      <div class="masked-content">Tax details are confidential</div>
                    }
                  </div>
                </div>
              </div>
            </ng-template>
          </mat-tab>

          <mat-tab label="History">
            <ng-template matTabContent>
              <div class="tab-content">
                <div class="timeline">
                  <div class="timeline-item">
                    <div class="timeline-dot joined"></div>
                    <div class="timeline-content">
                      <h4>Joined Organization</h4>
                      <p class="date">{{ employee()!.dateOfJoining | date: 'mediumDate' }}</p>
                    </div>
                  </div>
                  @if (employee()!.confirmationDate) {
                    <div class="timeline-item">
                      <div class="timeline-dot confirmed"></div>
                      <div class="timeline-content">
                        <h4>Confirmation</h4>
                        <p class="date">{{ employee()!.confirmationDate | date: 'mediumDate' }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </ng-template>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [
    `
      .employee-profile {
        padding: 24px;
      }
      .profile-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
        padding: 24px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      .header-left {
        display: flex;
        gap: 20px;
        align-items: center;
      }
      .avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        overflow: hidden;
        background: #e0e0e0;
      }
      .avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .avatar-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        font-weight: 600;
        color: #666;
      }
      .header-info h1 {
        margin: 0 0 4px;
        font-size: 24px;
      }
      .designation {
        margin: 0 0 8px;
        color: #666;
      }
      .meta {
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
      }
      .badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
      }
      .badge-success {
        background: #e8f5e9;
        color: #2e7d32;
      }
      .badge-warning {
        background: #fff3e0;
        color: #e65100;
      }
      .employee-code {
        background: #f5f5f5;
        padding: 2px 8px;
        border-radius: 4px;
        font-family: monospace;
      }
      .location {
        color: #666;
      }
      .profile-completeness {
        margin-bottom: 16px;
      }
      .completeness-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: white;
        border-radius: 8px;
      }
      .bar-bg {
        flex: 1;
        height: 8px;
        background: #e0e0e0;
        border-radius: 4px;
      }
      .bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #2196f3, #4caf50);
        border-radius: 4px;
        transition: width 0.3s;
      }
      .profile-tabs {
        background: white;
        border-radius: 8px;
      }
      .tab-content {
        padding: 24px;
      }
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
      }
      .info-card {
        background: #fafafa;
        padding: 16px;
        border-radius: 8px;
      }
      .info-card h3 {
        margin: 0 0 12px;
        font-size: 16px;
        color: #333;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #eee;
      }
      .info-row label {
        color: #666;
        font-weight: 500;
      }
      .salary-value {
        font-weight: 600;
        color: #2e7d32;
      }
      .masked {
        color: #999;
        font-style: italic;
      }
      .masked-content {
        color: #999;
        text-align: center;
        padding: 24px;
      }
      .data-table {
        width: 100%;
      }
      .empty-state {
        text-align: center;
        padding: 48px;
        color: #999;
      }
      .loading-container,
      .error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        gap: 16px;
      }
      .timeline {
        padding: 24px 0;
      }
      .timeline-item {
        display: flex;
        gap: 16px;
        padding: 16px 0;
      }
      .timeline-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-top: 4px;
        flex-shrink: 0;
      }
      .timeline-dot.joined {
        background: #4caf50;
      }
      .timeline-dot.confirmed {
        background: #2196f3;
      }
      .timeline-content h4 {
        margin: 0 0 4px;
      }
      .timeline-content .date {
        margin: 0;
        color: #666;
        font-size: 14px;
      }
    `,
  ],
})
export class EmployeeProfileComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(EmployeeStore);
  private rbacService = inject(RbacService);
  private scopeRbacService = inject(ScopeRbacService);
  private toasterService = inject(ToasterService);
  private destroy$ = new Subject<void>();

  activeTab = signal<ProfileTab>('overview');
  activeTabIndex = signal<number>(0);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  employee = signal<any | null>(null);
  profileCompleteness = signal<number>(0);

  documents = signal<EmployeeDocument[]>([]);
  contacts = signal<EmergencyContact[]>([]);
  dependents = signal<Dependent[]>([]);
  bankDetails = signal<BankDetails | null>(null);
  taxDetails = signal<TaxDetails | null>(null);

  readonly tabs: ProfileTab[] = [
    'overview',
    'documents',
    'contacts',
    'dependents',
    'compensation',
    'bankTax',
    'history',
  ];
  readonly getEmploymentStatusLabel = getEmploymentStatusLabel;

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.loadProfile(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProfile(id: number | string): void {
    this.loading.set(true);
    this.error.set(null);
    const empId = typeof id === 'string' ? parseInt(id, 10) : id;

    this.store.loadEmployeeById(empId);

    setTimeout(() => {
      const emp = this.store.selected();
      if (emp) {
        this.employee.set(emp);
        this.documents.set((emp as any).documents || []);
        this.contacts.set((emp as any).emergencyContacts || []);
        this.dependents.set((emp as any).dependents || []);
        this.bankDetails.set((emp as any).bankDetails || null);
        this.taxDetails.set((emp as any).taxDetails || null);
        this.profileCompleteness.set(this.calculateCompleteness(emp));
        this.loading.set(false);
      } else if (this.store.error()) {
        this.error.set(this.store.error());
        this.loading.set(false);
      }
    }, 500);
  }

  onTabChange(index: number): void {
    this.activeTab.set(this.tabs[index]);
  }

  canViewSalary(): boolean {
    return this.store.canViewField('salary');
  }

  canViewBankDetails(): boolean {
    return this.store.canViewField('bankDetails');
  }

  canViewTaxDetails(): boolean {
    return this.store.canViewField('taxDetails');
  }

  maskValue(value?: string): string {
    if (!value) return '-';
    if (value.length <= 4) return '****';
    return '****' + value.slice(-4);
  }

  formatCurrency(amount?: number): string {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  getInitials(): string {
    const emp = this.employee();
    if (!emp) return '';
    return (emp.firstName?.[0] || '') + (emp.lastName?.[0] || '');
  }

  calculateCompleteness(data: any): number {
    let score = 0;
    let maxScore = 8;
    if (data.firstName && data.lastName) score++;
    if (data.email) score++;
    if (data.phone) score++;
    if (data.dateOfBirth) score++;
    if (data.departmentId) score++;
    if (data.designationId) score++;
    if (data.emergencyContacts?.length > 0) score++;
    if (data.bankDetails) score++;
    return Math.round((score / maxScore) * 100);
  }

  editEmployee(): void {
    this.router.navigate(['/employees', 'edit', this.employee()?.id]);
  }

  goBack(): void {
    this.router.navigate(['/employees', 'list']);
  }
}
