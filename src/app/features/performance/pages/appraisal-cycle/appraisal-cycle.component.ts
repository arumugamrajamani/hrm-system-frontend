import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PerformanceStore } from '../../services/performance.store';
import {
  AppraisalCycle,
  Appraisal,
  AppraisalStatus,
  RatingScale,
  ReviewData,
  getAppraisalStatusLabel,
  getRatingLabel,
} from '../../models/performance.model';
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
            <i class="fas fa-clipboard-check me-2"></i>
            Appraisal Cycles
          </h2>
        </div>
        <div class="col-auto">
          <div class="btn-group me-2">
            <button class="btn btn-outline-secondary" (click)="navigateToGoals()">
              <i class="fas fa-bullseye me-1"></i>
              Goals
            </button>
            <button class="btn btn-outline-secondary" (click)="navigateToTraining()">
              <i class="fas fa-graduation-cap me-1"></i>
              Training
            </button>
          </div>
          @if (store.canManage()) {
            <button class="btn btn-primary" (click)="createCycle()">
              <i class="fas fa-plus me-2"></i>
              New Cycle
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
                [columns]="['200px', '150px', '120px', '100px', '100px', '100px']"
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
        <!-- Cycles List -->
        @for (cycle of store.cycles(); track cycle.id) {
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
              <div>
                <h5 class="mb-0">{{ cycle.name }}</h5>
                <small class="text-muted">
                  {{ cycle.period.from | date: 'dd MMM yyyy' }} -
                  {{ cycle.period.to | date: 'dd MMM yyyy' }}
                </small>
              </div>
              <div>
                <span
                  class="badge me-2"
                  [class.bg-secondary]="cycle.status === 'draft'"
                  [class.bg-success]="cycle.status === 'active'"
                  [class.bg-warning]="cycle.status === 'completed'"
                  [class.bg-danger]="cycle.status === 'locked'"
                >
                  {{ cycle.status | titlecase }}
                </span>
                @if (store.canManage() && cycle.status === 'draft') {
                  <button class="btn btn-sm btn-success" (click)="activateCycle(cycle)">
                    <i class="fas fa-play me-1"></i> Activate
                  </button>
                }
                @if (store.canManage() && cycle.status === 'active') {
                  <button class="btn btn-sm btn-warning" (click)="lockCycle(cycle)">
                    <i class="fas fa-lock me-1"></i> Lock
                  </button>
                }
              </div>
            </div>
            <div class="card-body">
              <!-- Progress Bar -->
              <div class="mb-3">
                <div class="d-flex justify-content-between mb-1">
                  <small>Progress</small>
                  <small>{{ cycle.completedReviews }}/{{ cycle.totalEmployees }} reviews</small>
                </div>
                <div class="progress" style="height: 10px;">
                  <div
                    class="progress-bar bg-success"
                    [style.width.%]="getProgressPercentage(cycle)"
                  ></div>
                </div>
              </div>

              <!-- Timeline -->
              <div class="row mb-3">
                <div class="col-md-3">
                  <small class="text-muted">Self Review</small>
                  <div class="small">
                    {{ cycle.selfReviewStart | date: 'dd MMM' }} -
                    {{ cycle.selfReviewEnd | date: 'dd MMM yyyy' }}
                  </div>
                </div>
                <div class="col-md-3">
                  <small class="text-muted">Manager Review</small>
                  <div class="small">
                    {{ cycle.managerReviewStart | date: 'dd MMM' }} -
                    {{ cycle.managerReviewEnd | date: 'dd MMM yyyy' }}
                  </div>
                </div>
                @if (cycle.calibrationStart) {
                  <div class="col-md-3">
                    <small class="text-muted">Calibration</small>
                    <div class="small">
                      {{ cycle.calibrationStart | date: 'dd MMM' }} -
                      {{ cycle.calibrationEnd | date: 'dd MMM yyyy' }}
                    </div>
                  </div>
                }
              </div>

              <!-- Appraisals List -->
              <h6 class="mb-3">Appraisals</h6>
              @if (getCycleAppraisals(cycle.id).length === 0) {
                <app-empty-state
                  icon="clipboard_list"
                  title="No Appraisals"
                  message="No appraisals found for this cycle."
                ></app-empty-state>
              } @else {
                <div class="table-responsive">
                  <table class="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Self Rating</th>
                        <th>Manager Rating</th>
                        <th>Final Rating</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (appraisal of getCycleAppraisals(cycle.id); track appraisal.id) {
                        <tr>
                          <td>
                            <div class="fw-bold">{{ appraisal.employeeName || 'N/A' }}</div>
                            <small class="text-muted">{{ appraisal.designationName }}</small>
                          </td>
                          <td>{{ appraisal.departmentName || 'N/A' }}</td>
                          <td>
                            <span
                              class="badge"
                              [class.bg-secondary]="appraisal.status === 'draft'"
                              [class.bg-info]="appraisal.status === 'self_review'"
                              [class.bg-primary]="appraisal.status === 'manager_review'"
                              [class.bg-warning]="appraisal.status === 'skip_level_review'"
                              [class.bg-success]="appraisal.status === 'completed'"
                              [class.bg-danger]="appraisal.status === 'locked'"
                            >
                              {{ getAppraisalStatusLabel(appraisal.status) }}
                            </span>
                          </td>
                          <td>
                            @if (appraisal.selfReview?.overallRating) {
                              <span class="badge bg-secondary">
                                {{ getRatingLabel(appraisal.selfReview!.overallRating!) }}
                              </span>
                            } @else {
                              <span class="text-muted">-</span>
                            }
                          </td>
                          <td>
                            @if (appraisal.managerReview?.overallRating) {
                              <span class="badge bg-info">
                                {{ getRatingLabel(appraisal.managerReview!.overallRating!) }}
                              </span>
                            } @else {
                              <span class="text-muted">-</span>
                            }
                          </td>
                          <td>
                            @if (appraisal.finalRating) {
                              <span class="badge bg-warning">
                                {{ getRatingLabel(appraisal.finalRating) }}
                              </span>
                            } @else {
                              <span class="text-muted">-</span>
                            }
                          </td>
                          <td>
                            <div class="btn-group btn-group-sm">
                              <button
                                class="btn btn-outline-primary"
                                (click)="viewAppraisal(appraisal)"
                                title="View"
                              >
                                <i class="fas fa-eye"></i>
                              </button>
                              @if (appraisal.status === 'self_review') {
                                <button
                                  class="btn btn-outline-success"
                                  (click)="submitSelfReview(appraisal)"
                                  title="Submit Self Review"
                                >
                                  <i class="fas fa-user-check"></i>
                                </button>
                              }
                              @if (appraisal.status === 'manager_review' && store.canEdit()) {
                                <button
                                  class="btn btn-outline-info"
                                  (click)="submitManagerReview(appraisal)"
                                  title="Submit Manager Review"
                                >
                                  <i class="fas fa-user-tie"></i>
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
        } @empty {
          <app-empty-state
            icon="event_note"
            title="No Appraisal Cycles"
            message="There are no appraisal cycles created yet."
            actionLabel="Create Cycle"
            actionIcon="add"
            (action)="createCycle()"
          ></app-empty-state>
        }
      }
    </div>
  `,
})
export class AppraisalCycleComponent implements OnInit {
  readonly store = inject(PerformanceStore);
  private router = inject(Router);

  skeletonRows = Array(3).fill(0);

  readonly Permission = Permission;
  readonly getAppraisalStatusLabel = getAppraisalStatusLabel;
  readonly getRatingLabel = getRatingLabel;
  readonly AppraisalStatus = AppraisalStatus;

  ngOnInit(): void {
    this.store.loadCycles();
    this.store.loadAppraisals();
  }

  getProgressPercentage(cycle: AppraisalCycle): number {
    if (cycle.totalEmployees === 0) return 0;
    return Math.round((cycle.completedReviews / cycle.totalEmployees) * 100);
  }

  getCycleAppraisals(cycleId: number): Appraisal[] {
    return this.store.appraisals().filter((a) => a.cycleId === cycleId);
  }

  reload(): void {
    this.store.loadCycles();
    this.store.loadAppraisals();
  }

  navigateToGoals(): void {
    this.router.navigate(['/performance/goals']);
  }

  navigateToTraining(): void {
    this.router.navigate(['/performance/training']);
  }

  createCycle(): void {
    this.router.navigate(['/performance/cycles/create']);
  }

  activateCycle(cycle: AppraisalCycle): void {
    if (confirm(`Activate appraisal cycle "${cycle.name}"?`)) {
      this.store.activateCycle(cycle.id).subscribe();
    }
  }

  lockCycle(cycle: AppraisalCycle): void {
    if (confirm(`Lock appraisal cycle "${cycle.name}"? This action cannot be undone.`)) {
      this.store.lockCycle(cycle.id).subscribe();
    }
  }

  viewAppraisal(appraisal: Appraisal): void {
    this.router.navigate(['/performance/appraisals', appraisal.id]);
  }

  submitSelfReview(appraisal: Appraisal): void {
    const rating = prompt('Enter your overall rating (1-5):');
    if (rating) {
      const ratingNum = parseInt(rating, 10) as RatingScale;
      if (ratingNum >= 1 && ratingNum <= 5) {
        const reviewData: ReviewData = {
          overallRating: ratingNum,
          goalsReview: [],
          kraReview: [],
        };
        this.store.submitSelfReview(appraisal.id, reviewData).subscribe();
      }
    }
  }

  submitManagerReview(appraisal: Appraisal): void {
    const rating = prompt('Enter manager rating (1-5):');
    if (rating) {
      const ratingNum = parseInt(rating, 10) as RatingScale;
      if (ratingNum >= 1 && ratingNum <= 5) {
        const reviewData: ReviewData = {
          overallRating: ratingNum,
          goalsReview: [],
          kraReview: [],
        };
        this.store.submitManagerReview(appraisal.id, reviewData).subscribe();
      }
    }
  }
}
