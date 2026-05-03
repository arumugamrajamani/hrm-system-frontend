import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PerformanceStore } from '../../services/performance.store';
import {
  Goal,
  GoalStatus,
  GoalPriority,
  getGoalStatusLabel,
  getPriorityLabel,
  getRatingLabel,
  getRatingBadgeClass,
} from '../../models/performance.model';
import { Permission } from '../../../../core/models/rbac.models';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-goals-list',
  standalone: false,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-bullseye me-2"></i>
            Performance Goals
          </h2>
        </div>
        <div class="col-auto">
          <div class="btn-group me-2">
            <button class="btn btn-outline-secondary" (click)="navigateToCycles()">
              <i class="fas fa-calendar-alt me-1"></i>
              Cycles
            </button>
            <button class="btn btn-outline-secondary" (click)="navigateToRatings()">
              <i class="fas fa-star me-1"></i>
              Ratings
            </button>
          </div>
          @if (store.canCreate()) {
            <button class="btn btn-primary" (click)="navigateToCreate()">
              <i class="fas fa-plus me-2"></i>
              Create Goal
            </button>
          }
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row mb-4">
        <div class="col-md-3 mb-3">
          <div class="card shadow-sm">
            <div class="card-body">
              <h6 class="text-muted mb-2">Total Goals</h6>
              <h4 class="mb-0">{{ store.items().length }}</h4>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card shadow-sm">
            <div class="card-body">
              <h6 class="text-muted mb-2">In Progress</h6>
              <h4 class="mb-0 text-primary">
                {{ getGoalsCountByStatus('in_progress') }}
              </h4>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card shadow-sm">
            <div class="card-body">
              <h6 class="text-muted mb-2">Completed</h6>
              <h4 class="mb-0 text-success">
                {{ getGoalsCountByStatus('completed') }}
              </h4>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card shadow-sm">
            <div class="card-body">
              <h6 class="text-muted mb-2">Self Rated</h6>
              <h4 class="mb-0 text-info">{{ getSelfRatedCount() }}</h4>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="row mb-3">
        <div class="col-md-4">
          <div class="input-group">
            <span class="input-group-text"><i class="fas fa-search"></i></span>
            <input
              type="text"
              class="form-control"
              placeholder="Search goals..."
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearch()"
            />
          </div>
        </div>
        <div class="col-md-2">
          <select class="form-select" [(ngModel)]="statusFilter" (ngModelChange)="onFilterChange()">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div class="col-md-2">
          <select
            class="form-select"
            [(ngModel)]="priorityFilter"
            (ngModelChange)="onFilterChange()"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div class="col-md-2">
          <select class="form-select" [(ngModel)]="cycleFilter" (ngModelChange)="onFilterChange()">
            <option value="">All Cycles</option>
            @for (cycle of store.cycles(); track cycle.id) {
              <option [value]="cycle.id">{{ cycle.cycle_name }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Goals Table -->
      @if (store.loading()) {
        <div class="card shadow-sm">
          <div class="card-body">
            @for (row of skeletonRows; track $index) {
              <app-loading-skeleton
                type="table-row"
                [columns]="['200px', '150px', '100px', '120px', '80px', '80px', '150px']"
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
        <div class="card shadow-sm">
          <div class="card-body">
            @if (store.items().length === 0) {
              <app-empty-state
                icon="flag"
                title="No Goals Found"
                message="There are no goals matching your criteria."
                actionLabel="Create Goal"
                actionIcon="add"
                (action)="navigateToCreate()"
              ></app-empty-state>
            } @else {
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Goal</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Target</th>
                      <th>Self Rating</th>
                      <th>Manager Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (goal of store.items(); track goal.id) {
                      <tr>
                        <td>
                          <div class="fw-bold">{{ goal.goal_title }}</div>
                          <small class="text-muted">{{ goal.employee_name || 'N/A' }}</small>
                          @if (goal.kpi_description) {
                            <br />
                            <small class="text-muted"
                              >{{ goal.kpi_description | slice: 0 : 50
                              }}{{ goal.kpi_description!.length > 50 ? '...' : '' }}</small
                            >
                          }
                        </td>
                        <td>
                          <span
                            class="badge"
                            [class.bg-secondary]="goal.priority === 'low'"
                            [class.bg-info]="goal.priority === 'medium'"
                            [class.bg-warning]="goal.priority === 'high'"
                            [class.bg-danger]="goal.priority === 'critical'"
                          >
                            {{ getPriorityLabel(goal.priority) }}
                          </span>
                        </td>
                        <td>
                          <span
                            class="badge"
                            [class.bg-secondary]="goal.status === 'pending'"
                            [class.bg-primary]="goal.status === 'in_progress'"
                            [class.bg-success]="goal.status === 'completed'"
                            [class.bg-danger]="goal.status === 'cancelled'"
                          >
                            {{ getGoalStatusLabel(goal.status) }}
                          </span>
                        </td>
                        <td>
                          <span class="small">{{ goal.target_value || '-' }}</span>
                        </td>
                        <td>
                          @if (goal.self_rating) {
                            <span
                              class="badge"
                              [class]="getRatingBadgeClass(goal.self_rating!.self_rating)"
                            >
                              {{ getRatingLabel(goal.self_rating!.self_rating) }}
                            </span>
                          } @else {
                            <span class="text-muted">N/A</span>
                          }
                        </td>
                        <td>
                          @if (goal.manager_rating) {
                            <span
                              class="badge"
                              [class]="getRatingBadgeClass(goal.manager_rating!.manager_rating)"
                            >
                              {{ getRatingLabel(goal.manager_rating!.manager_rating) }}
                            </span>
                          } @else {
                            <span class="text-muted">N/A</span>
                          }
                        </td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button
                              class="btn btn-outline-primary"
                              (click)="viewGoal(goal)"
                              title="View"
                            >
                              <i class="fas fa-eye"></i>
                            </button>
                            @if (store.canEdit()) {
                              <button
                                class="btn btn-outline-secondary"
                                (click)="editGoal(goal)"
                                title="Edit"
                              >
                                <i class="fas fa-edit"></i>
                              </button>
                            }
                            @if (store.canDelete()) {
                              <button
                                class="btn btn-outline-danger"
                                (click)="deleteGoal(goal)"
                                title="Delete"
                              >
                                <i class="fas fa-trash"></i>
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
          </div>
        </div>
      }
    </div>
  `,
})
export class GoalsListComponent implements OnInit {
  readonly store = inject(PerformanceStore);
  private router = inject(Router);

  searchTerm = '';
  statusFilter = '';
  priorityFilter = '';
  cycleFilter = '';
  skeletonRows = Array(5).fill(0);

  readonly Permission = Permission;
  readonly getGoalStatusLabel = getGoalStatusLabel;
  readonly getPriorityLabel = getPriorityLabel;
  readonly getRatingLabel = getRatingLabel;
  readonly getRatingBadgeClass = getRatingBadgeClass;

  ngOnInit(): void {
    this.store.loadCycles();
    this.store.loadGoals();
  }

  getGoalsCountByStatus(status: string): number {
    return this.store.items().filter((g) => g.status === status).length;
  }

  getSelfRatedCount(): number {
    return this.store.items().filter((g) => g.self_rating !== undefined).length;
  }

  onSearch(): void {
    this.store.loadGoals({ search: this.searchTerm, page: 1 });
  }

  onFilterChange(): void {
    this.store.loadGoals({
      status: this.statusFilter as GoalStatus,
      priority: this.priorityFilter as GoalPriority,
      cycle_id: this.cycleFilter ? Number(this.cycleFilter) : undefined,
      page: 1,
    });
  }

  reload(): void {
    this.store.loadGoals();
  }

  navigateToCreate(): void {
    this.router.navigate(['/performance/goals/create']);
  }

  navigateToCycles(): void {
    this.router.navigate(['/performance/cycles']);
  }

  navigateToRatings(): void {
    this.router.navigate(['/performance/ratings']);
  }

  viewGoal(goal: Goal): void {
    this.router.navigate(['/performance/goals', goal.id]);
  }

  editGoal(goal: Goal): void {
    this.router.navigate(['/performance/goals/edit', goal.id]);
  }

  deleteGoal(goal: Goal): void {
    if (confirm(`Delete goal "${goal.goal_title}"?`)) {
      this.store.deleteGoal(goal.id).subscribe();
    }
  }
}
