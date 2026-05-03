import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { PerformanceStore } from '../../services/performance.store';
import { Goal, getRatingLabel, getRatingBadgeClass } from '../../models/performance.model';
import { Permission } from '../../../../core/models/rbac.models';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-manager-rating',
  standalone: false,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-user-tie me-2"></i>
            Manager Ratings
          </h2>
        </div>
        <div class="col-auto">
          <button class="btn btn-outline-secondary me-2" (click)="navigateToGoals()">
            <i class="fas fa-arrow-left me-1"></i>
            Back to Goals
          </button>
          @if (cycleId && !submittingAll()) {
            <button class="btn btn-primary" (click)="submitAllRatings()">
              <i class="fas fa-paper-plane me-1"></i>
              Submit All Manager Ratings
            </button>
          }
        </div>
      </div>

      <!-- Cycle & Employee Selectors -->
      <div class="row mb-4">
        <div class="col-md-4">
          <label class="form-label">Select Cycle</label>
          <select
            class="form-select"
            [(ngModel)]="selectedCycleId"
            (ngModelChange)="onCycleChange()"
          >
            <option value="">-- Select Cycle --</option>
            @for (cycle of store.cycles(); track cycle.id) {
              <option [value]="cycle.id">{{ cycle.cycle_name }}</option>
            }
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label">Employee ID</label>
          <input
            type="number"
            class="form-control"
            [(ngModel)]="selectedEmployeeId"
            (ngModelChange)="onEmployeeChange()"
            placeholder="Enter employee ID"
          />
        </div>
      </div>

      @if (store.loading()) {
        <div class="card shadow-sm">
          <div class="card-body">
            @for (row of skeletonRows; track $index) {
              <app-loading-skeleton
                type="table-row"
                [columns]="['200px', '100px', '100px', '150px']"
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
        @if (store.items().length === 0) {
          <app-empty-state
            icon="flag"
            title="No Goals Found"
            message="Select a cycle and employee to view goals."
          ></app-empty-state>
        } @else {
          @for (goal of store.items(); track goal.id) {
            <div class="card shadow-sm mb-3">
              <div class="card-header bg-light">
                <h6 class="mb-0">{{ goal.goal_title }}</h6>
                @if (goal.kpi_description) {
                  <small class="text-muted">{{ goal.kpi_description }}</small>
                }
              </div>
              <div class="card-body">
                <!-- Self Rating Display -->
                @if (goal.self_rating) {
                  <div class="mb-3 p-2 bg-light rounded">
                    <small class="text-muted">Employee Self Rating:</small>
                    <span
                      class="badge"
                      [class]="getRatingBadgeClass(goal.self_rating!.self_rating)"
                    >
                      {{ getRatingLabel(goal.self_rating!.self_rating) }}
                    </span>
                    @if (goal.self_rating!.achievement_summary) {
                      <p class="mb-0 mt-1 small">{{ goal.self_rating!.achievement_summary }}</p>
                    }
                  </div>
                }

                @if (goal.manager_rating) {
                  <div class="alert alert-success mb-3">
                    <strong>Manager Rating Submitted:</strong>
                    <span
                      class="badge"
                      [class]="getRatingBadgeClass(goal.manager_rating!.manager_rating)"
                    >
                      {{ getRatingLabel(goal.manager_rating!.manager_rating) }}
                    </span>
                    @if (goal.manager_rating!.manager_comments) {
                      <p class="mb-0 mt-2 small">{{ goal.manager_rating!.manager_comments }}</p>
                    }
                  </div>
                } @else {
                  <form [formGroup]="getForm(goal.id)" (ngSubmit)="submitRating(goal)">
                    <div class="row">
                      <div class="col-md-3">
                        <label class="form-label">Manager Rating (1-5) *</label>
                        <select class="form-select" formControlName="manager_rating">
                          <option value="">Select rating</option>
                          <option value="1">1 - Poor</option>
                          <option value="2">2 - Below Expectations</option>
                          <option value="3">3 - Meets Expectations</option>
                          <option value="4">4 - Exceeds Expectations</option>
                          <option value="5">5 - Outstanding</option>
                        </select>
                      </div>
                      <div class="col-md-9">
                        <label class="form-label">Manager Comments</label>
                        <textarea
                          class="form-control"
                          formControlName="manager_comments"
                          rows="2"
                          placeholder="Enter comments"
                        ></textarea>
                      </div>
                    </div>
                    <div class="row mt-2">
                      <div class="col-md-4">
                        <label class="form-label">What employee did well</label>
                        <textarea
                          class="form-control"
                          formControlName="what_employee_did_well"
                          rows="2"
                          placeholder="Describe strengths"
                        ></textarea>
                      </div>
                      <div class="col-md-4">
                        <label class="form-label">Areas of improvement</label>
                        <textarea
                          class="form-control"
                          formControlName="areas_of_improvement"
                          rows="2"
                          placeholder="Describe improvement areas"
                        ></textarea>
                      </div>
                      <div class="col-md-4">
                        <label class="form-label">Manager feedback</label>
                        <textarea
                          class="form-control"
                          formControlName="manager_feedback"
                          rows="2"
                          placeholder="Additional feedback"
                        ></textarea>
                      </div>
                    </div>
                    <div class="mt-3">
                      <button
                        type="submit"
                        class="btn btn-primary btn-sm"
                        [disabled]="!getForm(goal.id).valid || submitting()"
                      >
                        <i class="fas fa-save me-1"></i>
                        Submit Manager Rating
                      </button>
                    </div>
                  </form>
                }
              </div>
            </div>
          }
        }
      }
    </div>
  `,
})
export class ManagerRatingComponent implements OnInit {
  readonly store = inject(PerformanceStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  skeletonRows = Array(5).fill(0);
  selectedCycleId: number | null = null;
  selectedEmployeeId: number | null = null;
  submitting = signal(false);
  submittingAll = signal(false);
  private forms = new Map<number, FormGroup>();

  readonly Permission = Permission;
  readonly getRatingLabel = getRatingLabel;
  readonly getRatingBadgeClass = getRatingBadgeClass;

  cycleId: number | null = null;
  employeeId: number | null = null;

  ngOnInit(): void {
    this.store.loadCycles();
    this.cycleId = this.route.snapshot.params['cycleId']
      ? Number(this.route.snapshot.params['cycleId'])
      : null;
    this.employeeId = this.route.snapshot.params['employeeId']
      ? Number(this.route.snapshot.params['employeeId'])
      : null;

    if (this.cycleId && this.employeeId) {
      this.selectedCycleId = this.cycleId;
      this.selectedEmployeeId = this.employeeId;
      this.loadGoals();
    }
  }

  onCycleChange(): void {
    if (this.selectedCycleId && this.selectedEmployeeId) {
      this.loadGoals();
    }
  }

  onEmployeeChange(): void {
    if (this.selectedCycleId && this.selectedEmployeeId) {
      this.loadGoals();
    }
  }

  loadGoals(): void {
    if (this.selectedCycleId && this.selectedEmployeeId) {
      this.store.loadGoalsWithRatings(this.selectedCycleId, this.selectedEmployeeId);
    }
  }

  getForm(goalId: number): FormGroup {
    if (!this.forms.has(goalId)) {
      this.forms.set(
        goalId,
        this.fb.group({
          manager_rating: ['', Validators.required],
          manager_comments: [''],
          what_employee_did_well: [''],
          areas_of_improvement: [''],
          manager_feedback: [''],
        }),
      );
    }
    return this.forms.get(goalId)!;
  }

  submitRating(goal: Goal): void {
    const form = this.getForm(goal.id);
    if (form.invalid) return;

    this.submitting.set(true);
    const data = {
      manager_rating: Number(form.value.manager_rating),
      manager_comments: form.value.manager_comments,
      what_employee_did_well: form.value.what_employee_did_well,
      areas_of_improvement: form.value.areas_of_improvement,
      manager_feedback: form.value.manager_feedback,
    };

    this.store.submitManagerRating(goal.id, data).subscribe({
      next: () => {
        form.reset();
        this.submitting.set(false);
        this.loadGoals();
      },
      error: () => {
        this.submitting.set(false);
      },
    });
  }

  submitAllRatings(): void {
    if (!this.selectedCycleId) return;
    this.submittingAll.set(true);
    this.store.submitAllManagerRatings(this.selectedCycleId).subscribe({
      next: () => {
        this.submittingAll.set(false);
        this.loadGoals();
      },
      error: () => {
        this.submittingAll.set(false);
      },
    });
  }

  reload(): void {
    this.loadGoals();
  }

  navigateToGoals(): void {
    this.router.navigate(['/performance/goals']);
  }
}
