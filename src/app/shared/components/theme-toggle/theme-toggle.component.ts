import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService, Theme } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      mat-icon-button
      [matMenuTriggerFor]="themeMenu"
      matTooltip="Change theme"
      [attr.aria-label]="'Current theme: ' + themeService.resolvedTheme()"
    >
      @if (themeService.isDark()) {
        <mat-icon>dark_mode</mat-icon>
      } @else {
        <mat-icon>light_mode</mat-icon>
      }
    </button>

    <mat-menu #themeMenu="matMenu">
      <div class="theme-menu-header">Theme</div>
      <button
        mat-menu-item
        (click)="setTheme('light')"
        [class.active]="themeService.userPreference() === 'light'"
      >
        <mat-icon>light_mode</mat-icon>
        <span>Light</span>
        @if (themeService.userPreference() === 'light') {
          <mat-icon class="check-icon">check</mat-icon>
        }
      </button>
      <button
        mat-menu-item
        (click)="setTheme('dark')"
        [class.active]="themeService.userPreference() === 'dark'"
      >
        <mat-icon>dark_mode</mat-icon>
        <span>Dark</span>
        @if (themeService.userPreference() === 'dark') {
          <mat-icon class="check-icon">check</mat-icon>
        }
      </button>
      <button
        mat-menu-item
        (click)="setTheme('system')"
        [class.active]="themeService.userPreference() === 'system'"
      >
        <mat-icon>settings_suggest</mat-icon>
        <span>System</span>
        @if (themeService.userPreference() === 'system') {
          <mat-icon class="check-icon">check</mat-icon>
        }
      </button>
    </mat-menu>
  `,
  styles: [
    `
      .theme-menu-header {
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

      button[mat-menu-item] span {
        flex: 1;
      }

      .check-icon {
        margin-left: auto;
        color: var(--primary-color, #3f51b5);
      }

      button[mat-menu-item].active {
        background: var(--hover-bg, rgba(0, 0, 0, 0.04));
      }

      mat-icon {
        color: var(--text-secondary, #757575);
      }

      button[mat-menu-item].active mat-icon:not(.check-icon) {
        color: var(--primary-color, #3f51b5);
      }
    `,
  ],
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }
}
