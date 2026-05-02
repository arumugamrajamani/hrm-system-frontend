import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { EmployeeShift, ShiftRoster, ShiftRosterEntry } from '../../models/attendance.model';

@Component({
  selector: 'app-shift-roster',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-calendar-week me-2"></i>
            Shift Roster Management
          </h2>
        </div>
        <div class="col-auto">
          <div class="btn-group">
            <button
              class="btn btn-outline-primary"
              (click)="viewMode.set('grid')"
              [class.active]="viewMode() === 'grid'"
            >
              <i class="fas fa-th"></i> Grid
            </button>
            <button
              class="btn btn-outline-primary"
              (click)="viewMode.set('calendar')"
              [class.active]="viewMode() === 'calendar'"
            >
              <i class="fas fa-calendar-alt"></i> Calendar
            </button>
          </div>
        </div>
        <div class="col-auto">
          <button class="btn btn-primary" (click)="showAssignForm.set(!showAssignForm())">
            <i
              class="fas"
              [class.fa-plus]="!showAssignForm()"
              [class.fa-times]="showAssignForm()"
            ></i>
            {{ showAssignForm() ? 'Cancel' : 'Assign Shift' }}
          </button>
        </div>
      </div>

      <!-- Assign Shift Form -->
      @if (showAssignForm()) {
        <div class="card shadow-sm mb-4">
          <div class="card-header">
            <h5 class="mb-0">Assign Shift to Employee</h5>
          </div>
          <div class="card-body">
            <form [formGroup]="assignForm" (ngSubmit)="assignShift()">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label">Employee ID</label>
                  <input
                    type="number"
                    class="form-control"
                    formControlName="employeeId"
                    placeholder="Enter employee ID"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Shift</label>
                  <select class="form-select" formControlName="shiftId">
                    <option value="">Select shift</option>
                    <option value="1">Morning Shift (6:00 - 14:00)</option>
                    <option value="2">General Shift (9:00 - 17:00)</option>
                    <option value="3">Evening Shift (14:00 - 22:00)</option>
                    <option value="4">Night Shift (22:00 - 6:00)</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Start Date</label>
                  <input type="date" class="form-control" formControlName="startDate" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">End Date (Optional)</label>
                  <input type="date" class="form-control" formControlName="endDate" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Recurring</label>
                  <div class="form-check mt-2">
                    <input class="form-check-input" type="checkbox" formControlName="isRecurring" />
                    <label class="form-check-label">Is Recurring</label>
                  </div>
                </div>
                @if (assignForm.get('isRecurring')?.value) {
                  <div class="col-md-4">
                    <label class="form-label">Recurring Pattern</label>
                    <select class="form-select" formControlName="recurringPattern">
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                }
                <div class="col-12">
                  <button type="submit" class="btn btn-primary" [disabled]="assignForm.invalid">
                    Assign Shift
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Grid View -->
      @if (viewMode() === 'grid') {
        <div class="card shadow-sm">
          <div class="card-body p-0">
            @if (loading()) {
              <div class="text-center py-5">
                <div class="spinner-border text-primary"></div>
              </div>
            } @else {
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Shift</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Recurring</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (shift of shifts(); track shift.id) {
                      <tr>
                        <td>{{ shift.employeeName || 'EMP-' + shift.employeeId }}</td>
                        <td>{{ shift.shiftName || 'Shift-' + shift.shiftId }}</td>
                        <td>{{ shift.startDate | date: 'mediumDate' }}</td>
                        <td>
                          {{ shift.endDate ? (shift.endDate | date: 'mediumDate') : 'Ongoing' }}
                        </td>
                        <td>
                          @if (shift.isRecurring) {
                            <span class="badge bg-info">{{ shift.recurringPattern }}</span>
                          } @else {
                            <span class="text-muted">No</span>
                          }
                        </td>
                        <td>
                          <span class="badge" [class]="shift.isActive ? 'bg-success' : 'bg-danger'">
                            {{ shift.isActive ? 'Active' : 'Inactive' }}
                          </span>
                        </td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button
                              class="btn btn-outline-primary"
                              (click)="editShift(shift)"
                              title="Edit"
                            >
                              <i class="fas fa-edit"></i>
                            </button>
                            <button
                              class="btn btn-outline-danger"
                              (click)="deleteShift(shift)"
                              title="Delete"
                            >
                              <i class="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="7" class="text-center py-4 text-muted">
                          No shift assignments found
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

      <!-- Calendar View -->
      @if (viewMode() === 'calendar') {
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="row mb-3">
              <div class="col-auto">
                <div class="btn-group">
                  <button class="btn btn-outline-secondary" (click)="previousMonth()">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <button class="btn btn-outline-secondary disabled">
                    {{ monthNames[currentMonth - 1] }} {{ currentYear }}
                  </button>
                  <button class="btn btn-outline-secondary" (click)="nextMonth()">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="calendar-grid">
              <div class="calendar-header">
                @for (day of weekDays; track day) {
                  <div class="calendar-header-cell">{{ day }}</div>
                }
              </div>
              <div class="calendar-body">
                @for (day of calendarDays(); track day.date) {
                  <div
                    class="calendar-cell"
                    [class.other-month]="!day.isCurrentMonth"
                    [class.today]="day.isToday"
                  >
                    <div class="day-number">{{ day.day }}</div>
                    @for (shift of day.shifts; track shift.id) {
                      <div
                        class="shift-badge"
                        [title]="shift.employeeName + ' - ' + shift.shiftName"
                      >
                        {{ shift.employeeName || 'EMP-' + shift.employeeId }}
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .page-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #2c3e50;
      }
      .calendar-grid {
        display: flex;
        flex-direction: column;
      }
      .calendar-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        background: #f8f9fa;
        border-bottom: 1px solid #dee2e6;
      }
      .calendar-header-cell {
        padding: 12px;
        text-align: center;
        font-weight: 600;
        color: #6c757d;
      }
      .calendar-body {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
      }
      .calendar-cell {
        min-height: 100px;
        padding: 8px;
        border-right: 1px solid #dee2e6;
        border-bottom: 1px solid #dee2e6;
      }
      .calendar-cell:nth-child(7n) {
        border-right: none;
      }
      .calendar-cell.other-month {
        background: #fafafa;
        color: #adb5bd;
      }
      .calendar-cell.today {
        background: #e7f1ff;
      }
      .day-number {
        font-weight: 600;
        margin-bottom: 4px;
      }
      .shift-badge {
        font-size: 10px;
        padding: 2px 6px;
        margin: 2px 0;
        background: #e3f2fd;
        border-radius: 3px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `,
  ],
})
export class ShiftRosterComponent implements OnInit {
  private fb = inject(FormBuilder);

  viewMode = signal<'grid' | 'calendar'>('grid');
  showAssignForm = signal(false);
  loading = signal(false);

  currentMonth = 1;
  currentYear = 2024;
  weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  shifts = signal<EmployeeShift[]>([
    {
      id: 1,
      employeeId: 101,
      employeeName: 'John Doe',
      shiftId: 2,
      shiftName: 'General Shift (9:00 - 17:00)',
      startDate: '2026-04-01',
      isRecurring: true,
      recurringPattern: 'weekly',
      isActive: true,
    },
    {
      id: 2,
      employeeId: 102,
      employeeName: 'Jane Smith',
      shiftId: 1,
      shiftName: 'Morning Shift (6:00 - 14:00)',
      startDate: '2026-04-01',
      endDate: '2026-06-30',
      isRecurring: false,
      isActive: true,
    },
  ]);

  calendarDays = signal<any[]>([]);

  assignForm: FormGroup;

  constructor() {
    this.assignForm = this.fb.group({
      employeeId: ['', Validators.required],
      shiftId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      isRecurring: [false],
      recurringPattern: [''],
    });
  }

  ngOnInit(): void {
    const now = new Date();
    this.currentMonth = now.getMonth() + 1;
    this.currentYear = now.getFullYear();
    this.generateCalendarDays();
  }

  generateCalendarDays(): void {
    const days: any[] = [];
    const today = new Date().toISOString().split('T')[0];

    const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth, 0);
    const startDayOfWeek = firstDay.getDay() || 7;

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(firstDay);
      date.setDate(date.getDate() - i - 1);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        day: date.getDate(),
        isCurrentMonth: false,
        isToday: dateStr === today,
        shifts: [],
      });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(this.currentYear, this.currentMonth - 1, d);
      const dateStr = date.toISOString().split('T')[0];
      const dayShifts = this.getShiftsForDate(dateStr);
      days.push({
        date: dateStr,
        day: d,
        isCurrentMonth: true,
        isToday: dateStr === today,
        shifts: dayShifts,
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        day: i,
        isCurrentMonth: false,
        isToday: dateStr === today,
        shifts: [],
      });
    }

    this.calendarDays.set(days);
  }

  getShiftsForDate(date: string): any[] {
    return this.shifts()
      .filter((s) => {
        if (date < s.startDate) return false;
        if (s.endDate && date > s.endDate) return false;
        return true;
      })
      .map((s) => ({
        id: s.id,
        employeeId: s.employeeId,
        employeeName: s.employeeName,
        shiftName: s.shiftName,
      }));
  }

  previousMonth(): void {
    this.currentMonth--;
    if (this.currentMonth < 1) {
      this.currentMonth = 12;
      this.currentYear--;
    }
    this.generateCalendarDays();
  }

  nextMonth(): void {
    this.currentMonth++;
    if (this.currentMonth > 12) {
      this.currentMonth = 1;
      this.currentYear++;
    }
    this.generateCalendarDays();
  }

  assignShift(): void {
    if (this.assignForm.invalid) return;

    const formValue = this.assignForm.value;
    const shiftNames: Record<number, string> = {
      1: 'Morning Shift (6:00 - 14:00)',
      2: 'General Shift (9:00 - 17:00)',
      3: 'Evening Shift (14:00 - 22:00)',
      4: 'Night Shift (22:00 - 6:00)',
    };

    const newShift: EmployeeShift = {
      id: this.shifts().length + 1,
      employeeId: formValue.employeeId,
      shiftId: formValue.shiftId,
      shiftName: shiftNames[formValue.shiftId] || 'Unknown',
      startDate: formValue.startDate,
      endDate: formValue.endDate || undefined,
      isRecurring: formValue.isRecurring,
      recurringPattern: formValue.recurringPattern || undefined,
      isActive: true,
    };

    this.shifts.set([...this.shifts(), newShift]);
    this.assignForm.reset();
    this.showAssignForm.set(false);
    this.generateCalendarDays();
  }

  editShift(shift: EmployeeShift): void {
    this.assignForm.patchValue({
      employeeId: shift.employeeId,
      shiftId: shift.shiftId,
      startDate: shift.startDate,
      endDate: shift.endDate || '',
      isRecurring: shift.isRecurring,
      recurringPattern: shift.recurringPattern || '',
    });
    this.showAssignForm.set(true);
  }

  deleteShift(shift: EmployeeShift): void {
    this.shifts.set(this.shifts().filter((s) => s.id !== shift.id));
    this.generateCalendarDays();
  }
}
