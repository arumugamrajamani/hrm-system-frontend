import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="kpi-card" [style.--accent-color]="color">
      <div class="kpi-icon" [style.backgroundColor]="color + '15'">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
      <div class="kpi-content">
        <span class="kpi-label">{{ label }}</span>
        <div class="kpi-value">{{ prefix || '' }}{{ formattedValue }}{{ suffix || '' }}</div>
        @if (change !== undefined) {
          <div class="kpi-change" [class]="changeClass">
            <mat-icon>{{ changeIcon }}</mat-icon>
            <span>{{ changeLabel }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .kpi-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        display: flex;
        align-items: flex-start;
        gap: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        border: 1px solid transparent;
      }

      .kpi-card:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        border-color: var(--accent-color);
        transform: translateY(-2px);
      }

      .kpi-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .kpi-icon mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        color: var(--accent-color);
      }

      .kpi-content {
        flex: 1;
        min-width: 0;
      }

      .kpi-label {
        font-size: 13px;
        color: #718096;
        display: block;
        margin-bottom: 4px;
      }

      .kpi-value {
        font-size: 28px;
        font-weight: 700;
        color: #1a202c;
        line-height: 1.2;
      }

      .kpi-change {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        margin-top: 8px;
        font-weight: 500;
      }

      .kpi-change mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .kpi-change.increase {
        color: #4caf50;
      }

      .kpi-change.decrease {
        color: #f44336;
      }

      .kpi-change.neutral {
        color: #718096;
      }

      :host-context(.dark-mode) {
        .kpi-card {
          background: #2d3748;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .kpi-label {
          color: #a0aec0;
        }

        .kpi-value {
          color: #f7fafc;
        }
      }
    `,
  ],
})
export class KpiCardComponent {
  @Input() label = '';
  @Input() value: number | string = 0;
  @Input() change?: number;
  @Input() changeType: 'increase' | 'decrease' | 'neutral' = 'neutral';
  @Input() icon = 'analytics';
  @Input() color = '#3f51b5';
  @Input() prefix?: string;
  @Input() suffix?: string;

  get formattedValue(): string {
    if (typeof this.value === 'number') {
      return this.value.toLocaleString();
    }
    return this.value;
  }

  get changeIcon(): string {
    if (this.changeType === 'increase') return 'trending_up';
    if (this.changeType === 'decrease') return 'trending_down';
    return 'trending_flat';
  }

  get changeLabel(): string {
    if (this.change === undefined) return '';
    const sign = this.change > 0 ? '+' : '';
    return `${sign}${this.change}% vs last period`;
  }

  get changeClass(): string {
    return this.changeType;
  }
}
