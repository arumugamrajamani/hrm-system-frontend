import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatCardModule,
    BaseChartDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart-card">
      <div class="chart-header">
        <div class="chart-title-section">
          @if (icon) {
            <mat-icon class="chart-icon">{{ icon }}</mat-icon>
          }
          <div>
            <h3 class="chart-title">{{ title }}</h3>
            @if (subtitle) {
              <span class="chart-subtitle">{{ subtitle }}</span>
            }
          </div>
        </div>
        @if (showActions) {
          <button mat-icon-button [matMenuTriggerFor]="chartMenu">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #chartMenu="matMenu">
            <button mat-menu-item (click)="onExport('png')">
              <mat-icon>image</mat-icon>
              <span>Export as PNG</span>
            </button>
            <button mat-menu-item (click)="onExport('csv')">
              <mat-icon>table_chart</mat-icon>
              <span>Export as CSV</span>
            </button>
            <button mat-menu-item (click)="onRefresh()">
              <mat-icon>refresh</mat-icon>
              <span>Refresh</span>
            </button>
          </mat-menu>
        }
      </div>
      <div class="chart-body">
        <canvas baseChart [data]="chartData" [options]="chartOptions" [type]="chartType"></canvas>
      </div>
    </div>
  `,
  styles: [
    `
      .chart-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        overflow: hidden;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .chart-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid #e2e8f0;
      }

      .chart-title-section {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .chart-icon {
        color: #3f51b5;
        background: #3f51b515;
        padding: 8px;
        border-radius: 8px;
      }

      .chart-title {
        font-size: 16px;
        font-weight: 600;
        color: #1a202c;
        margin: 0;
      }

      .chart-subtitle {
        font-size: 12px;
        color: #718096;
      }

      .chart-body {
        padding: 16px;
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 250px;
      }

      .chart-body canvas {
        max-height: 300px;
      }

      :host-context(.dark-mode) {
        .chart-card {
          background: #2d3748;
        }

        .chart-header {
          border-bottom-color: #4a5568;
        }

        .chart-title {
          color: #f7fafc;
        }

        .chart-subtitle {
          color: #a0aec0;
        }
      }
    `,
  ],
})
export class ChartCardComponent {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() chartType: ChartType = 'bar';
  @Input() chartData: ChartData = { labels: [], datasets: [] };
  @Input() chartOptions: ChartOptions = {};
  @Input() showActions = true;

  onExport(format: string): void {
    console.log(`Exporting chart as ${format}...`);
  }

  onRefresh(): void {
    console.log('Refreshing chart data...');
  }
}
