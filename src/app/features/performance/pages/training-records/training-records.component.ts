import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PerformanceStore } from '../../services/performance.store';
import { TrainingRecord } from '../../models/performance.model';
import { Permission } from '../../../../core/models/rbac.models';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-training-records',
  standalone: false,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-graduation-cap me-2"></i>
            Training & Certifications
          </h2>
        </div>
        <div class="col-auto">
          <div class="btn-group me-2">
            <button class="btn btn-outline-secondary" (click)="navigateToGoals()">
              <i class="fas fa-bullseye me-1"></i>
              Goals
            </button>
            <button class="btn btn-outline-secondary" (click)="navigateToAppraisals()">
              <i class="fas fa-clipboard-check me-1"></i>
              Appraisals
            </button>
          </div>
          @if (store.canCreate()) {
            <button class="btn btn-primary" (click)="createTraining()">
              <i class="fas fa-plus me-2"></i>
              Add Training
            </button>
          }
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row mb-4">
        <div class="col-md-3 mb-3">
          <div class="card shadow-sm">
            <div class="card-body">
              <h6 class="text-muted mb-2">Total Records</h6>
              <h4 class="mb-0">{{ store.trainingRecords().length }}</h4>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card shadow-sm">
            <div class="card-body">
              <h6 class="text-muted mb-2">In Progress</h6>
              <h4 class="mb-0 text-primary">
                {{ getTrainingCountByStatus('in_progress') }}
              </h4>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card shadow-sm">
            <div class="card-body">
              <h6 class="text-muted mb-2">Completed</h6>
              <h4 class="mb-0 text-success">
                {{ getTrainingCountByStatus('completed') }}
              </h4>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card shadow-sm">
            <div class="card-body">
              <h6 class="text-muted mb-2">Total Cost</h6>
              <h4 class="mb-0 text-info">\${{ getTotalCost() }}</h4>
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
              placeholder="Search training..."
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearch()"
            />
          </div>
        </div>
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="typeFilter" (ngModelChange)="onFilterChange()">
            <option value="">All Types</option>
            <option value="internal">Internal</option>
            <option value="external">External</option>
            <option value="online">Online</option>
            <option value="certification">Certification</option>
          </select>
        </div>
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="statusFilter" (ngModelChange)="onFilterChange()">
            <option value="">All Status</option>
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <!-- Training Records Table -->
      @if (store.loading()) {
        <div class="card shadow-sm">
          <div class="card-body">
            @for (row of skeletonRows; track $index) {
              <app-loading-skeleton
                type="table-row"
                [columns]="['200px', '120px', '150px', '100px', '100px', '80px', '120px']"
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
            @if (store.trainingRecords().length === 0) {
              <app-empty-state
                icon="school"
                title="No Training Records"
                message="There are no training records matching your criteria."
                actionLabel="Add Training"
                actionIcon="add"
                (action)="createTraining()"
              ></app-empty-state>
            } @else {
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Provider</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Status</th>
                      <th>Cost</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (record of store.trainingRecords(); track record.id) {
                      <tr>
                        <td>
                          <div class="fw-bold">{{ record.title }}</div>
                          <small class="text-muted">{{ record.employeeName || 'N/A' }}</small>
                        </td>
                        <td>
                          <span
                            class="badge"
                            [class.bg-info]="record.type === 'internal'"
                            [class.bg-primary]="record.type === 'external'"
                            [class.bg-success]="record.type === 'online'"
                            [class.bg-warning]="record.type === 'certification'"
                          >
                            {{ record.type | titlecase }}
                          </span>
                        </td>
                        <td>{{ record.provider || 'N/A' }}</td>
                        <td>{{ record.startDate | date: 'dd MMM yyyy' }}</td>
                        <td>{{ record.endDate ? (record.endDate | date: 'dd MMM yyyy') : '-' }}</td>
                        <td>
                          <span
                            class="badge"
                            [class.bg-secondary]="record.status === 'planned'"
                            [class.bg-primary]="record.status === 'in_progress'"
                            [class.bg-success]="record.status === 'completed'"
                            [class.bg-danger]="record.status === 'cancelled'"
                          >
                            {{ record.status | titlecase }}
                          </span>
                        </td>
                        <td>{{ record.cost ? '$' + record.cost : '-' }}</td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            @if (record.certificateUrl) {
                              <button
                                class="btn btn-outline-info"
                                (click)="viewCertificate(record)"
                                title="View Certificate"
                              >
                                <i class="fas fa-certificate"></i>
                              </button>
                            }
                            @if (store.canEdit()) {
                              <button
                                class="btn btn-outline-secondary"
                                (click)="editTraining(record)"
                                title="Edit"
                              >
                                <i class="fas fa-edit"></i>
                              </button>
                            }
                            @if (store.canDelete()) {
                              <button
                                class="btn btn-outline-danger"
                                (click)="deleteTraining(record)"
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
export class TrainingRecordsComponent implements OnInit {
  readonly store = inject(PerformanceStore);
  private router = inject(Router);

  searchTerm = '';
  typeFilter = '';
  statusFilter = '';
  skeletonRows = Array(5).fill(0);

  readonly Permission = Permission;

  ngOnInit(): void {
    this.store.loadTrainingRecords();
  }

  getTrainingCountByStatus(status: string): number {
    return this.store.trainingRecords().filter((t) => t.status === status).length;
  }

  getTotalCost(): number {
    return this.store.trainingRecords().reduce((sum, t) => sum + (t.cost || 0), 0);
  }

  onSearch(): void {
    this.store.loadTrainingRecords({ search: this.searchTerm });
  }

  onFilterChange(): void {
    this.store.loadTrainingRecords({
      type: this.typeFilter,
      status: this.statusFilter,
    });
  }

  reload(): void {
    this.store.loadTrainingRecords();
  }

  navigateToGoals(): void {
    this.router.navigate(['/performance/goals']);
  }

  navigateToAppraisals(): void {
    this.router.navigate(['/performance/appraisals']);
  }

  createTraining(): void {
    this.router.navigate(['/performance/training/create']);
  }

  editTraining(record: TrainingRecord): void {
    this.router.navigate(['/performance/training/edit', record.id]);
  }

  viewCertificate(record: TrainingRecord): void {
    if (record.certificateUrl) {
      window.open(record.certificateUrl, '_blank');
    }
  }

  deleteTraining(record: TrainingRecord): void {
    if (confirm(`Delete training record "${record.title}"?`)) {
      this.store.deleteTrainingRecord(record.id).subscribe();
    }
  }
}
