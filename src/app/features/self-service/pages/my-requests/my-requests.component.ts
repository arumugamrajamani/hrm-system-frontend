import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SelfServiceApiService } from '../../services/self-service-api.service';

@Component({
  selector: 'app-my-requests',
  standalone: false,
  templateUrl: './my-requests.component.html',
  styleUrls: ['./my-requests.component.scss'],
})
export class MyRequestsComponent implements OnInit {
  filterForm: FormGroup;
  selectedTab = 0;
  loading = false;

  leaveRequests = [
    {
      id: 1,
      type: 'Casual Leave',
      date: '2026-04-15',
      days: 2,
      status: 'approved',
      remarks: 'Family function',
    },
    { id: 2, type: 'Sick Leave', date: '2026-04-10', days: 1, status: 'pending', remarks: 'Fever' },
    {
      id: 3,
      type: 'Annual Leave',
      date: '2026-05-01',
      days: 5,
      status: 'pending',
      remarks: 'Vacation',
    },
  ];

  timesheetRequests = [
    {
      id: 1,
      type: 'Weekly Timesheet',
      date: '2026-04-20',
      hours: 40,
      status: 'submitted',
      remarks: 'Week 16',
    },
    {
      id: 2,
      type: 'Weekly Timesheet',
      date: '2026-04-13',
      hours: 38,
      status: 'approved',
      remarks: 'Week 15',
    },
  ];

  profileUpdates = [
    {
      id: 1,
      type: 'Phone Number',
      date: '2026-04-18',
      current: '+1234567890',
      requested: '+1987654321',
      status: 'pending',
      remarks: 'Changed number',
    },
    {
      id: 2,
      type: 'Address',
      date: '2026-04-10',
      current: 'Old Address',
      requested: 'New Address',
      status: 'approved',
      remarks: 'Relocated',
    },
  ];

  documentRequests = [
    {
      id: 1,
      type: 'Experience Certificate',
      date: '2026-04-19',
      status: 'pending',
      remarks: 'For loan application',
    },
    { id: 2, type: 'Salary Slip', date: '2026-04-15', status: 'approved', remarks: 'March 2026' },
  ];

  otherRequests = [
    {
      id: 1,
      type: 'Desk Change',
      date: '2026-04-17',
      status: 'rejected',
      remarks: 'No availability',
    },
    {
      id: 2,
      type: 'Equipment Request',
      date: '2026-04-12',
      status: 'approved',
      remarks: 'New laptop',
    },
  ];

  get currentDataSource(): any[] {
    switch (this.selectedTab) {
      case 0:
        return this.leaveRequests;
      case 1:
        return this.timesheetRequests;
      case 2:
        return this.profileUpdates;
      case 3:
        return this.documentRequests;
      case 4:
        return this.otherRequests;
      default:
        return [];
    }
  }

  get displayedColumns(): string[] {
    const baseColumns = ['type', 'date', 'status', 'remarks', 'actions'];
    if (this.selectedTab === 2) {
      return ['type', 'current', 'requested', 'date', 'status', 'remarks', 'actions'];
    }
    return baseColumns;
  }

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      type: [''],
      status: [''],
      dateRange: this.fb.group({
        start: [null],
        end: [null],
      }),
    });
  }

  ngOnInit(): void {}

  onTabChange(index: number): void {
    this.selectedTab = index;
  }

  applyFilter(): void {
    // Implement filter logic
  }

  clearFilter(): void {
    this.filterForm.reset();
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red',
      submitted: 'blue',
    };
    return colors[status?.toLowerCase()] || 'gray';
  }

  viewRequest(item: any): void {
    console.log('View request:', item);
  }

  cancelRequest(item: any): void {
    console.log('Cancel request:', item);
  }
}
