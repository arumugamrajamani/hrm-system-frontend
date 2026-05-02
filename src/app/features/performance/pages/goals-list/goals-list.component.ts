import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PerformanceStore } from '../../services/performance.store';
import {
  Goal,
  GoalStatus,
  RatingScale,
  getGoalStatusLabel,
  getGoalCategoryLabel,
  getPriorityLabel,
  getRatingLabel,
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
            Goals & KPIs
          </h2>
        </div>
        <div class="col-auto">
          <div class="btn-group me-2">
            <button class="btn btn-outline-secondary" (click)="navigateToKPIs()">
              <i class="fas fa-chart-line me-1"></i>
              KPIs
            </button>
            <button class="btn btn-outline-secondary" (click)="navigateToAppraisals()">
              <i class="fas fa-clipboard-check me-1"></i>
              Appraisals
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
              <h6 class="text-muted mb-2">Avg. Progress</h6>
              <h4 class="mb-0 text-info">{{ getAverageProgress() }}%</h4>
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
            <option value="draft">Draft</option>
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
          <select
            class="form-select"
            [(ngModel)]="categoryFilter"
            (ngModelChange)="onFilterChange()"
          >
            <option value="">All Categories</option>
            <option value="business">Business</option>
            <option value="personal">Personal</option>
            <option value="team">Team</option>
            <option value="project">Project</option>
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
                [columns]="['200px', '150px', '100px', '120px', '80px', '100px', '150px']"
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
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Progress</th>
                      <th>Rating</th>
                      <th>Target Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (goal of store.items(); track goal.id) {
                      <tr>
                        <td>
                          <div class="fw-bold">{{ goal.title }}</div>
                          <small class="text-muted">{{ goal.employeeName || 'N/A' }}</small>
                        </td>
                        <td>
                          <span class="badge bg-info">{{
                            getGoalCategoryLabel(goal.category)
                          }}</span>
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
                            [class.bg-secondary]="goal.status === 'draft'"
                            [class.bg-primary]="goal.status === 'in_progress'"
                            [class.bg-success]="goal.status === 'completed'"
                            [class.bg-danger]="goal.status === 'cancelled'"
                          >
                            {{ getGoalStatusLabel(goal.status) }}
                          </span>
                        </td>
                        <td style="min-width: 150px;">
                          <div class="d-flex align-items-center">
                            <div class="progress flex-grow-1 me-2" style="height: 8px;">
                              <div
                                class="progress-bar"
                                [class.bg-success]="goal.progress >= 80"
                                [class.bg-warning]="goal.progress >= 50 && goal.progress < 80"
                                [class.bg-danger]="goal.progress < 50"
                                [style.width.%]="goal.progress"
                              ></div>
                            </div>
                            <small class="text-muted">{{ goal.progress }}%</small>
                          </div>
                        </td>
                        <td>
                          @if (goal.finalRating) {
                            <span class="badge bg-warning">{{
                              getRatingLabel(goal.finalRating)
                            }}</span>
                          } @else if (goal.managerRating) {
                            <span class="badge bg-info">{{
                              getRatingLabel(goal.managerRating)
                            }}</span>
                          } @else if (goal.selfRating) {
                            <span class="badge bg-secondary">{{
                              getRatingLabel(goal.selfRating)
                            }}</span>
                          } @else {
                            <span class="text-muted">N/A</span>
                          }
                        </td>
                        <td>{{ goal.targetDate | date: 'dd MMM yyyy' }}</td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button
                              class="btn btn-outline-primary"
                              (click)="viewGoal(goal)"
                              title="View"
                            >
                              <i class="fas fa-eye"></i>
                            </button>
                            @if (store.canEdit() && goal.status === 'in_progress') {
                              <button
                                class="btn btn-outline-success"
                                (click)="updateProgress(goal)"
                                title="Update Progress"
                              >
                                <i class="fas fa-chart-line"></i>
                              </button>
                            }
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
  categoryFilter = '';
  skeletonRows = Array(5).fill(0);

  readonly Permission = Permission;
  readonly getGoalStatusLabel = getGoalStatusLabel;
  readonly getGoalCategoryLabel = getGoalCategoryLabel;
  readonly getPriorityLabel = getPriorityLabel;
  readonly getRatingLabel = getRatingLabel;

  ngOnInit(): void {
    this.store.loadGoals();
    this.store.loadKPIs();
  }

  getGoalsCountByStatus(status: string): number {
    return this.store.items().filter((g) => g.status === status).length;
  }

  getAverageProgress(): number {
    const items = this.store.items();
    if (items.length === 0) return 0;
    const total = items.reduce((sum, g) => sum + g.progress, 0);
    return Math.round(total / items.length);
  }

  onSearch(): void {
    this.store.loadGoals({ search: this.searchTerm, page: 1 });
  }

  onFilterChange(): void {
    this.store.loadGoals({
      status: this.statusFilter as GoalStatus,
      priority: this.priorityFilter as Goal['priority'],
      category: this.categoryFilter as Goal['category'],
      page: 1,
    });
  }

  reload(): void {
    this.store.loadGoals();
  }

  navigateToCreate(): void {
    this.router.navigate(['/performance/goals/create']);
  }

  navigateToKPIs(): void {
    this.router.navigate(['/performance/kpis']);
  }

  navigateToAppraisals(): void {
    this.router.navigate(['/performance/appraisals']);
  }

  viewGoal(goal: Goal): void {
    this.router.navigate(['/performance/goals', goal.id]);
  }

  editGoal(goal: Goal): void {
    this.router.navigate(['/performance/goals/edit', goal.id]);
  }

  updateProgress(goal: Goal): void {
    const progress = prompt('Enter progress percentage (0-100):', goal.progress.toString());
    if (progress !== null) {
      const progressNum = parseInt(progress, 10);
      if (!isNaN(progressNum) && progressNum >= 0 && progressNum <= 100) {
        this.store.updateProgress(goal.id, progressNum).subscribe();
      }
    }
  }

  deleteGoal(goal: Goal): void {
    if (confirm(`Delete goal "${goal.title}"?`)) {
      this.store.deleteGoal(goal.id).subscribe();
    }
  }
}
