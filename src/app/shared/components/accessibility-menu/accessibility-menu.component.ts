import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AccessibilityService } from '../../../core/services/accessibility.service';

@Component({
  selector: 'app-accessibility-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      mat-icon-button
      [matMenuTriggerFor]="a11yMenu"
      matTooltip="Accessibility settings"
      aria-label="Open accessibility menu"
    >
      <mat-icon>accessibility_new</mat-icon>
    </button>

    <mat-menu #a11yMenu="matMenu">
      <div class="a11y-menu-header">Accessibility</div>

      <button mat-menu-item (click)="toggleHighContrast()">
        <mat-icon>{{
          a11yService.isHighContrast() ? 'check_box' : 'check_box_outline_blank'
        }}</mat-icon>
        <span>High Contrast</span>
      </button>

      <button mat-menu-item (click)="toggleReduceMotion()">
        <mat-icon>{{
          a11yService.isReduceMotion() ? 'check_box' : 'check_box_outline_blank'
        }}</mat-icon>
        <span>Reduce Motion</span>
      </button>

      <button mat-menu-item (click)="toggleLargeText()">
        <mat-icon>{{
          a11yService.isLargeText() ? 'check_box' : 'check_box_outline_blank'
        }}</mat-icon>
        <span>Large Text</span>
      </button>

      <mat-divider></mat-divider>

      <button mat-menu-item (click)="resetSettings()">
        <mat-icon>refresh</mat-icon>
        <span>Reset to Defaults</span>
      </button>
    </mat-menu>
  `,
  styles: [
    `
      .a11y-menu-header {
        padding: 8px 16px;
        font-size: 12px;
        color: var(--text-secondary, #757575);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      button[mat-menu-item] {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      mat-icon {
        color: var(--text-secondary, #757575);
      }

      button[mat-menu-item] mat-icon:first-child {
        color: var(--primary-color, #3f51b5);
      }
    `,
  ],
})
export class AccessibilityMenuComponent {
  a11yService = inject(AccessibilityService);

  toggleHighContrast(): void {
    this.a11yService.toggleHighContrast();
  }

  toggleReduceMotion(): void {
    this.a11yService.toggleReduceMotion();
  }

  toggleLargeText(): void {
    this.a11yService.toggleLargeText();
  }

  resetSettings(): void {
    this.a11yService.resetConfig();
  }
}
