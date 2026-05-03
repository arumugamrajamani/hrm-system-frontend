import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PerformanceStore } from '../../services/performance.store';
import { GoalStatus, GoalPriority } from '../../models/performance.model';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-goal-form',
  standalone: false,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-bullseye me-2"></i>
            {{ isEdit ? 'Edit' : 'Create' }} Performance Goal
          </h2>
        </div>
        <div class="col-auto">
          <button class="btn btn-outline-secondary" (click)="cancel()">
            <i class="fas fa-times me-1"></i>
            Cancel
          </button>
        </div>
      </div>

      @if (isEdit && store.loading()) {
        <app-loading-skeleton
          type="table-row"
          [columns]="['200px', '200px', '200px']"
        ></app-loading-skeleton>
      } @else {
        <div class="card shadow-sm">
          <div class="card-body">
            <form [formGroup]="goalForm" (ngSubmit)="onSubmit()">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Cycle *</label>
                  <select class="form-select" formControlName="cycle_id" [disabled]="isEdit">
                    <option value="">Select cycle</option>
                    @for (cycle of store.cycles(); track cycle.id) {
                      <option [value]="cycle.id">{{ cycle.cycle_name }}</option>
                    }
                  </select>
                  @if (goalForm.get('cycle_id')?.invalid && goalForm.get('cycle_id')?.touched) {
                    <small class="text-danger">Cycle is required</small>
                  }
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Employee ID *</label>
                  <input
                    type="number"
                    class="form-control"
                    formControlName="employee_id"
                    placeholder="Enter employee ID"
                    [disabled]="isEdit"
                  />
                  @if (
                    goalForm.get('employee_id')?.invalid && goalForm.get('employee_id')?.touched
                  ) {
                    <small class="text-danger">Employee ID is required</small>
                  }
                </div>
              </div>

              <div class="row">
                <div class="col-md-12 mb-3">
                  <label class="form-label">Goal Title *</label>
                  <input
                    type="text"
                    class="form-control"
                    formControlName="goal_title"
                    placeholder="e.g., Increase sales revenue by 20%"
                  />
                  @if (goalForm.get('goal_title')?.invalid && goalForm.get('goal_title')?.touched) {
                    <small class="text-danger">Goal title is required</small>
                  }
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Goal Description</label>
                  <textarea
                    class="form-control"
                    formControlName="goal_description"
                    rows="3"
                    placeholder="Describe the goal in detail"
                  ></textarea>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">KPI Description</label>
                  <textarea
                    class="form-control"
                    formControlName="kpi_description"
                    rows="3"
                    placeholder="Describe how success will be measured"
                  ></textarea>
                </div>
              </div>

              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label">Target Value</label>
                  <input
                    type="text"
                    class="form-control"
                    formControlName="target_value"
                    placeholder="e.g., 20%, 100 units"
                  />
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Weightage</label>
                  <input
                    type="number"
                    class="form-control"
                    formControlName="weightage"
                    placeholder="e.g., 25"
                    min="0"
                    max="100"
                  />
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Priority *</label>
                  <select class="form-select" formControlName="priority">
                    <option value="">Select priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  @if (goalForm.get('priority')?.invalid && goalForm.get('priority')?.touched) {
                    <small class="text-danger">Priority is required</small>
                  }
                </div>
              </div>

              @if (isEdit) {
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label class="form-label">Status</label>
                    <select class="form-select" formControlName="status">
                      @for (s of goalStatuses; track s.value) {
                        <option [value]="s.value">{{ s.label }}</option>
                      }
                    </select>
                  </div>
                </div>
              }

              <div class="d-flex gap-2 mt-3">
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="goalForm.invalid || submitting"
                >
                  @if (submitting) {
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                  }
                  <i class="fas fa-save me-1"></i>
                  {{ isEdit ? 'Update Goal' : 'Create Goal' }}
                </button>
                <button type="button" class="btn btn-outline-secondary" (click)="cancel()">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class GoalFormComponent implements OnInit {
  readonly store = inject(PerformanceStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  goalForm: FormGroup;
  isEdit = false;
  goalId: number | null = null;
  submitting = false;

  goalStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  constructor() {
    this.goalForm = this.fb.group({
      cycle_id: ['', Validators.required],
      employee_id: ['', [Validators.required, Validators.min(1)]],
      goal_title: ['', Validators.required],
      goal_description: [''],
      kpi_description: [''],
      target_value: [''],
      weightage: [null],
      priority: ['', Validators.required],
      status: ['pending'],
    });
  }

  ngOnInit(): void {
    this.store.loadCycles();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.goalId = Number(id);

      setTimeout(() => {
        const goal = this.store.items().find((g) => g.id === this.goalId);
        if (goal) {
          this.goalForm.patchValue({
            cycle_id: goal.cycle_id,
            employee_id: goal.employee_id,
            goal_title: goal.goal_title,
            goal_description: goal.goal_description || '',
            kpi_description: goal.kpi_description || '',
            target_value: goal.target_value || '',
            weightage: goal.weightage || null,
            priority: goal.priority,
            status: goal.status,
          });
          this.goalForm.get('cycle_id')?.disable();
          this.goalForm.get('employee_id')?.disable();
        }
      }, 500);
    }
  }

  onSubmit(): void {
    if (this.goalForm.invalid) return;
    this.submitting = true;

    const formValue = this.goalForm.value;
    const data: Record<string, unknown> = {
      goal_title: formValue.goal_title,
      goal_description: formValue.goal_description || undefined,
      kpi_description: formValue.kpi_description || undefined,
      target_value: formValue.target_value || undefined,
      weightage: formValue.weightage ? Number(formValue.weightage) : undefined,
      priority: formValue.priority as GoalPriority,
    };

    if (this.isEdit) {
      data['status'] = formValue.status as GoalStatus;
      this.store.updateGoal(this.goalId!, data as any).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/performance/goals']);
        },
        error: () => {
          this.submitting = false;
        },
      });
    } else {
      const createData = {
        ...data,
        cycle_id: Number(formValue.cycle_id),
        employee_id: Number(formValue.employee_id),
      };
      this.store.createGoal(createData as any).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/performance/goals']);
        },
        error: () => {
          this.submitting = false;
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/performance/goals']);
  }
}
