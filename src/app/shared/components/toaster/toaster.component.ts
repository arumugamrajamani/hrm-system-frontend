import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToasterService } from '../../../core/services';

@Component({
  selector: 'app-toaster',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-container">
      @for (toast of toasterService.toasts(); track toast.id) {
        <div class="toast-item" [class]="'toast-' + toast.type">
          <div class="toast-icon">
            <i class="fas" [class]="toast.icon || getDefaultIcon(toast.type)"></i>
          </div>
          <div class="toast-content">
            <div class="toast-title">{{ toast.title }}</div>
            @if (toast.message) {
              <div class="toast-message">{{ toast.message }}</div>
            }
          </div>
          <button class="toast-close" (click)="dismiss(toast.id)">
            <i class="fas fa-times"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
      }

      .toast-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        border-radius: 8px;
        background: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease-out;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .toast-icon {
        font-size: 20px;
        margin-top: 2px;
      }

      .toast-success .toast-icon {
        color: #28a745;
      }
      .toast-error .toast-icon {
        color: #dc3545;
      }
      .toast-warning .toast-icon {
        color: #fd7e14;
      }
      .toast-info .toast-icon {
        color: #17a2b8;
      }

      .toast-success {
        border-left: 4px solid #28a745;
      }
      .toast-error {
        border-left: 4px solid #dc3545;
      }
      .toast-warning {
        border-left: 4px solid #fd7e14;
      }
      .toast-info {
        border-left: 4px solid #17a2b8;
      }

      .toast-content {
        flex: 1;
      }

      .toast-title {
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
      }

      .toast-message {
        font-size: 14px;
        color: #666;
      }

      .toast-close {
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        padding: 0;
        font-size: 16px;
        transition: color 0.2s;
      }

      .toast-close:hover {
        color: #333;
      }
    `,
  ],
})
export class ToasterComponent {
  toasterService = inject(ToasterService);

  dismiss(id: string): void {
    this.toasterService.remove(id);
  }

  getDefaultIcon(type: string): string {
    const icons: Record<string, string> = {
      success: 'fa-check-circle',
      error: 'fa-times-circle',
      warning: 'fa-exclamation-circle',
      info: 'fa-info-circle',
    };
    return icons[type] || 'fa-info-circle';
  }
}
