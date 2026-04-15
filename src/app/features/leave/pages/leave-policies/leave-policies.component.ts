import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LeaveStore } from '../../services/leave.store';
import { LeaveApiService } from '../../services/leave-api.service';
import { LeavePolicy, LeaveType, getLeaveTypeLabel } from '../../models/leave.model';
import { Permission } from '../../../../core/models/rbac.models';
import { RbacService } from '../../../../core/services/rbac.service';

@Component({
  selector: 'app-leave-policies',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-policy me-2"></i>
            Leave Policies
          </h2>
        </div>
        <div class="col-auto">
          @if (store.canManagePolicies()) {
            <button class="btn btn-primary" (click)="openModal()">
              <i class="fas fa-plus me-2"></i>
              Add Policy
            </button>
          }
        </div>
      </div>

      @if (store.loading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>
      } @else {
        <div class="row">
          @for (policy of store.policies(); track policy.id) {
            <div class="col-md-6 mb-4">
              <div class="card shadow-sm h-100">
                <div class="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">{{ policy.name }}</h5>
                  <span
                    class="badge"
                    [class.bg-success]="policy.isActive"
                    [class.bg-secondary]="!policy.isActive"
                  >
                    {{ policy.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-6 mb-2">
                      <label class="text-muted small">Leave Type</label>
                      <div>
                        <strong>{{ getLeaveTypeLabel(policy.leaveType) }}</strong>
                      </div>
                    </div>
                    <div class="col-6 mb-2">
                      <label class="text-muted small">Code</label>
                      <div>{{ policy.code }}</div>
                    </div>
                    <div class="col-6 mb-2">
                      <label class="text-muted small">Max Days/Year</label>
                      <div>{{ policy.maxDaysPerYear }} days</div>
                    </div>
                    <div class="col-6 mb-2">
                      <label class="text-muted small">Min Days/Application</label>
                      <div>{{ policy.minDaysPerApplication }} days</div>
                    </div>
                    @if (policy.maxDaysPerApplication) {
                      <div class="col-6 mb-2">
                        <label class="text-muted small">Max Days/Application</label>
                        <div>{{ policy.maxDaysPerApplication }} days</div>
                      </div>
                    }
                    @if (policy.maxConsecutiveDays) {
                      <div class="col-6 mb-2">
                        <label class="text-muted small">Max Consecutive Days</label>
                        <div>{{ policy.maxConsecutiveDays }} days</div>
                      </div>
                    }
                    <div class="col-6 mb-2">
                      <label class="text-muted small">Requires Approval</label>
                      <div>{{ policy.requiresApproval ? 'Yes' : 'No' }}</div>
                    </div>
                    <div class="col-6 mb-2">
                      <label class="text-muted small">Requires Document</label>
                      <div>{{ policy.requiresDocument ? 'Yes' : 'No' }}</div>
                    </div>
                  </div>
                  @if (policy.description) {
                    <div class="mt-2">
                      <label class="text-muted small">Description</label>
                      <div>{{ policy.description }}</div>
                    </div>
                  }
                </div>
                @if (store.canManagePolicies()) {
                  <div class="card-footer bg-white">
                    <button
                      class="btn btn-sm btn-outline-primary me-2"
                      (click)="editPolicy(policy)"
                    >
                      <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline-danger" (click)="deletePolicy(policy)">
                      <i class="fas fa-trash"></i> Delete
                    </button>
                  </div>
                }
              </div>
            </div>
          } @empty {
            <div class="col-12">
              <div class="text-center py-5 text-muted">
                <i class="fas fa-file-alt fa-3x mb-3 d-block"></i>
                No leave policies configured. Add your first policy.
              </div>
            </div>
          }
        </div>
      }

      <!-- Policy Modal -->
      @if (showModal()) {
        <div class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">{{ editingPolicy() ? 'Edit' : 'Add' }} Leave Policy</h5>
                <button type="button" class="btn-close" (click)="closeModal()"></button>
              </div>
              <div class="modal-body">
                <form [formGroup]="policyForm">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label"
                        >Policy Name <span class="text-danger">*</span></label
                      >
                      <input type="text" class="form-control" formControlName="name" />
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Code <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" formControlName="code" />
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label"
                        >Leave Type <span class="text-danger">*</span></label
                      >
                      <select class="form-select" formControlName="leaveType">
                        @for (type of leaveTypes; track type) {
                          <option [value]="type">{{ getLeaveTypeLabel(type) }}</option>
                        }
                      </select>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label"
                        >Max Days Per Year <span class="text-danger">*</span></label
                      >
                      <input
                        type="number"
                        class="form-control"
                        formControlName="maxDaysPerYear"
                        min="0"
                      />
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label"
                        >Min Days Per Application <span class="text-danger">*</span></label
                      >
                      <input
                        type="number"
                        class="form-control"
                        formControlName="minDaysPerApplication"
                        min="0"
                      />
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Max Days Per Application</label>
                      <input
                        type="number"
                        class="form-control"
                        formControlName="maxDaysPerApplication"
                        min="0"
                      />
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Max Consecutive Days</label>
                      <input
                        type="number"
                        class="form-control"
                        formControlName="maxConsecutiveDays"
                        min="0"
                      />
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Can Carry Forward</label>
                      <input
                        type="number"
                        class="form-control"
                        formControlName="canCarryForward"
                        min="0"
                      />
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <div class="form-check">
                        <input
                          type="checkbox"
                          class="form-check-input"
                          formControlName="requiresApproval"
                          id="requiresApproval"
                        />
                        <label class="form-check-label" for="requiresApproval"
                          >Requires Approval</label
                        >
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <div class="form-check">
                        <input
                          type="checkbox"
                          class="form-check-input"
                          formControlName="requiresDocument"
                          id="requiresDocument"
                        />
                        <label class="form-check-label" for="requiresDocument"
                          >Requires Document</label
                        >
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <div class="form-check">
                        <input
                          type="checkbox"
                          class="form-check-input"
                          formControlName="isActive"
                          id="isActive"
                        />
                        <label class="form-check-label" for="isActive">Active</label>
                      </div>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Description</label>
                    <textarea
                      class="form-control"
                      formControlName="description"
                      rows="3"
                    ></textarea>
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">
                  Cancel
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  (click)="savePolicy()"
                  [disabled]="policyForm.invalid"
                >
                  {{ editingPolicy() ? 'Update' : 'Create' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class LeavePoliciesComponent implements OnInit {
  readonly store = inject(LeaveStore);
  private api = inject(LeaveApiService);
  private router = inject(Router);
  private rbacService = inject(RbacService);

  showModal = () => false;
  editingPolicy = () => null;
  policyForm: any;

  leaveTypes = Object.values(LeaveType);
  readonly getLeaveTypeLabel = getLeaveTypeLabel;
  readonly Permission = Permission;

  get canManagePolicies(): () => boolean {
    return () => this.rbacService.isAdmin() || this.rbacService.isSuperAdmin();
  }

  ngOnInit(): void {
    this.store.loadPolicies();
  }

  openModal(policy?: LeavePolicy): void {
    // Modal logic would be implemented with proper modal service
  }

  closeModal(): void {
    // Modal close logic
  }

  editPolicy(policy: LeavePolicy): void {
    // Edit policy logic
  }

  deletePolicy(policy: LeavePolicy): void {
    if (confirm(`Delete policy "${policy.name}"?`)) {
      this.store.deletePolicy(policy.id).subscribe();
    }
  }

  savePolicy(): void {
    // Save policy logic
  }
}
