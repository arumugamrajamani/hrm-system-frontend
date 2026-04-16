import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

export interface BulkActionItem {
  id: string;
  label: string;
  icon?: string;
  color?: 'primary' | 'accent' | 'warn';
  disabled?: boolean;
}

@Component({
  selector: 'app-bulk-actions-bar',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatChipsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (selectedCount > 0) {
      <div class="bulk-actions-bar" [@slideIn]>
        <div class="selection-info">
          <mat-icon>check_circle</mat-icon>
          <span>{{ selectedCount }} {{ itemLabel }} selected</span>
        </div>

        @if (showSelectInfo && totalCount) {
          <mat-chip> {{ selectedCount }} of {{ totalCount }} </mat-chip>
        }

        <div class="actions">
          @for (action of actions; track action.id) {
            <button
              mat-flat-button
              [color]="action.color || 'primary'"
              [disabled]="action.disabled"
              (click)="onAction(action)"
            >
              @if (action.icon) {
                <mat-icon>{{ action.icon }}</mat-icon>
              }
              {{ action.label }}
            </button>
          }
        </div>

        @if (showClearButton) {
          <button mat-icon-button (click)="onClear()" matTooltip="Clear selection">
            <mat-icon>close</mat-icon>
          </button>
        }
      </div>
    }
  `,
  styles: [
    `
      .bulk-actions-bar {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 16px;
        background: var(--primary-color, #3f51b5);
        color: white;
        border-radius: 8px;
        animation: slideIn 0.2s ease-out;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .selection-info {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
      }

      .actions {
        display: flex;
        gap: 8px;
        margin-left: auto;
      }

      .actions button {
        color: white;
      }

      .actions button[mat-icon-button] {
        color: white;
      }

      mat-chip {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      ::ng-deep .bulk-actions-bar .mat-mdc-button.mat-primary {
        --mdc-filled-button-container-color: rgba(255, 255, 255, 0.2);
      }
    `,
  ],
})
export class BulkActionsBarComponent {
  @Input() selectedCount = 0;
  @Input() totalCount = 0;
  @Input() itemLabel = 'items';
  @Input() actions: BulkActionItem[] = [];
  @Input() showClearButton = true;
  @Input() showSelectInfo = false;

  @Output() action = new EventEmitter<BulkActionItem>();
  @Output() clear = new EventEmitter<void>();

  onAction(action: BulkActionItem): void {
    this.action.emit(action);
  }

  onClear(): void {
    this.clear.emit();
  }
}
