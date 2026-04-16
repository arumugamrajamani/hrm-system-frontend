import { Injectable, signal, computed } from '@angular/core';

export interface KpiData {
  label: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: string;
  prefix?: string;
  suffix?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}

export interface AnalyticsFilters {
  year?: number;
  quarter?: number;
  month?: number;
  departmentId?: number;
  locationId?: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private _filters = signal<AnalyticsFilters>({
    year: new Date().getFullYear(),
  });

  readonly filters = this._filters.asReadonly();

  readonly kpiData = computed<KpiData[]>(() => [
    {
      label: 'Total Employees',
      value: 1250,
      change: 12,
      changeType: 'increase',
      icon: 'people',
      color: '#3f51b5',
    },
    {
      label: 'New Hires (YTD)',
      value: 87,
      change: 5,
      changeType: 'increase',
      icon: 'person_add',
      color: '#4caf50',
    },
    {
      label: 'Attrition Rate',
      value: 8.5,
      change: -2.1,
      changeType: 'decrease',
      icon: 'trending_down',
      color: '#ff9800',
      suffix: '%',
    },
    {
      label: 'Avg Tenure',
      value: 3.2,
      change: 0.3,
      changeType: 'increase',
      icon: 'schedule',
      color: '#9c27b0',
      suffix: ' yrs',
    },
    {
      label: 'Open Positions',
      value: 23,
      change: -8,
      changeType: 'decrease',
      icon: 'work',
      color: '#e91e63',
    },
    {
      label: 'Pending Approvals',
      value: 45,
      change: 15,
      changeType: 'increase',
      icon: 'pending_actions',
      color: '#00bcd4',
    },
  ]);

  readonly employeeDistributionByDepartment: ChartData = {
    labels: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'],
    datasets: [
      {
        label: 'Employees',
        data: [420, 280, 150, 85, 120, 195],
        backgroundColor: ['#3f51b5', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4', '#e91e63'],
      },
    ],
  };

  readonly employeeTrend: ChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Employees',
        data: [1150, 1175, 1190, 1205, 1220, 1235, 1228, 1235, 1242, 1245, 1248, 1250],
        borderColor: '#3f51b5',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  readonly leaveBalanceDistribution: ChartData = {
    labels: ['Casual Leave', 'Sick Leave', 'Privileged Leave', 'Work From Home'],
    datasets: [
      {
        label: 'Days Used',
        data: [8, 5, 12, 15],
        backgroundColor: ['#3f51b5', '#4caf50', '#ff9800', '#9c27b0'],
      },
    ],
  };

  readonly attendanceRate: ChartData = {
    labels: ['Present', 'Absent', 'On Leave', 'WFH'],
    datasets: [
      {
        label: 'Attendance',
        data: [85, 5, 7, 3],
        backgroundColor: ['#4caf50', '#f44336', '#ff9800', '#2196f3'],
      },
    ],
  };

  readonly salaryDistribution: ChartData = {
    labels: ['< 30K', '30K - 50K', '50K - 80K', '80K - 120K', '> 120K'],
    datasets: [
      {
        label: 'Employees',
        data: [150, 380, 420, 200, 100],
        backgroundColor: 'rgba(63, 81, 181, 0.8)',
        borderColor: '#3f51b5',
        borderWidth: 1,
      },
    ],
  };

  readonly performanceOverview: ChartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Exceeds Expectations',
        data: [45, 52, 48, 61],
        backgroundColor: '#4caf50',
      },
      {
        label: 'Meets Expectations',
        data: [180, 195, 210, 220],
        backgroundColor: '#2196f3',
      },
      {
        label: 'Needs Improvement',
        data: [25, 18, 15, 12],
        backgroundColor: '#ff9800',
      },
    ],
  };

  readonly genderDistribution: ChartData = {
    labels: ['Male', 'Female', 'Other'],
    datasets: [
      {
        label: 'Distribution',
        data: [62, 35, 3],
        backgroundColor: ['#3f51b5', '#e91e63', '#9e9e9e'],
      },
    ],
  };

  readonly ageGroupDistribution: ChartData = {
    labels: ['18-25', '26-35', '36-45', '46-55', '55+'],
    datasets: [
      {
        label: 'Employees',
        data: [180, 450, 350, 200, 70],
        backgroundColor: ['#7986cb', '#3f51b5', '#303f9f', '#1a237e', '#000051'],
      },
    ],
  };

  readonly monthlyTurnover: ChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'New Hires',
        data: [15, 12, 18, 22, 19, 25, 14, 16, 20, 18, 12, 8],
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Exits',
        data: [8, 10, 12, 15, 11, 9, 14, 10, 8, 7, 9, 6],
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  setFilters(filters: AnalyticsFilters): void {
    this._filters.set(filters);
  }

  updateFilter(key: keyof AnalyticsFilters, value: any): void {
    this._filters.update((current) => ({ ...current, [key]: value }));
  }

  exportToPdf(): void {
    console.log('Exporting analytics to PDF...');
  }

  exportToExcel(): void {
    console.log('Exporting analytics to Excel...');
  }

  refreshData(): void {
    console.log('Refreshing analytics data...');
  }
}
