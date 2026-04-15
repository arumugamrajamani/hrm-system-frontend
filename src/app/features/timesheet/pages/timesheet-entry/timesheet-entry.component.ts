import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TimesheetStore } from '../../services/timesheet.store';
import { TimesheetApiService } from '../../services/timesheet-api.service';
import {
  Timesheet,
  TimesheetEntry,
  TimesheetStatus,
  getTimesheetStatusLabel,
} from '../../models/timesheet.model';
import { RbacService } from '../../../../core/services/rbac.service';
import { Permission } from '../../../../core/models/rbac.models';

@Component({
  selector: 'app-timesheet-entry',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-clock me-2"></i>
            {{ isEditMode ? 'Edit Timesheet' : isViewMode ? 'Timesheet Details' : 'New Timesheet' }}
          </h2>
        </div>
        <div class="col-auto">
          <button class="btn btn-outline-secondary me-2" (click)="goBack()">
            <i class="fas fa-arrow-left me-2"></i>
            Back
          </button>
        </div>
      </div>

      @if (store.loading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>
      } @else {
        <div class="row">
          <div class="col-lg-8">
            <div class="card shadow-sm">
              <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Timesheet Entries</h5>
                @if (!isViewMode) {
                  <button class="btn btn-sm btn-outline-primary" (click)="addEntry()">
                    <i class="fas fa-plus me-1"></i> Add Entry
                  </button>
                }
              </div>
              <div class="card-body">
                <form [formGroup]="timesheetForm">
                  <div class="row mb-3">
                    <div class="col-md-4">
                      <label class="form-label">Week Starting</label>
                      <input
                        type="date"
                        class="form-control"
                        formControlName="weekStartDate"
                        [disabled]="isEditMode || isViewMode"
                      />
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">Total Hours</label>
                      <input type="text" class="form-control" [value]="totalHours" readonly />
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">Status</label>
                      <input
                        type="text"
                        class="form-control"
                        [value]="currentTimesheet()?.status | titlecase"
                        readonly
                      />
                    </div>
                  </div>

                  <div formArrayName="entries">
                    <div class="table-responsive">
                      <table class="table table-bordered">
                        <thead class="table-light">
                          <tr>
                            <th>Date</th>
                            <th>Hours</th>
                            <th>Task Description</th>
                            <th>Billable</th>
                            @if (!isViewMode) {
                              <th></th>
                            }
                          </tr>
                        </thead>
                        <tbody>
                          @for (entry of entriesArray.controls; track entry; let i = $index) {
                            <tr [formGroupName]="i">
                              <td>
                                <input
                                  type="date"
                                  class="form-control form-control-sm"
                                  formControlName="date"
                                  [disabled]="isViewMode"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  class="form-control form-control-sm"
                                  formControlName="hours"
                                  min="0"
                                  max="24"
                                  step="0.5"
                                  [disabled]="isViewMode"
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  class="form-control form-control-sm"
                                  formControlName="taskDescription"
                                  placeholder="What did you work on?"
                                  [disabled]="isViewMode"
                                />
                              </td>
                              <td>
                                <input
                                  type="checkbox"
                                  formControlName="isBillable"
                                  [disabled]="isViewMode"
                                />
                              </td>
                              @if (!isViewMode) {
                                <td>
                                  <button
                                    class="btn btn-sm btn-outline-danger"
                                    (click)="removeEntry(i)"
                                    [disabled]="entriesArray.length === 1"
                                  >
                                    <i class="fas fa-trash"></i>
                                  </button>
                                </td>
                              }
                            </tr>
                          } @empty {
                            <tr>
                              <td colspan="5" class="text-center text-muted py-4">
                                No entries. Click "Add Entry" to add timesheet entries.
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>

                  @if (!isViewMode) {
                    <div class="row mt-3">
                      <div class="col-md-12">
                        <button
                          type="button"
                          class="btn btn-primary"
                          (click)="onSubmit('submitted')"
                          [disabled]="timesheetForm.invalid || entriesArray.length === 0"
                        >
                          <i class="fas fa-paper-plane me-2"></i>
                          Submit for Approval
                        </button>
                        <button
                          type="button"
                          class="btn btn-outline-secondary ms-2"
                          (click)="onSubmit('draft')"
                          [disabled]="timesheetForm.invalid || entriesArray.length === 0"
                        >
                          <i class="fas fa-save me-2"></i>
                          Save as Draft
                        </button>
                      </div>
                    </div>
                  }
                </form>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            @if (currentTimesheet()) {
              <div class="card shadow-sm mb-3">
                <div class="card-header bg-white">
                  <h5 class="mb-0">Timesheet Information</h5>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <label class="text-muted small">Status</label>
                    <div>
                      <span
                        class="badge"
                        [class.bg-secondary]="currentTimesheet()?.status === 'draft'"
                        [class.bg-warning]="currentTimesheet()?.status === 'submitted'"
                        [class.bg-success]="currentTimesheet()?.status === 'approved'"
                        [class.bg-danger]="currentTimesheet()?.status === 'rejected'"
                      >
                        {{ getStatusLabel(currentTimesheet()?.status!) }}
                      </span>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="text-muted small">Total Hours</label>
                    <div>{{ currentTimesheet()?.totalHours || 0 }} hours</div>
                  </div>
                  <div class="mb-3">
                    <label class="text-muted small">Submitted On</label>
                    <div>
                      {{
                        currentTimesheet()?.submittedAt
                          ? (currentTimesheet()?.submittedAt | date: 'dd MMM yyyy')
                          : '-'
                      }}
                    </div>
                  </div>
                  @if (currentTimesheet()?.approvedByName) {
                    <div class="mb-3">
                      <label class="text-muted small">Approved By</label>
                      <div>{{ currentTimesheet()?.approvedByName }}</div>
                    </div>
                  }
                </div>
              </div>
            }

            @if (canApprove() && currentTimesheet()?.status === 'submitted') {
              <div class="card shadow-sm">
                <div class="card-header bg-white">
                  <h5 class="mb-0">Approval Actions</h5>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <label class="form-label">Comments (Optional)</label>
                    <textarea
                      class="form-control"
                      [(ngModel)]="approvalComments"
                      rows="3"
                      placeholder="Add comments..."
                    ></textarea>
                  </div>
                  <div class="d-grid gap-2">
                    <button class="btn btn-success" (click)="onApprove()">
                      <i class="fas fa-check me-2"></i>
                      Approve
                    </button>
                    <button class="btn btn-danger" (click)="onReject()">
                      <i class="fas fa-times me-2"></i>
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            }

            @if (currentTimesheet()?.status === 'draft' && !canApprove()) {
              <div class="card shadow-sm">
                <div class="card-body">
                  <button
                    class="btn btn-primary w-100"
                    (click)="onSubmit('submitted')"
                    [disabled]="timesheetForm.invalid || entriesArray.length === 0"
                  >
                    <i class="fas fa-paper-plane me-2"></i>
                    Submit for Approval
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class TimesheetEntryComponent implements OnInit {
  readonly store = inject(TimesheetStore);
  private api = inject(TimesheetApiService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private rbacService = inject(RbacService);
  private destroy$ = new Subject<void>();

  timesheetForm!: FormGroup;
  currentTimesheet = signal<Timesheet | null>(null);
  approvalComments = '';
  isEditMode = false;
  isViewMode = false;
  timesheetId: number | null = null;

  readonly Permission = Permission;
  readonly getStatusLabel = getTimesheetStatusLabel;

  get canApprove(): () => boolean {
    return () => this.rbacService.hasPermission(Permission.EDIT);
  }

  get entriesArray(): FormArray {
    return this.timesheetForm.get('entries') as FormArray;
  }

  get totalHours(): number {
    if (!this.timesheetForm.get('entries')) return 0;
    return this.entriesArray.controls.reduce((sum, control) => {
      return sum + (Number(control.get('hours')?.value) || 0);
    }, 0);
  }

  get weekStartDate(): string {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff)).toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.initForm();
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['id']) {
        this.timesheetId = +params['id'];
        this.loadTimesheet(this.timesheetId);
      }
    });
  }

  private initForm(): void {
    this.timesheetForm = this.fb.group({
      weekStartDate: [this.weekStartDate, Validators.required],
      entries: this.fb.array([this.createEntry()]),
    });
  }

  private createEntry(date = ''): FormGroup {
    return this.fb.group({
      date: [date || this.getDefaultDate(), Validators.required],
      hours: ['', [Validators.required, Validators.min(0), Validators.max(24)]],
      taskDescription: ['', Validators.required],
      isBillable: [false],
    });
  }

  private getDefaultDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private loadTimesheet(id: number): void {
    this.api.getByWeek(this.weekStartDate).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.currentTimesheet.set(response.data);
          this.patchForm(response.data);
        }
      },
    });
  }

  private patchForm(timesheet: Timesheet): void {
    if (timesheet.status !== TimesheetStatus.DRAFT) {
      this.isViewMode = true;
    }
    this.timesheetForm.patchValue({
      weekStartDate: timesheet.weekStartDate,
    });

    this.entriesArray.clear();
    if (timesheet.entries && timesheet.entries.length > 0) {
      timesheet.entries.forEach((entry) => {
        this.entriesArray.push(
          this.fb.group({
            date: [entry.date],
            hours: [entry.hours],
            taskDescription: [entry.taskDescription],
            isBillable: [entry.isBillable],
          }),
        );
      });
    } else {
      this.entriesArray.push(this.createEntry());
    }
  }

  addEntry(): void {
    this.entriesArray.push(this.createEntry());
  }

  removeEntry(index: number): void {
    if (this.entriesArray.length > 1) {
      this.entriesArray.removeAt(index);
    }
  }

  onSubmit(status: string): void {
    if (this.timesheetForm.invalid) return;

    const formValue = this.timesheetForm.value;
    const data: Partial<Timesheet> = {
      weekStartDate: formValue.weekStartDate,
      entries: formValue.entries,
      status: status as TimesheetStatus,
      totalHours: this.totalHours,
    };

    if (this.timesheetId) {
      this.api.update(this.timesheetId, data).subscribe({
        next: (response) => {
          if (response.success) {
            alert(`Timesheet ${status === 'submitted' ? 'submitted' : 'saved'} successfully`);
            this.router.navigate(['/timesheet']);
          }
        },
      });
    } else {
      this.store.saveTimesheet(data).subscribe({
        next: (response) => {
          if (response.success) {
            alert(`Timesheet ${status === 'submitted' ? 'submitted' : 'saved'} successfully`);
            this.router.navigate(['/timesheet']);
          }
        },
      });
    }
  }

  onApprove(): void {
    if (!this.timesheetId) return;
    if (confirm('Approve this timesheet?')) {
      this.store.approveTimesheet(this.timesheetId, this.approvalComments).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Timesheet approved');
            this.router.navigate(['/timesheet']);
          }
        },
      });
    }
  }

  onReject(): void {
    if (!this.timesheetId) return;
    const comments = prompt('Enter rejection reason:');
    if (comments) {
      this.store.rejectTimesheet(this.timesheetId, comments).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Timesheet rejected');
            this.router.navigate(['/timesheet']);
          }
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/timesheet']);
  }
}
