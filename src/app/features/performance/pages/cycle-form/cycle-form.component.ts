import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PerformanceStore } from '../../services/performance.store';
import { CycleType, CycleStatus } from '../../models/performance.model';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-cycle-form',
  standalone: false,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-calendar-alt me-2"></i>
            {{ isEdit ? 'Edit' : 'Create' }} Performance Cycle
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
            <form [formGroup]="cycleForm" (ngSubmit)="onSubmit()">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Cycle Name *</label>
                  <input
                    type="text"
                    class="form-control"
                    formControlName="cycle_name"
                    placeholder="e.g., Q1 2025 Performance Cycle"
                  />
                  @if (
                    cycleForm.get('cycle_name')?.invalid && cycleForm.get('cycle_name')?.touched
                  ) {
                    <small class="text-danger">Cycle name is required</small>
                  }
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Cycle Code *</label>
                  <input
                    type="text"
                    class="form-control"
                    formControlName="cycle_code"
                    placeholder="e.g., Q1-2025"
                  />
                  @if (
                    cycleForm.get('cycle_code')?.invalid && cycleForm.get('cycle_code')?.touched
                  ) {
                    <small class="text-danger">Cycle code is required</small>
                  }
                </div>
              </div>

              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label">Cycle Type *</label>
                  <select class="form-select" formControlName="cycle_type">
                    <option value="">Select type</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                  </select>
                  @if (
                    cycleForm.get('cycle_type')?.invalid && cycleForm.get('cycle_type')?.touched
                  ) {
                    <small class="text-danger">Cycle type is required</small>
                  }
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Fiscal Year *</label>
                  <input
                    type="number"
                    class="form-control"
                    formControlName="fiscal_year"
                    placeholder="e.g., 2025"
                  />
                  @if (
                    cycleForm.get('fiscal_year')?.invalid && cycleForm.get('fiscal_year')?.touched
                  ) {
                    <small class="text-danger">Fiscal year is required</small>
                  }
                </div>
                <div
                  class="col-md-4 mb-3"
                  [class.d-none]="cycleForm.get('cycle_type')?.value !== 'quarterly'"
                >
                  <label class="form-label">Quarter (1-4)</label>
                  <select class="form-select" formControlName="quarter">
                    <option value="">Not applicable</option>
                    <option value="1">Q1</option>
                    <option value="2">Q2</option>
                    <option value="3">Q3</option>
                    <option value="4">Q4</option>
                  </select>
                </div>
              </div>

              <h6 class="mt-4 mb-3 border-bottom pb-2">Cycle Period</h6>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Start Date *</label>
                  <input type="date" class="form-control" formControlName="start_date" />
                  @if (
                    cycleForm.get('start_date')?.invalid && cycleForm.get('start_date')?.touched
                  ) {
                    <small class="text-danger">Start date is required</small>
                  }
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">End Date *</label>
                  <input type="date" class="form-control" formControlName="end_date" />
                  @if (cycleForm.get('end_date')?.invalid && cycleForm.get('end_date')?.touched) {
                    <small class="text-danger">End date is required</small>
                  }
                </div>
              </div>

              <h6 class="mt-4 mb-3 border-bottom pb-2">Self Rating Period</h6>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Self Rating Start *</label>
                  <input type="date" class="form-control" formControlName="self_rating_start" />
                  @if (
                    cycleForm.get('self_rating_start')?.invalid &&
                    cycleForm.get('self_rating_start')?.touched
                  ) {
                    <small class="text-danger">Required</small>
                  }
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Self Rating End *</label>
                  <input type="date" class="form-control" formControlName="self_rating_end" />
                  @if (
                    cycleForm.get('self_rating_end')?.invalid &&
                    cycleForm.get('self_rating_end')?.touched
                  ) {
                    <small class="text-danger">Required</small>
                  }
                </div>
              </div>

              <h6 class="mt-4 mb-3 border-bottom pb-2">Manager Rating Period</h6>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Manager Rating Start *</label>
                  <input type="date" class="form-control" formControlName="manager_rating_start" />
                  @if (
                    cycleForm.get('manager_rating_start')?.invalid &&
                    cycleForm.get('manager_rating_start')?.touched
                  ) {
                    <small class="text-danger">Required</small>
                  }
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Manager Rating End *</label>
                  <input type="date" class="form-control" formControlName="manager_rating_end" />
                  @if (
                    cycleForm.get('manager_rating_end')?.invalid &&
                    cycleForm.get('manager_rating_end')?.touched
                  ) {
                    <small class="text-danger">Required</small>
                  }
                </div>
              </div>

              @if (isEdit) {
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label class="form-label">Status</label>
                    <select class="form-select" formControlName="status">
                      @for (s of cycleStatuses; track s.value) {
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
                  [disabled]="cycleForm.invalid || submitting"
                >
                  @if (submitting) {
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                  }
                  <i class="fas fa-save me-1"></i>
                  {{ isEdit ? 'Update Cycle' : 'Create Cycle' }}
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
export class CycleFormComponent implements OnInit {
  readonly store = inject(PerformanceStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  cycleForm: FormGroup;
  isEdit = false;
  cycleId: number | null = null;
  submitting = false;

  cycleStatuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'self_rating_open', label: 'Self Rating Open' },
    { value: 'self_rating_closed', label: 'Self Rating Closed' },
    { value: 'manager_rating_open', label: 'Manager Rating Open' },
    { value: 'manager_rating_closed', label: 'Manager Rating Closed' },
    { value: 'hr_review', label: 'HR Review' },
    { value: 'completed', label: 'Completed' },
  ];

  constructor() {
    this.cycleForm = this.fb.group({
      cycle_name: ['', Validators.required],
      cycle_code: ['', Validators.required],
      cycle_type: ['', Validators.required],
      fiscal_year: ['', [Validators.required, Validators.min(2000)]],
      quarter: [null],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      self_rating_start: ['', Validators.required],
      self_rating_end: ['', Validators.required],
      manager_rating_start: ['', Validators.required],
      manager_rating_end: ['', Validators.required],
      status: ['draft'],
    });

    this.cycleForm.get('cycle_type')?.valueChanges.subscribe((type) => {
      if (type !== 'quarterly') {
        this.cycleForm.get('quarter')?.setValue(null);
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.cycleId = Number(id);
      this.store.loadCycleById(this.cycleId);

      setTimeout(() => {
        const cycle = this.store.selectedCycle();
        if (cycle) {
          this.cycleForm.patchValue({
            cycle_name: cycle.cycle_name,
            cycle_code: cycle.cycle_code,
            cycle_type: cycle.cycle_type,
            fiscal_year: cycle.fiscal_year,
            quarter: cycle.quarter || null,
            start_date: this.toDateValue(cycle.start_date),
            end_date: this.toDateValue(cycle.end_date),
            self_rating_start: this.toDateValue(cycle.self_rating_start),
            self_rating_end: this.toDateValue(cycle.self_rating_end),
            manager_rating_start: this.toDateValue(cycle.manager_rating_start),
            manager_rating_end: this.toDateValue(cycle.manager_rating_end),
            status: cycle.status,
          });
        }
      }, 500);
    }
  }

  private toDateValue(dateStr: string): string {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  }

  onSubmit(): void {
    if (this.cycleForm.invalid) return;
    this.submitting = true;

    const formValue = this.cycleForm.value;
    const data: Record<string, unknown> = {
      cycle_name: formValue.cycle_name,
      cycle_code: formValue.cycle_code,
      cycle_type: formValue.cycle_type as CycleType,
      fiscal_year: Number(formValue.fiscal_year),
      start_date: formValue.start_date,
      end_date: formValue.end_date,
      self_rating_start: formValue.self_rating_start,
      self_rating_end: formValue.self_rating_end,
      manager_rating_start: formValue.manager_rating_start,
      manager_rating_end: formValue.manager_rating_end,
    };

    if (formValue.cycle_type === 'quarterly' && formValue.quarter) {
      data['quarter'] = Number(formValue.quarter);
    }

    if (this.isEdit) {
      data['status'] = formValue.status as CycleStatus;
      this.store.updateCycle(this.cycleId!, data).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/performance/cycles']);
        },
        error: () => {
          this.submitting = false;
        },
      });
    } else {
      this.store.createCycle(data as any).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/performance/cycles']);
        },
        error: () => {
          this.submitting = false;
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/performance/cycles']);
  }
}
