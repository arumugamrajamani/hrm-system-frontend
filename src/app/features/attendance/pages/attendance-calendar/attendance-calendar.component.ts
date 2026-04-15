import { Component, OnInit, inject, signal, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { AttendanceStore } from '../../services/attendance.store';
import {
  AttendanceRecord,
  AttendanceStatus,
  getAttendanceStatusLabel,
  getAttendanceStatusColor,
} from '../../models/attendance.model';
import { Permission } from '../../../../core/models/rbac.models';

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  records: AttendanceRecord[];
  status?: AttendanceStatus;
}

@Component({
  selector: 'app-attendance-calendar',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-calendar-alt me-2"></i>
            Attendance Calendar
          </h2>
        </div>
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

      <!-- Legend -->
      <div class="row mb-3">
        <div class="col">
          <div class="d-flex flex-wrap gap-2">
            @for (status of statusList; track status) {
              <span class="badge" [class]="'bg-' + getStatusColor(status)">
                {{ getStatusLabel(status) }}
              </span>
            }
          </div>
        </div>
      </div>

      <!-- Calendar -->
      @if (store.loading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>
      } @else {
        <div class="card shadow-sm">
          <div class="card-body p-0">
            <div class="calendar-grid">
              <!-- Weekday headers -->
              <div class="calendar-header">
                @for (day of weekDays; track day) {
                  <div class="calendar-header-cell">{{ day }}</div>
                }
              </div>

              <!-- Calendar days -->
              <div class="calendar-body">
                @for (day of calendarDays(); track day.date) {
                  <div
                    class="calendar-cell"
                    [class.other-month]="!day.isCurrentMonth"
                    [class.today]="day.isToday"
                    (click)="onDayClick(day)"
                  >
                    <div class="day-number">{{ day.day }}</div>
                    @if (day.records.length > 0) {
                      <div class="day-status">
                        <span
                          class="badge"
                          [class]="'bg-' + getStatusColor(day.status!)"
                          [title]="day.records.length + ' record(s)'"
                        >
                          {{ getStatusLabel(day.status!) }}
                        </span>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Day Details Modal -->
      @if (selectedDay()) {
        <div class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  Attendance - {{ selectedDay()!.date | date: 'dd MMMM yyyy' }}
                </h5>
                <button type="button" class="btn-close" (click)="closeModal()"></button>
              </div>
              <div class="modal-body">
                @if (selectedDay()!.records.length > 0) {
                  <div class="table-responsive">
                    <table class="table table-sm table-hover">
                      <thead>
                        <tr>
                          <th>Employee</th>
                          <th>Check In</th>
                          <th>Check Out</th>
                          <th>Work Hours</th>
                          <th>Status</th>
                          <th>Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (record of selectedDay()!.records; track record.id) {
                          <tr>
                            <td>{{ record.employeeName || 'N/A' }}</td>
                            <td>{{ record.checkIn || '-' }}</td>
                            <td>{{ record.checkOut || '-' }}</td>
                            <td>{{ record.workHours || 0 }} hrs</td>
                            <td>
                              <span class="badge" [class]="'bg-' + getStatusColor(record.status)">
                                {{ getStatusLabel(record.status) }}
                              </span>
                            </td>
                            <td>{{ record.remarks || '-' }}</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                } @else {
                  <p class="text-muted text-center py-4">No attendance records for this date</p>
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
        cursor: pointer;
        transition: background 0.2s;
      }
      .calendar-cell:nth-child(7n) {
        border-right: none;
      }
      .calendar-cell:hover {
        background: #f8f9fa;
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
      .day-status {
        display: flex;
        justify-content: center;
      }
      .day-status .badge {
        font-size: 10px;
        padding: 2px 6px;
      }
    `,
  ],
})
export class AttendanceCalendarComponent implements OnInit {
  readonly store = inject(AttendanceStore);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  selectedDay = signal<{ date: string; records: AttendanceRecord[] } | null>(null);

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

  statusList = Object.values(AttendanceStatus);

  readonly Permission = Permission;
  readonly getStatusLabel = getAttendanceStatusLabel;
  readonly getStatusColor = getAttendanceStatusColor;

  calendarDays = signal<CalendarDay[]>([]);

  constructor() {
    effect(() => {
      const dataMap = this.store.calendarData();
      this.generateCalendarDays(dataMap);
    });
  }

  ngOnInit(): void {
    const now = new Date();
    this.currentMonth = now.getMonth() + 1;
    this.currentYear = now.getFullYear();
    this.store.setMonth(this.currentMonth, this.currentYear);
    this.loadCalendar();
  }

  private loadCalendar(): void {
    this.store.loadCalendar(undefined, this.currentMonth, this.currentYear);
  }

  private generateCalendarDays(dataMap: Map<string, AttendanceRecord[]>): void {
    const days: CalendarDay[] = [];
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
        records: dataMap.get(dateStr) || [],
      });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(this.currentYear, this.currentMonth - 1, d);
      const dateStr = date.toISOString().split('T')[0];
      const records = dataMap.get(dateStr) || [];
      days.push({
        date: dateStr,
        day: d,
        isCurrentMonth: true,
        isToday: dateStr === today,
        records,
        status: records.length > 0 ? records[0].status : undefined,
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
        records: dataMap.get(dateStr) || [],
      });
    }

    this.calendarDays.set(days);
  }

  previousMonth(): void {
    this.currentMonth--;
    if (this.currentMonth < 1) {
      this.currentMonth = 12;
      this.currentYear--;
    }
    this.store.setMonth(this.currentMonth, this.currentYear);
    this.loadCalendar();
  }

  nextMonth(): void {
    this.currentMonth++;
    if (this.currentMonth > 12) {
      this.currentMonth = 1;
      this.currentYear++;
    }
    this.store.setMonth(this.currentMonth, this.currentYear);
    this.loadCalendar();
  }

  onDayClick(day: CalendarDay): void {
    if (day.records.length > 0) {
      this.selectedDay.set({ date: day.date, records: day.records });
    }
  }

  closeModal(): void {
    this.selectedDay.set(null);
  }
}
