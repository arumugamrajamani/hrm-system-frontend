import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { KpiCardComponent } from '../../../../shared/components/kpi-card/kpi-card.component';
import { ChartCardComponent } from '../../../../shared/components/chart-card/chart-card.component';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatMenuModule,
    KpiCardComponent,
    ChartCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="analytics-dashboard">
      <div class="dashboard-header">
        <div class="header-title">
          <h1>
            <mat-icon>analytics</mat-icon>
            Analytics Dashboard
          </h1>
          <p>Real-time HR metrics and insights</p>
        </div>
        <div class="header-actions">
          <mat-form-field appearance="outline" class="year-select">
            <mat-label>Year</mat-label>
            <mat-select
              [value]="analytics.filters().year"
              (selectionChange)="onYearChange($event.value)"
            >
              <mat-option [value]="2026">2026</mat-option>
              <mat-option [value]="2025">2025</mat-option>
              <mat-option [value]="2024">2024</mat-option>
            </mat-select>
          </mat-form-field>
          <button mat-flat-button color="primary" (click)="analytics.refreshData()">
            <mat-icon>refresh</mat-icon>
            Refresh
          </button>
          <button mat-icon-button [matMenuTriggerFor]="exportMenu">
            <mat-icon>download</mat-icon>
          </button>
          <mat-menu #exportMenu="matMenu">
            <button mat-menu-item (click)="exportToPdf()">
              <mat-icon>picture_as_pdf</mat-icon>
              Export as PDF
            </button>
            <button mat-menu-item (click)="exportToExcel()">
              <mat-icon>table_chart</mat-icon>
              Export as Excel
            </button>
          </mat-menu>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        @for (kpi of analytics.kpiData(); track kpi.label) {
          <app-kpi-card
            [label]="kpi.label"
            [value]="kpi.value"
            [change]="kpi.change"
            [changeType]="kpi.changeType || 'neutral'"
            [icon]="kpi.icon"
            [color]="kpi.color"
            [suffix]="kpi.suffix"
          ></app-kpi-card>
        }
      </div>

      <!-- Charts Row 1 -->
      <div class="charts-row">
        <div class="chart-large">
          <app-chart-card
            title="Employee Growth Trend"
            subtitle="Monthly employee count over the year"
            icon="trending_up"
            chartType="line"
            [chartData]="analytics.employeeTrend"
            [chartOptions]="lineChartOptions"
          ></app-chart-card>
        </div>
        <div class="chart-medium">
          <app-chart-card
            title="Department Distribution"
            subtitle="Employees by department"
            icon="business"
            chartType="doughnut"
            [chartData]="analytics.employeeDistributionByDepartment"
            [chartOptions]="doughnutChartOptions"
          ></app-chart-card>
        </div>
      </div>

      <!-- Charts Row 2 -->
      <div class="charts-row">
        <div class="chart-medium">
          <app-chart-card
            title="Attendance Overview"
            subtitle="Current month attendance status"
            icon="event_available"
            chartType="pie"
            [chartData]="analytics.attendanceRate"
            [chartOptions]="pieChartOptions"
          ></app-chart-card>
        </div>
        <div class="chart-medium">
          <app-chart-card
            title="Salary Distribution"
            subtitle="Employee count by salary range"
            icon="payments"
            chartType="bar"
            [chartData]="analytics.salaryDistribution"
            [chartOptions]="barChartOptions"
          ></app-chart-card>
        </div>
        <div class="chart-medium">
          <app-chart-card
            title="Gender Distribution"
            subtitle="Workforce diversity"
            icon="diversity_3"
            chartType="doughnut"
            [chartData]="analytics.genderDistribution"
            [chartOptions]="doughnutChartOptions"
          ></app-chart-card>
        </div>
      </div>

      <!-- Charts Row 3 -->
      <div class="charts-row">
        <div class="chart-large">
          <app-chart-card
            title="Monthly Turnover Analysis"
            subtitle="New hires vs exits"
            icon="swap_horiz"
            chartType="line"
            [chartData]="analytics.monthlyTurnover"
            [chartOptions]="multiLineChartOptions"
          ></app-chart-card>
        </div>
        <div class="chart-medium">
          <app-chart-card
            title="Performance Overview"
            subtitle="Employee performance by quarter"
            icon="assessment"
            chartType="bar"
            [chartData]="analytics.performanceOverview"
            [chartOptions]="stackedBarChartOptions"
          ></app-chart-card>
        </div>
      </div>

      <!-- Charts Row 4 -->
      <div class="charts-row">
        <div class="chart-medium">
          <app-chart-card
            title="Age Group Distribution"
            subtitle="Employees by age group"
            icon="person"
            chartType="bar"
            [chartData]="analytics.ageGroupDistribution"
            [chartOptions]="horizontalBarChartOptions"
          ></app-chart-card>
        </div>
        <div class="chart-medium">
          <app-chart-card
            title="Leave Balance"
            subtitle="Average leave days used"
            icon="event_busy"
            chartType="bar"
            [chartData]="analytics.leaveBalanceDistribution"
            [chartOptions]="barChartOptions"
          ></app-chart-card>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .analytics-dashboard {
        padding: 24px;
        max-width: 1600px;
        margin: 0 auto;
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        flex-wrap: wrap;
        gap: 16px;
      }

      .header-title h1 {
        font-size: 28px;
        font-weight: 700;
        color: #1a202c;
        margin: 0 0 4px 0;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .header-title h1 mat-icon {
        color: #3f51b5;
      }

      .header-title p {
        color: #718096;
        margin: 0;
        font-size: 14px;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .year-select {
        width: 120px;
      }

      .year-select ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        display: none;
      }

      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 20px;
        margin-bottom: 24px;
      }

      .charts-row {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 20px;
        margin-bottom: 24px;
      }

      .chart-large {
        grid-column: span 8;
      }

      .chart-medium {
        grid-column: span 4;
      }

      @media (max-width: 1200px) {
        .chart-large,
        .chart-medium {
          grid-column: span 6;
        }
      }

      @media (max-width: 768px) {
        .chart-large,
        .chart-medium {
          grid-column: span 12;
        }

        .kpi-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 480px) {
        .kpi-grid {
          grid-template-columns: 1fr;
        }

        .dashboard-header {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class AnalyticsDashboardComponent implements OnInit {
  analytics = inject(AnalyticsService);

  lineChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          display: true,
          color: '#e2e8f0',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  pieChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
        },
      },
    },
  };

  barChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: '#e2e8f0',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  stackedBarChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          display: true,
          color: '#e2e8f0',
        },
      },
    },
  };

  horizontalBarChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: '#e2e8f0',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  multiLineChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: '#e2e8f0',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  ngOnInit(): void {}

  onYearChange(year: number): void {
    this.analytics.updateFilter('year', year);
  }

  exportToPdf(): void {
    this.analytics.exportToPdf();
  }

  exportToExcel(): void {
    this.analytics.exportToExcel();
  }
}
