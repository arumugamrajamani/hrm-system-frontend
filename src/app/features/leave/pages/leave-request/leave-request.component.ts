import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { LeaveStore } from '../../services/leave.store';
import { LeaveApiService } from '../../services/leave-api.service';
import { LeaveType, LeaveRequest, getLeaveTypeLabel } from '../../models/leave.model';
import { RbacService } from '../../../../core/services/rbac.service';
import { Permission } from '../../../../core/models/rbac.models';

@Component({
  selector: 'app-leave-request',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-calendar-plus me-2"></i>
            {{ isEditMode ? 'Edit Leave Request' : isViewMode ? 'Leave Details' : 'Apply Leave' }}
          </h2>
        </div>
        <div class="col-auto">
          <button class="btn btn-outline-secondary me-2" (click)="goBack()">
            <i class="fas fa-arrow-left me-2"></i>
            Back
          </button>
        </div>
      </div>

      @if (store.loading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>
      } @else {
        <div class="row">
          <div class="col-lg-8">
            <div class="card shadow-sm">
              <div class="card-header bg-white">
                <h5 class="mb-0">Leave Details</h5>
              </div>
              <div class="card-body">
                <form [formGroup]="leaveForm" (ngSubmit)="onSubmit()">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label"
                        >Leave Type <span class="text-danger">*</span></label
                      >
                      <select class="form-select" formControlName="leaveType">
                        <option value="">Select Leave Type</option>
                        @for (type of leaveTypes; track type) {
                          <option [value]="type">{{ getLeaveTypeLabel(type) }}</option>
                        }
                      </select>
                      @if (
                        leaveForm.get('leaveType')?.touched && leaveForm.get('leaveType')?.invalid
                      ) {
                        <div class="text-danger small mt-1">Leave type is required</div>
                      }
                    </div>

                    <div class="col-md-3 mb-3">
                      <label class="form-label"
                        >Start Date <span class="text-danger">*</span></label
                      >
                      <input
                        type="date"
                        class="form-control"
                        formControlName="startDate"
                        [min]="minDate"
                      />
                      @if (
                        leaveForm.get('startDate')?.touched && leaveForm.get('startDate')?.invalid
                      ) {
                        <div class="text-danger small mt-1">Start date is required</div>
                      }
                    </div>

                    <div class="col-md-3 mb-3">
                      <label class="form-label">End Date <span class="text-danger">*</span></label>
                      <input
                        type="date"
                        class="form-control"
                        formControlName="endDate"
                        [min]="leaveForm.get('startDate')?.value || minDate"
                      />
                      @if (leaveForm.get('endDate')?.touched && leaveForm.get('endDate')?.invalid) {
                        <div class="text-danger small mt-1">End date is required</div>
                      }
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-12 mb-3">
                      <label class="form-label">Reason <span class="text-danger">*</span></label>
                      <textarea
                        class="form-control"
                        formControlName="reason"
                        rows="3"
                        placeholder="Enter reason for leave..."
                      ></textarea>
                      @if (leaveForm.get('reason')?.touched && leaveForm.get('reason')?.invalid) {
                        <div class="text-danger small mt-1">Reason is required</div>
                      }
                    </div>
                  </div>

                  @if (!isViewMode) {
                    <div class="row">
                      <div class="col-md-12">
                        <button
                          type="submit"
                          class="btn btn-primary"
                          [disabled]="leaveForm.invalid || store.loading()"
                        >
                          <i class="fas fa-paper-plane me-2"></i>
                          {{ isEditMode ? 'Update Request' : 'Submit Request' }}
                        </button>
                        <button
                          type="button"
                          class="btn btn-outline-secondary ms-2"
                          (click)="saveDraft()"
                        >
                          <i class="fas fa-save me-2"></i>
                          Save as Draft
                        </button>
                      </div>
                    </div>
                  }
                </form>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            @if (selectedRequest()) {
              <div class="card shadow-sm mb-3">
                <div class="card-header bg-white">
                  <h5 class="mb-0">Request Information</h5>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <label class="text-muted small">Status</label>
                    <div>
                      <span
                        class="badge"
                        [class.bg-secondary]="selectedRequest()?.status === 'draft'"
                        [class.bg-warning]="selectedRequest()?.status === 'pending'"
                        [class.bg-success]="selectedRequest()?.status === 'approved'"
                        [class.bg-danger]="selectedRequest()?.status === 'rejected'"
                      >
                        {{ selectedRequest()?.status | titlecase }}
                      </span>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="text-muted small">Applied On</label>
                    <div>{{ selectedRequest()?.createdAt | date: 'dd MMM yyyy' }}</div>
                  </div>
                  @if (selectedRequest()?.approvedAt) {
                    <div class="mb-3">
                      <label class="text-muted small">Approved On</label>
                      <div>{{ selectedRequest()?.approvedAt | date: 'dd MMM yyyy' }}</div>
                    </div>
                  }
                  @if (selectedRequest()?.comments) {
                    <div class="mb-3">
                      <label class="text-muted small">Manager Comments</label>
                      <div>{{ selectedRequest()?.comments }}</div>
                    </div>
                  }
                </div>
              </div>

              @if (canApprove() && selectedRequest()?.status === 'pending') {
                <div class="card shadow-sm">
                  <div class="card-header bg-white">
                    <h5 class="mb-0">Approval Actions</h5>
                  </div>
                  <div class="card-body">
                    <div class="mb-3">
                      <label class="form-label">Comments (Optional)</label>
                      <textarea
                        class="form-control"
                        [(ngModel)]="approvalComments"
                        rows="3"
                        placeholder="Add comments..."
                      ></textarea>
                    </div>
                    <div class="d-grid gap-2">
                      <button class="btn btn-success" (click)="onApprove()">
                        <i class="fas fa-check me-2"></i>
                        Approve
                      </button>
                      <button class="btn btn-danger" (click)="onReject()">
                        <i class="fas fa-times me-2"></i>
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              }

              @if (selectedRequest()?.status === 'pending' && !canApprove()) {
                <div class="card shadow-sm">
                  <div class="card-body">
                    <button class="btn btn-outline-danger w-100" (click)="onCancel()">
                      <i class="fas fa-times-circle me-2"></i>
                      Cancel Request
                    </button>
                  </div>
                </div>
              }
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class LeaveRequestComponent implements OnInit {
  readonly store = inject(LeaveStore);
  private api = inject(LeaveApiService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private rbacService = inject(RbacService);
  private destroy$ = new Subject<void>();

  leaveForm!: FormGroup;
  selectedRequest = signal<LeaveRequest | null>(null);
  approvalComments = '';
  isEditMode = false;
  isViewMode = false;
  requestId: number | null = null;

  leaveTypes = Object.values(LeaveType);
  minDate = new Date().toISOString().split('T')[0];

  readonly Permission = Permission;
  readonly getLeaveTypeLabel = getLeaveTypeLabel;

  get canApprove(): () => boolean {
    return () => this.rbacService.hasPermission(Permission.EDIT);
  }

  ngOnInit(): void {
    this.initForm();
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['id']) {
        this.requestId = +params['id'];
        this.loadRequest(this.requestId);
      }
    });
  }

  private initForm(): void {
    this.leaveForm = this.fb.group({
      leaveType: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', Validators.required],
    });
  }

  private loadRequest(id: number): void {
    this.isViewMode = true;
    this.api.getById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.selectedRequest.set(response.data);
          this.leaveForm.patchValue({
            leaveType: response.data.leaveType,
            startDate: response.data.startDate,
            endDate: response.data.endDate,
            reason: response.data.reason,
          });
          this.leaveForm.disable();
        }
      },
    });
  }

  onSubmit(): void {
    if (this.leaveForm.invalid) return;

    const data = this.leaveForm.value;
    data.status = 'pending';

    if (this.requestId) {
      this.api.update(this.requestId, data).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Leave request updated successfully');
            this.router.navigate(['/leave']);
          }
        },
      });
    } else {
      this.store.createRequest(data).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Leave request submitted successfully');
            this.router.navigate(['/leave']);
          }
        },
      });
    }
  }

  saveDraft(): void {
    if (this.leaveForm.invalid) return;

    const data = this.leaveForm.value;
    data.status = 'draft';

    this.store.createRequest(data).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Leave request saved as draft');
          this.router.navigate(['/leave']);
        }
      },
    });
  }

  onApprove(): void {
    if (!this.requestId) return;
    if (confirm('Approve this leave request?')) {
      this.store.approveRequest(this.requestId, this.approvalComments).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Leave request approved');
            this.router.navigate(['/leave']);
          }
        },
      });
    }
  }

  onReject(): void {
    if (!this.requestId) return;
    const comments = prompt('Enter rejection reason:');
    if (comments) {
      this.store.rejectRequest(this.requestId, comments).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Leave request rejected');
            this.router.navigate(['/leave']);
          }
        },
      });
    }
  }

  onCancel(): void {
    if (!this.requestId) return;
    if (confirm('Cancel this leave request?')) {
      this.store.cancelRequest(this.requestId).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Leave request cancelled');
            this.router.navigate(['/leave']);
          }
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/leave']);
  }
}
