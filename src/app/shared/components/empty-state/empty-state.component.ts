import {
  Component,
  Input,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state" [class.compact]="compact">
      @if (customTemplate) {
        <ng-content></ng-content>
      } @else {
        <div class="empty-icon">
          @if (icon) {
            <mat-icon>{{ icon }}</mat-icon>
          } @else {
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="50" fill="#f5f5f5" />
              <path
                d="M45 50h30M45 60h20M45 70h25"
                stroke="#bdbdbd"
                stroke-width="3"
                stroke-linecap="round"
              />
            </svg>
          }
        </div>

        <h3 class="empty-title">{{ title }}</h3>
        <p class="empty-message">{{ message }}</p>

        @if (actionLabel) {
          <button mat-flat-button color="primary" (click)="onAction()">
            @if (actionIcon) {
              <mat-icon>{{ actionIcon }}</mat-icon>
            }
            {{ actionLabel }}
          </button>
        }
      }
    </div>
  `,
  styles: [
    `
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px 24px;
        text-align: center;
        min-height: 300px;
      }

      .empty-state.compact {
        padding: 24px;
        min-height: auto;
      }

      .empty-icon {
        margin-bottom: 24px;
      }

      .empty-icon mat-icon {
        font-size: 80px;
        width: 80px;
        height: 80px;
        color: #bdbdbd;
      }

      .empty-title {
        margin: 0 0 8px;
        font-size: 20px;
        font-weight: 600;
        color: var(--text-primary, #212121);
      }

      .empty-message {
        margin: 0 0 24px;
        font-size: 14px;
        color: var(--text-secondary, #757575);
        max-width: 400px;
      }

      button mat-icon {
        margin-right: 8px;
      }

      .compact .empty-icon {
        margin-bottom: 16px;
      }

      .compact .empty-icon mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }

      .compact .empty-title {
        font-size: 16px;
      }

      .compact .empty-message {
        font-size: 13px;
        margin-bottom: 16px;
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() icon?: string;
  @Input() title = 'No Data Found';
  @Input() message = 'There are no items to display at the moment.';
  @Input() actionLabel?: string;
  @Input() actionIcon?: string;
  @Input() compact = false;
  @Input() customTemplate = false;

  @Output() action = new EventEmitter<void>();

  onAction(): void {
    this.action.emit();
  }
}
