import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PerformanceStore } from '../../services/performance.store';
import { PerformanceCycle, CycleStatus, getCycleStatusLabel } from '../../models/performance.model';
import { Permission } from '../../../../core/models/rbac.models';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-appraisal-cycle',
  standalone: false,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-calendar-alt me-2"></i>
            Performance Cycles
          </h2>
        </div>
        <div class="col-auto">
          <div class="btn-group me-2">
            <button class="btn btn-outline-secondary" (click)="navigateToGoals()">
              <i class="fas fa-bullseye me-1"></i>
              Goals
            </button>
            <button class="btn btn-outline-secondary" (click)="navigateToRatings()">
              <i class="fas fa-star me-1"></i>
              Ratings
            </button>
          </div>
          @if (store.canManage()) {
            <button class="btn btn-primary" (click)="createCycle()">
              <i class="fas fa-plus me-2"></i>
              New Cycle
            </button>
          }
          @if (store.canManage()) {
            <button class="btn btn-outline-dark ms-2" (click)="checkStatuses()">
              <i class="fas fa-sync me-1"></i>
              Check Statuses
            </button>
          }
        </div>
      </div>

      @if (store.loading()) {
        <div class="card shadow-sm">
          <div class="card-body">
            @for (row of skeletonRows; track $index) {
              <app-loading-skeleton
                type="table-row"
                [columns]="['200px', '150px', '120px', '100px', '150px', '100px']"
              ></app-loading-skeleton>
            }
          </div>
        </div>
      } @else if (store.error()) {
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ store.error() }}
          <button class="btn btn-sm btn-outline-danger ms-3" (click)="reload()">Retry</button>
        </div>
      } @else {
        @if (store.cycles().length === 0) {
          <app-empty-state
            icon="event_note"
            title="No Performance Cycles"
            message="There are no performance cycles created yet."
            actionLabel="Create Cycle"
            actionIcon="add"
            (action)="createCycle()"
          ></app-empty-state>
        } @else {
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Cycle Name</th>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Fiscal Year</th>
                  <th>Period</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (cycle of store.cycles(); track cycle.id) {
                  <tr>
                    <td>
                      <div class="fw-bold">{{ cycle.cycle_name }}</div>
                      <small class="text-muted">
                        Self Rating: {{ cycle.self_rating_start | date: 'dd MMM' }} -
                        {{ cycle.self_rating_end | date: 'dd MMM yyyy' }}
                      </small>
                    </td>
                    <td>
                      <code>{{ cycle.cycle_code }}</code>
                    </td>
                    <td>
                      <span class="badge bg-info">{{ cycle.cycle_type | titlecase }}</span>
                    </td>
                    <td>
                      {{ cycle.fiscal_year }}
                      @if (cycle.quarter) {
                        <span class="badge bg-secondary ms-1">Q{{ cycle.quarter }}</span>
                      }
                    </td>
                    <td>
                      <small>
                        {{ cycle.start_date | date: 'dd MMM yyyy' }} -
                        {{ cycle.end_date | date: 'dd MMM yyyy' }}
                      </small>
                    </td>
                    <td>
                      <span
                        class="badge"
                        [class.bg-secondary]="cycle.status === 'draft'"
                        [class.bg-success]="
                          cycle.status === 'active' ||
                          cycle.status === 'self_rating_open' ||
                          cycle.status === 'manager_rating_open'
                        "
                        [class.bg-warning]="
                          cycle.status === 'self_rating_closed' ||
                          cycle.status === 'manager_rating_closed' ||
                          cycle.status === 'hr_review'
                        "
                        [class.bg-dark]="cycle.status === 'completed'"
                      >
                        {{ getCycleStatusLabel(cycle.status) }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button
                          class="btn btn-outline-primary"
                          (click)="viewCycle(cycle)"
                          title="View"
                        >
                          <i class="fas fa-eye"></i>
                        </button>
                        @if (store.canManage() && cycle.status === 'draft') {
                          <button
                            class="btn btn-outline-success"
                            (click)="activateCycle(cycle)"
                            title="Activate"
                          >
                            <i class="fas fa-play"></i>
                          </button>
                        }
                        @if (store.canEdit()) {
                          <button
                            class="btn btn-outline-secondary"
                            (click)="editCycle(cycle)"
                            title="Edit"
                          >
                            <i class="fas fa-edit"></i>
                          </button>
                        }
                        @if (store.canManage()) {
                          <button
                            class="btn btn-outline-dark"
                            (click)="updateCycleStatus(cycle)"
                            title="Update Status"
                          >
                            <i class="fas fa-exchange-alt"></i>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    </div>
  `,
})
export class AppraisalCycleComponent implements OnInit {
  readonly store = inject(PerformanceStore);
  private router = inject(Router);

  skeletonRows = Array(5).fill(0);

  readonly Permission = Permission;
  readonly getCycleStatusLabel = getCycleStatusLabel;
  readonly CycleStatus = CycleStatus;

  ngOnInit(): void {
    this.store.loadCycles();
  }

  reload(): void {
    this.store.loadCycles();
  }

  navigateToGoals(): void {
    this.router.navigate(['/performance/goals']);
  }

  navigateToRatings(): void {
    this.router.navigate(['/performance/ratings']);
  }

  createCycle(): void {
    this.router.navigate(['/performance/cycles/create']);
  }

  viewCycle(cycle: PerformanceCycle): void {
    this.router.navigate(['/performance/cycles', cycle.id]);
  }

  editCycle(cycle: PerformanceCycle): void {
    this.router.navigate(['/performance/cycles/edit', cycle.id]);
  }

  activateCycle(cycle: PerformanceCycle): void {
    if (confirm(`Activate performance cycle "${cycle.cycle_name}"?`)) {
      this.store.updateCycleStatus(cycle.id, { status: CycleStatus.ACTIVE }).subscribe();
    }
  }

  updateCycleStatus(cycle: PerformanceCycle): void {
    const status = prompt(
      `Enter new status for "${cycle.cycle_name}":\n(draft, active, self_rating_open, self_rating_closed, manager_rating_open, manager_rating_closed, hr_review, completed)`,
      cycle.status,
    );
    if (status) {
      this.store.updateCycleStatus(cycle.id, { status: status as CycleStatus }).subscribe();
    }
  }

  checkStatuses(): void {
    if (confirm('Check and update all cycle statuses?')) {
      this.store.checkCycleStatuses().subscribe();
    }
  }
}
