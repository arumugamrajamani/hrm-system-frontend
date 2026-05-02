import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { RouterModule } from '@angular/router';
import { SelfServiceStore } from '../../services/self-service.store';
import { ESSDashboard, ESSQuickAction } from '../../models/self-service.model';

@Component({
  selector: 'app-ess-dashboard',
  standalone: false,
  templateUrl: './ess-dashboard.component.html',
  styleUrls: ['./ess-dashboard.component.scss'],
})
export class EssDashboardComponent implements OnInit {
  dashboard: ESSDashboard | null = null;
  quickActions: ESSQuickAction[] = [
    {
      id: 'leave',
      label: 'Apply Leave',
      icon: 'event_busy',
      route: '/leave/apply',
      color: '#3B82F6',
      description: 'Apply for leave',
    },
    {
      id: 'payslip',
      label: 'View Payslips',
      icon: 'receipt',
      route: '/self-service/requests',
      color: '#10B981',
      description: 'View salary slips',
    },
    {
      id: 'profile',
      label: 'Update Profile',
      icon: 'person',
      route: '/self-service/profile',
      color: '#8B5CF6',
      description: 'Update profile info',
    },
    {
      id: 'timesheet',
      label: 'Submit Timesheet',
      icon: 'schedule',
      route: '/timesheet/submit',
      color: '#F59E0B',
      description: 'Submit weekly timesheet',
    },
    {
      id: 'document',
      label: 'Request Document',
      icon: 'description',
      route: '/self-service/requests',
      color: '#EF4444',
      description: 'Request documents',
    },
    {
      id: 'holiday',
      label: 'View Holidays',
      icon: 'celebration',
      route: '/holidays',
      color: '#06B6D4',
      description: 'View holiday calendar',
    },
  ];
  loading = true;

  constructor(private store: SelfServiceStore) {}

  ngOnInit(): void {
    this.store.dashboard$.subscribe((d) => {
      this.dashboard = d;
      this.loading = false;
    });
    this.store.loadDashboard();
  }

  getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
      leave: 'event_busy',
      timesheet: 'schedule',
      payroll: 'receipt',
      announcement: 'campaign',
      task: 'task_alt',
    };
    return icons[type] || 'info';
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      approved: 'green',
      pending: 'orange',
      rejected: 'red',
      submitted: 'blue',
    };
    return colors[status?.toLowerCase()] || 'gray';
  }
}
