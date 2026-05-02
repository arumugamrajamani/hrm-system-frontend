import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { LeaveStore } from '../../services/leave.store';
import { LeaveAccrual, LeaveAccrualRule } from '../../models/leave.model';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-leave-accruals',
  standalone: false,
  template: `
    <div class="accruals-container">
      <div class="page-header">
        <h2>Leave Accruals & Carry Forward</h2>
        <button class="btn btn-primary" (click)="runAccrual()">Run Accrual</button>
      </div>

      <div class="filters-card card">
        <div class="card-body">
          <form [formGroup]="filterForm" class="row g-3 align-items-end">
            <div class="col-md-3">
              <label class="form-label">Employee</label>
              <input
                type="text"
                class="form-control"
                formControlName="employeeSearch"
                placeholder="Search employee..."
              />
            </div>
            <div class="col-md-3">
              <label class="form-label">Leave Type</label>
              <select class="form-control" formControlName="leaveTypeId">
                <option value="">All</option>
                <option *ngFor="let rule of accrualRules()" [value]="rule.leaveTypeId">
                  {{ rule.leaveTypeName || 'Type ' + rule.leaveTypeId }}
                </option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">From Date</label>
              <input type="date" class="form-control" formControlName="fromDate" />
            </div>
            <div class="col-md-2">
              <label class="form-label">To Date</label>
              <input type="date" class="form-control" formControlName="toDate" />
            </div>
            <div class="col-md-2">
              <button class="btn btn-secondary w-100" (click)="applyFilters()">Filter</button>
            </div>
          </form>
        </div>
      </div>

      <div class="card mt-3">
        <div class="card-body">
          <div *ngIf="store.loading()" class="text-center p-4">
            <div class="spinner-border" role="status"></div>
          </div>

          <div *ngIf="store.error()" class="alert alert-danger">{{ store.error() }}</div>

          <div
            *ngIf="!store.loading() && filteredAccruals().length === 0"
            class="empty-state text-center p-5"
          >
            <i class="fas fa-calendar-plus fa-3x text-muted mb-3"></i>
            <p class="text-muted">No accrual records found.</p>
          </div>

          <div *ngIf="!store.loading() && filteredAccruals().length > 0" class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Period</th>
                  <th>Accrued Days</th>
                  <th>Adj. Days</th>
                  <th>Net Accrued</th>
                  <th>Carried Forward</th>
                  <th>Encashed</th>
                  <th>Encashment Amt</th>
                  <th>Projected Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let acc of filteredAccruals()">
                  <td>{{ acc.employeeName || 'Emp #' + acc.employeeId }}</td>
                  <td>{{ acc.leaveTypeName || 'Type ' + acc.leaveTypeId }}</td>
                  <td>{{ acc.period.from }} to {{ acc.period.to }}</td>
                  <td>{{ acc.accruedDays }}</td>
                  <td>{{ acc.adjustmentDays || 0 }}</td>
                  <td>{{ acc.netAccrued }}</td>
                  <td>{{ acc.carriedForward || 0 }}</td>
                  <td>{{ acc.encashed || 0 }}</td>
                  <td>{{ acc.encashmentAmount | currency: 'INR' : 'symbol' : '1.2-2' }}</td>
                  <td>{{ acc.netAccrued + (acc.carriedForward || 0) - (acc.encashed || 0) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card mt-3">
        <div class="card-header">Accrual Rules</div>
        <div class="card-body">
          <div *ngIf="accrualRules().length === 0" class="text-muted text-center p-3">
            No accrual rules configured.
          </div>
          <table *ngIf="accrualRules().length > 0" class="table table-sm">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Frequency</th>
                <th>Amount/Period</th>
                <th>Max/Period</th>
                <th>Max Carry Forward</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rule of accrualRules()">
                <td>{{ rule.leaveTypeName || 'Type ' + rule.leaveTypeId }}</td>
                <td class="text-capitalize">{{ rule.accrualFrequency }}</td>
                <td>{{ rule.accrualAmount }}</td>
                <td>{{ rule.maxAccrualPerPeriod || 'N/A' }}</td>
                <td>{{ rule.maxAccrualCarryForward || 'N/A' }}</td>
                <td>
                  <span class="badge" [ngClass]="rule.isActive ? 'bg-success' : 'bg-secondary'">
                    {{ rule.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .accruals-container {
        padding: 20px;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .filters-card {
        background: #f8f9fa;
      }
      .table th {
        font-weight: 600;
        font-size: 13px;
      }
      .badge {
        font-size: 12px;
        padding: 4px 8px;
      }
    `,
  ],
})
export class LeaveAccrualsComponent implements OnInit {
  readonly store = inject(LeaveStore);
  private fb = inject(FormBuilder);

  filterForm: FormGroup = this.fb.group({
    employeeSearch: [''],
    leaveTypeId: [''],
    fromDate: [''],
    toDate: [''],
  });

  accrualRules = this.store.accrualRules;

  ngOnInit(): void {
    this.store.loadAccruals();
    this.store.loadAccrualRules();
  }

  get filteredAccruals(): () => LeaveAccrual[] {
    return () => {
      const form = this.filterForm.value;
      return this.store.accruals().filter((acc) => {
        if (
          form.employeeSearch &&
          !(acc.employeeName || '').toLowerCase().includes(form.employeeSearch.toLowerCase())
        )
          return false;
        if (form.leaveTypeId && acc.leaveTypeId !== +form.leaveTypeId) return false;
        if (form.fromDate && acc.period.to < form.fromDate) return false;
        if (form.toDate && acc.period.from > form.toDate) return false;
        return true;
      });
    };
  }

  applyFilters(): void {
    const form = this.filterForm.value;
    this.store.loadAccruals({
      employeeId: form.employeeSearch ? undefined : undefined,
      leaveTypeId: form.leaveTypeId ? +form.leaveTypeId : undefined,
      fromDate: form.fromDate || undefined,
      toDate: form.toDate || undefined,
    });
  }

  runAccrual(): void {
    // Trigger accrual calculation - typically calls backend endpoint
    this.store.loadAccruals();
  }
}
