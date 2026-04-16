import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonType =
  | 'text'
  | 'circular'
  | 'rectangular'
  | 'card'
  | 'table-row'
  | 'avatar'
  | 'button';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (type) {
      @case ('text') {
        <div
          class="skeleton skeleton-text"
          [style.width]="width"
          [style.height]="height || '16px'"
        ></div>
      }
      @case ('circular') {
        <div
          class="skeleton skeleton-circular"
          [style.width]="width || size"
          [style.height]="height || size"
        ></div>
      }
      @case ('rectangular') {
        <div
          class="skeleton skeleton-rectangular"
          [style.width]="width"
          [style.height]="height || '100px'"
        ></div>
      }
      @case ('card') {
        <div class="skeleton-card">
          <div class="skeleton skeleton-header"></div>
          <div class="skeleton skeleton-body">
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text" style="width: 80%"></div>
            <div class="skeleton skeleton-text" style="width: 60%"></div>
          </div>
        </div>
      }
      @case ('table-row') {
        <div class="skeleton-table-row">
          @if (showCheckbox) {
            <div class="skeleton skeleton-checkbox"></div>
          }
          @for (col of columns; track $index) {
            <div class="skeleton skeleton-cell" [style.width]="col"></div>
          }
        </div>
      }
      @case ('avatar') {
        <div class="skeleton-avatar">
          <div class="skeleton skeleton-circular" style="width: 40px; height: 40px"></div>
          <div class="skeleton-avatar-info">
            <div class="skeleton skeleton-text" style="width: 120px"></div>
            <div class="skeleton skeleton-text" style="width: 80px; height: 12px"></div>
          </div>
        </div>
      }
      @case ('button') {
        <div
          class="skeleton skeleton-button"
          [style.width]="width || '100px'"
          [style.height]="height || '36px'"
        ></div>
      }
      @default {
        <div class="skeleton" [style.width]="width" [style.height]="height"></div>
      }
    }
  `,
  styles: [
    `
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: 4px;
      }

      .skeleton-text {
        border-radius: 4px;
      }

      .skeleton-circular {
        border-radius: 50%;
      }

      .skeleton-rectangular {
        border-radius: 8px;
      }

      .skeleton-card {
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .skeleton-card .skeleton-header {
        height: 120px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
      }

      .skeleton-card .skeleton-body {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .skeleton-table-row {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 16px;
        border-bottom: 1px solid var(--border-color, #e0e0e0);
      }

      .skeleton-checkbox {
        width: 40px;
        height: 20px;
      }

      .skeleton-cell {
        height: 20px;
        flex: 1;
      }

      .skeleton-avatar {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .skeleton-avatar-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .skeleton-button {
        border-radius: 4px;
      }

      @keyframes skeleton-loading {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
    `,
  ],
})
export class LoadingSkeletonComponent {
  @Input() type: SkeletonType = 'text';
  @Input() width?: string;
  @Input() height?: string;
  @Input() size = '40px';
  @Input() columns: string[] = ['100px', '150px', '100px', '80px'];
  @Input() showCheckbox = false;
}
