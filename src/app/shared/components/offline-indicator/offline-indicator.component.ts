import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PwaService } from '../../../core/services/pwa.service';

@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!pwaService.isOnline()) {
      <div class="offline-banner">
        <mat-icon>wifi_off</mat-icon>
        <span>You are offline. Some features may not work.</span>
        <button mat-button (click)="retry()">
          <mat-icon>refresh</mat-icon>
          Retry
        </button>
      </div>
    }

    @if (pwaService.updateAvailable()) {
      <div class="update-banner">
        <mat-icon>system_update</mat-icon>
        <span>A new version is available!</span>
        <button mat-flat-button color="primary" (click)="pwaService.applyUpdate()">
          Update Now
        </button>
      </div>
    }
  `,
  styles: [
    `
      .offline-banner,
      .update-banner {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 9999;
        font-size: 14px;
      }

      .offline-banner {
        background: #ff9800;
        color: white;
      }

      .update-banner {
        background: #4caf50;
        color: white;
      }

      mat-icon {
        flex-shrink: 0;
      }

      span {
        flex: 1;
      }

      button {
        flex-shrink: 0;
      }
    `,
  ],
})
export class OfflineIndicatorComponent {
  pwaService = inject(PwaService);

  retry(): void {
    window.location.reload();
  }
}
