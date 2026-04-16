import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="confirm-dialog" [class]="'type-' + (data.type || 'warning')">
      <div class="dialog-header">
        @if (data.icon) {
          <mat-icon class="dialog-icon">{{ data.icon }}</mat-icon>
        } @else {
          <mat-icon class="dialog-icon">{{ iconMap[data.type || 'warning'] }}</mat-icon>
        }
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>

      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button mat-flat-button [color]="buttonColor" (click)="onConfirm()">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .confirm-dialog {
        padding: 8px;
        min-width: 320px;
      }

      .dialog-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }

      .dialog-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      mat-dialog-content p {
        margin: 0;
        color: var(--text-secondary, #757575);
        font-size: 14px;
        line-height: 1.5;
      }

      mat-dialog-actions {
        margin-top: 24px;
        padding: 0;
        gap: 8px;
      }

      .type-warning .dialog-icon {
        color: #ff9800;
      }
      .type-danger .dialog-icon {
        color: #f44336;
      }
      .type-info .dialog-icon {
        color: #2196f3;
      }
      .type-success .dialog-icon {
        color: #4caf50;
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  iconMap: Record<string, string> = {
    warning: 'warning',
    danger: 'error',
    info: 'info',
    success: 'check_circle',
  };

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
  ) {}

  get buttonColor(): string {
    const typeMap: Record<string, string> = {
      warning: 'warn',
      danger: 'accent',
      info: 'primary',
      success: 'primary',
    };
    return typeMap[this.data.type || 'warning'];
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
