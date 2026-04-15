import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LeaveStore } from '../../services/leave.store';
import { LeaveApiService } from '../../services/leave-api.service';
import {
  LeaveBalance,
  LeaveType,
  getLeaveTypeLabel,
  getLeaveBalancePercentage,
} from '../../models/leave.model';
import { Permission } from '../../../../core/models/rbac.models';
import { RbacService } from '../../../../core/services/rbac.service';

@Component({
  selector: 'app-leave-balances',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-coins me-2"></i>
            Leave Balances
          </h2>
        </div>
        <div class="col-auto">
          @if (canManageBalances()) {
            <button class="btn btn-primary" (click)="allocateBalances()">
              <i class="fas fa-plus me-2"></i>
              Allocate Balances
            </button>
          }
        </div>
      </div>

      <!-- Balance Cards -->
      @if (store.loading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>
      } @else {
        <div class="row mb-4">
          @for (balance of store.leaveBalances(); track balance.id) {
            <div class="col-md-3 mb-4">
              <div class="card shadow-sm h-100">
                <div class="card-header bg-white">
                  <h6 class="mb-0">{{ getLeaveTypeLabel(balance.leaveType) }}</h6>
                </div>
                <div class="card-body">
                  <div class="text-center mb-3">
                    <div class="balance-circle" [style.--percentage]="getPercentage(balance) + '%'">
                      <span class="balance-number">{{ balance.available }}</span>
                      <span class="balance-label">Available</span>
                    </div>
                  </div>
                  <div class="row text-center">
                    <div class="col-4">
                      <div class="text-muted small">Total</div>
                      <div class="fw-bold">{{ balance.totalAllocated }}</div>
                    </div>
                    <div class="col-4">
                      <div class="text-muted small">Used</div>
                      <div class="fw-bold">{{ balance.totalAvailed }}</div>
                    </div>
                    <div class="col-4">
                      <div class="text-muted small">Pending</div>
                      <div class="fw-bold">{{ balance.totalPending }}</div>
                    </div>
                  </div>
                  @if (balance.carriedForward && balance.carriedForward > 0) {
                    <div class="mt-2 text-center">
                      <span class="badge bg-info">CF: {{ balance.carriedForward }} days</span>
                    </div>
                  }
                </div>
                <div class="card-footer bg-white">
                  <small class="text-muted">Year: {{ balance.year }}</small>
                  @if (balance.expiryDate) {
                    <small class="text-muted ms-2"
                      >| Expires: {{ balance.expiryDate | date: 'dd MMM' }}</small
                    >
                  }
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-12">
              <div class="text-center py-5 text-muted">
                <i class="fas fa-wallet fa-3x mb-3 d-block"></i>
                No leave balances found. Contact HR to allocate leave balances.
              </div>
            </div>
          }
        </div>

        <!-- Balance Details Table -->
        @if (store.leaveBalances().length > 0) {
          <div class="card shadow-sm">
            <div class="card-header bg-white">
              <h5 class="mb-0">Detailed Balance Report</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th>Year</th>
                      <th>Total Allocated</th>
                      <th>Used</th>
                      <th>Pending</th>
                      <th>Available</th>
                      <th>Carried Forward</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (balance of store.leaveBalances(); track balance.id) {
                      <tr>
                        <td>{{ getLeaveTypeLabel(balance.leaveType) }}</td>
                        <td>{{ balance.year }}</td>
                        <td>{{ balance.totalAllocated }}</td>
                        <td>{{ balance.totalAvailed }}</td>
                        <td>{{ balance.totalPending }}</td>
                        <td>
                          <strong>{{ balance.available }}</strong>
                        </td>
                        <td>{{ balance.carriedForward || 0 }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .balance-circle {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: conic-gradient(var(--primary-color, #0d6efd) var(--percentage, 0%), #e9ecef 0%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
      }
      .balance-number {
        font-size: 24px;
        font-weight: 700;
      }
      .balance-label {
        font-size: 12px;
        color: #6c757d;
      }
    `,
  ],
})
export class LeaveBalancesComponent implements OnInit {
  readonly store = inject(LeaveStore);
  private api = inject(LeaveApiService);
  private router = inject(Router);
  private rbacService = inject(RbacService);

  readonly getLeaveTypeLabel = getLeaveTypeLabel;
  readonly getLeaveBalancePercentage = getLeaveBalancePercentage;
  readonly Permission = Permission;

  getPercentage = (balance: LeaveBalance): number => getLeaveBalancePercentage(balance);

  canManageBalances = (): boolean => this.rbacService.isAdmin() || this.rbacService.isSuperAdmin();

  ngOnInit(): void {
    this.store.loadLeaveBalances();
  }

  allocateBalances(): void {
    alert('Balance allocation dialog - to be implemented');
  }
}
