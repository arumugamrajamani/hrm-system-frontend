import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { PerformanceStore } from '../../services/performance.store';
import {
  OverallRating,
  AnnualSummary,
  getRatingLabel,
  getRatingBadgeClass,
} from '../../models/performance.model';
import { Permission } from '../../../../core/models/rbac.models';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-ratings',
  standalone: false,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-star me-2"></i>
            Ratings & Summaries
          </h2>
        </div>
        <div class="col-auto">
          <button class="btn btn-outline-secondary me-2" (click)="navigateToGoals()">
            <i class="fas fa-bullseye me-1"></i>
            Goals
          </button>
          <button class="btn btn-outline-secondary me-2" (click)="navigateToCycles()">
            <i class="fas fa-calendar-alt me-1"></i>
            Cycles
          </button>
          <button class="btn btn-outline-secondary" (click)="navigateToSelfRating()">
            <i class="fas fa-user-check me-1"></i>
            Self Rating
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <a
            class="nav-link"
            [class.active]="activeTab() === 'overall'"
            (click)="activeTab.set('overall')"
            style="cursor: pointer;"
          >
            <i class="fas fa-star me-1"></i> Overall Ratings
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            [class.active]="activeTab() === 'annual'"
            (click)="activeTab.set('annual')"
            style="cursor: pointer;"
          >
            <i class="fas fa-file-alt me-1"></i> Annual Summaries
          </a>
        </li>
      </ul>

      <!-- Overall Ratings Tab -->
      @if (activeTab() === 'overall') {
        <div class="row mb-3">
          <div class="col-md-4">
            <label class="form-label">Select Cycle</label>
            <select
              class="form-select"
              [(ngModel)]="selectedCycleId"
              (ngModelChange)="loadOverallRatings()"
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
              placeholder="Enter employee ID"
            />
          </div>
          <div class="col-md-4 d-flex align-items-end">
            <button
              class="btn btn-primary"
              (click)="loadOverallRatingDetail()"
              [disabled]="!selectedCycleId || !selectedEmployeeId"
            >
              <i class="fas fa-search me-1"></i> Load Rating
            </button>
          </div>
        </div>

        @if (store.loading()) {
          <app-loading-skeleton
            type="table-row"
            [columns]="['200px', '100px', '100px', '150px', '100px']"
          ></app-loading-skeleton>
        } @else if (selectedOverallRating()) {
          <div class="card shadow-sm">
            <div class="card-header bg-light">
              <h5 class="mb-0">Overall Rating</h5>
              <small class="text-muted">
                Employee:
                {{ selectedOverallRating()!.employee_name || selectedOverallRating()!.employee_id }}
                | Cycle: {{ selectedOverallRating()!.cycle_id }}
              </small>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-md-3">
                  <h6>Avg Self Rating</h6>
                  @if (selectedOverallRating()!.average_self_rating) {
                    <span
                      class="badge"
                      [class]="getRatingBadgeClass(selectedOverallRating()!.average_self_rating)"
                    >
                      {{ getRatingLabel(selectedOverallRating()!.average_self_rating) }}
                    </span>
                  } @else {
                    <span class="text-muted">N/A</span>
                  }
                </div>
                <div class="col-md-3">
                  <h6>Avg Manager Rating</h6>
                  @if (selectedOverallRating()!.average_manager_rating) {
                    <span
                      class="badge"
                      [class]="getRatingBadgeClass(selectedOverallRating()!.average_manager_rating)"
                    >
                      {{ getRatingLabel(selectedOverallRating()!.average_manager_rating) }}
                    </span>
                  } @else {
                    <span class="text-muted">N/A</span>
                  }
                </div>
                <div class="col-md-3">
                  <h6>Rating Category</h6>
                  <span>{{ selectedOverallRating()!.rating_category || 'N/A' }}</span>
                </div>
                <div class="col-md-3">
                  <h6>Status</h6>
                  @if (selectedOverallRating()!.is_approved) {
                    <span class="badge bg-success">Approved</span>
                  } @else {
                    <span class="badge bg-warning">Pending</span>
                  }
                </div>
              </div>

              <form [formGroup]="overallForm" (ngSubmit)="updateOverallRating()">
                <div class="mb-3">
                  <label class="form-label">Manager Summary</label>
                  <textarea
                    class="form-control"
                    formControlName="manager_summary"
                    rows="2"
                  ></textarea>
                </div>
                @if (store.canManage()) {
                  <div class="mb-3">
                    <label class="form-label">HR Comments</label>
                    <textarea
                      class="form-control"
                      formControlName="hr_comments"
                      rows="2"
                    ></textarea>
                  </div>
                }
                <div class="mb-3">
                  <label class="form-label">Employee Comments</label>
                  <textarea
                    class="form-control"
                    formControlName="employee_comments"
                    rows="2"
                  ></textarea>
                </div>
                <div class="d-flex gap-2">
                  <button
                    type="submit"
                    class="btn btn-primary btn-sm"
                    [disabled]="!selectedCycleId || !selectedEmployeeId"
                  >
                    <i class="fas fa-save me-1"></i> Update
                  </button>
                  @if (store.canManage() && !selectedOverallRating()!.is_approved) {
                    <button
                      type="button"
                      class="btn btn-success btn-sm"
                      (click)="approveOverallRating()"
                    >
                      <i class="fas fa-check me-1"></i> Approve
                    </button>
                  }
                </div>
              </form>
            </div>
          </div>
        }

        <!-- Overall Ratings List -->
        @if (store.overallRatings().length > 0) {
          <div class="card shadow-sm mt-4">
            <div class="card-header bg-light">
              <h6 class="mb-0">All Overall Ratings</h6>
            </div>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Cycle</th>
                    <th>Avg Self</th>
                    <th>Avg Manager</th>
                    <th>Category</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (rating of store.overallRatings(); track rating.id) {
                    <tr (click)="selectOverallRating(rating)" style="cursor: pointer;">
                      <td>{{ rating.employee_name || rating.employee_id }}</td>
                      <td>{{ rating.cycle_id }}</td>
                      <td>
                        @if (rating.average_self_rating) {
                          <span
                            class="badge"
                            [class]="getRatingBadgeClass(rating.average_self_rating)"
                          >
                            {{ getRatingLabel(rating.average_self_rating) }}
                          </span>
                        } @else {
                          <span class="text-muted">N/A</span>
                        }
                      </td>
                      <td>
                        @if (rating.average_manager_rating) {
                          <span
                            class="badge"
                            [class]="getRatingBadgeClass(rating.average_manager_rating)"
                          >
                            {{ getRatingLabel(rating.average_manager_rating) }}
                          </span>
                        } @else {
                          <span class="text-muted">N/A</span>
                        }
                      </td>
                      <td>{{ rating.rating_category || '-' }}</td>
                      <td>
                        @if (rating.is_approved) {
                          <span class="badge bg-success">Approved</span>
                        } @else {
                          <span class="badge bg-warning">Pending</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      }

      <!-- Annual Summaries Tab -->
      @if (activeTab() === 'annual') {
        <div class="row mb-3">
          <div class="col-md-4">
            <label class="form-label">Fiscal Year</label>
            <input
              type="number"
              class="form-control"
              [(ngModel)]="selectedFiscalYear"
              placeholder="e.g., 2025"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Employee ID</label>
            <input
              type="number"
              class="form-control"
              [(ngModel)]="selectedEmployeeIdAnnual"
              placeholder="Enter employee ID"
            />
          </div>
          <div class="col-md-4 d-flex align-items-end gap-2">
            <button
              class="btn btn-primary"
              (click)="loadAnnualSummaryDetail()"
              [disabled]="!selectedFiscalYear || !selectedEmployeeIdAnnual"
            >
              <i class="fas fa-search me-1"></i> Load Summary
            </button>
            <button
              class="btn btn-success"
              (click)="generateAnnualSummary()"
              [disabled]="!selectedFiscalYear || !selectedEmployeeIdAnnual"
            >
              <i class="fas fa-plus me-1"></i> Generate
            </button>
          </div>
        </div>

        @if (selectedAnnualSummary()) {
          <div class="card shadow-sm">
            <div class="card-header bg-light">
              <h5 class="mb-0">Annual Summary - FY {{ selectedAnnualSummary()!.fiscal_year }}</h5>
              <small class="text-muted">
                Employee:
                {{ selectedAnnualSummary()!.employee_name || selectedAnnualSummary()!.employee_id }}
              </small>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-md-3">
                  <h6>Overall Rating</h6>
                  @if (selectedAnnualSummary()!.overall_rating) {
                    <span
                      class="badge"
                      [class]="getRatingBadgeClass(selectedAnnualSummary()!.overall_rating)"
                    >
                      {{ getRatingLabel(selectedAnnualSummary()!.overall_rating) }}
                    </span>
                  } @else {
                    <span class="text-muted">N/A</span>
                  }
                </div>
                <div class="col-md-3">
                  <h6>Goals Completed</h6>
                  <span
                    >{{ selectedAnnualSummary()!.goals_completed || 0 }} /
                    {{ selectedAnnualSummary()!.total_goals || 0 }}</span
                  >
                </div>
                <div class="col-md-3">
                  <h6>Status</h6>
                  @if (selectedAnnualSummary()!.is_approved) {
                    <span class="badge bg-success">Approved</span>
                  } @else {
                    <span class="badge bg-warning">Pending</span>
                  }
                </div>
              </div>

              <div class="mb-3">
                <h6>Summary</h6>
                <p>{{ selectedAnnualSummary()!.summary || 'No summary available' }}</p>
              </div>
              <div class="mb-3">
                <h6>Achievements</h6>
                <p>{{ selectedAnnualSummary()!.achievements || 'No achievements recorded' }}</p>
              </div>
              <div class="mb-3">
                <h6>Areas for Improvement</h6>
                <p>{{ selectedAnnualSummary()!.areas_for_improvement || 'No areas recorded' }}</p>
              </div>

              @if (store.canManage() && !selectedAnnualSummary()!.is_approved) {
                <button class="btn btn-success btn-sm" (click)="approveAnnualSummary()">
                  <i class="fas fa-check me-1"></i> Approve Summary
                </button>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class RatingsComponent implements OnInit {
  readonly store = inject(PerformanceStore);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  activeTab = signal<'overall' | 'annual'>('overall');
  selectedCycleId: number | null = null;
  selectedEmployeeId: number | null = null;
  selectedFiscalYear: number | null = null;
  selectedEmployeeIdAnnual: number | null = null;

  selectedOverallRating = signal<OverallRating | null>(null);
  selectedAnnualSummary = signal<AnnualSummary | null>(null);

  overallForm: FormGroup;

  readonly Permission = Permission;
  readonly getRatingLabel = getRatingLabel;
  readonly getRatingBadgeClass = getRatingBadgeClass;

  constructor() {
    this.overallForm = this.fb.group({
      manager_summary: [''],
      employee_comments: [''],
      hr_comments: [''],
      rating_category: [''],
    });
  }

  ngOnInit(): void {
    this.store.loadCycles();
    this.store.loadOverallRatings();
    this.store.loadAnnualSummaries();
  }

  loadOverallRatings(): void {
    const params: Record<string, unknown> = {};
    if (this.selectedCycleId) {
      params['cycle_id'] = this.selectedCycleId;
    }
    this.store.loadOverallRatings(params);
  }

  loadOverallRatingDetail(): void {
    if (this.selectedCycleId && this.selectedEmployeeId) {
      this.store.loadOverallRatingByCycleAndEmployee(this.selectedCycleId, this.selectedEmployeeId);
      setTimeout(() => {
        const rating = this.store.selectedOverallRating();
        if (rating) {
          this.selectedOverallRating.set(rating);
          this.overallForm.patchValue({
            manager_summary: rating.manager_summary || '',
            employee_comments: rating.employee_comments || '',
            hr_comments: rating.hr_comments || '',
            rating_category: rating.rating_category || '',
          });
        }
      }, 500);
    }
  }

  selectOverallRating(rating: OverallRating): void {
    this.selectedOverallRating.set(rating);
    this.selectedCycleId = rating.cycle_id;
    this.selectedEmployeeId = rating.employee_id;
    this.overallForm.patchValue({
      manager_summary: rating.manager_summary || '',
      employee_comments: rating.employee_comments || '',
      hr_comments: rating.hr_comments || '',
      rating_category: rating.rating_category || '',
    });
  }

  updateOverallRating(): void {
    if (!this.selectedCycleId || !this.selectedEmployeeId) return;
    this.store
      .updateOverallRating(this.selectedCycleId, this.selectedEmployeeId, this.overallForm.value)
      .subscribe({
        next: () => {
          this.loadOverallRatings();
        },
      });
  }

  approveOverallRating(): void {
    if (!this.selectedCycleId || !this.selectedEmployeeId) return;
    if (confirm('Approve this overall rating?')) {
      this.store.approveOverallRating(this.selectedCycleId, this.selectedEmployeeId).subscribe({
        next: () => {
          this.loadOverallRatings();
        },
      });
    }
  }

  loadAnnualSummaryDetail(): void {
    if (this.selectedFiscalYear && this.selectedEmployeeIdAnnual) {
      this.store.loadAnnualSummary(this.selectedFiscalYear, this.selectedEmployeeIdAnnual);
      setTimeout(() => {
        const summary = this.store.selectedAnnualSummary();
        if (summary) {
          this.selectedAnnualSummary.set(summary);
        }
      }, 500);
    }
  }

  generateAnnualSummary(): void {
    if (!this.selectedFiscalYear || !this.selectedEmployeeIdAnnual) return;
    this.store
      .generateAnnualSummary(this.selectedFiscalYear, this.selectedEmployeeIdAnnual)
      .subscribe({
        next: () => {
          this.store.loadAnnualSummaries();
          this.loadAnnualSummaryDetail();
        },
      });
  }

  approveAnnualSummary(): void {
    if (!this.selectedFiscalYear || !this.selectedEmployeeIdAnnual) return;
    if (confirm('Approve this annual summary?')) {
      this.store
        .approveAnnualSummary(this.selectedFiscalYear, this.selectedEmployeeIdAnnual)
        .subscribe({
          next: () => {
            this.store.loadAnnualSummaries();
          },
        });
    }
  }

  navigateToGoals(): void {
    this.router.navigate(['/performance/goals']);
  }

  navigateToCycles(): void {
    this.router.navigate(['/performance/cycles']);
  }

  navigateToSelfRating(): void {
    this.router.navigate(['/performance/self-rating']);
  }
}
