import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../core/services';

@Component({
  selector: 'app-modal',
  standalone: false,
  template: `
    @if (modalService.isOpen()) {
      <div class="modal-backdrop" (click)="onBackdropClick()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-content">
            <div class="modal-header" [class]="'modal-header-' + getModalType()">
              <div class="modal-icon">
                <i class="fas" [class]="getIcon()"></i>
              </div>
              <h5 class="modal-title">{{ modalService.modalConfig()?.title }}</h5>
              <button type="button" class="btn-close" (click)="onCancel()">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <p>{{ modalService.modalConfig()?.message }}</p>
            </div>
            <div class="modal-footer">
              @if (modalService.modalConfig()?.showCancel) {
                <button
                  type="button"
                  class="btn btn-secondary"
                  (click)="onCancel()">
                  {{ modalService.modalConfig()?.cancelText || 'Cancel' }}
                </button>
              }
              <button
                type="button"
                class="btn"
                [class]="'btn-' + getConfirmClass()"
                (click)="onConfirm()">
                {{ modalService.modalConfig()?.confirmText || 'OK' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-dialog {
      max-width: 500px;
      width: 90%;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-content {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    .modal-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }

    .modal-header-success { background: #d4edda; border-bottom-color: #c3e6cb; }
    .modal-header-error { background: #f8d7da; border-bottom-color: #f5c6cb; }
    .modal-header-warning { background: #fff3cd; border-bottom-color: #ffeeba; }
    .modal-header-info { background: #d1ecf1; border-bottom-color: #bee5eb; }
    .modal-header-confirm { background: #e2e3e5; border-bottom-color: #d6d8db; }

    .modal-icon {
      font-size: 24px;
    }

    .modal-header-success .modal-icon { color: #155724; }
    .modal-header-error .modal-icon { color: #721c24; }
    .modal-header-warning .modal-icon { color: #856404; }
    .modal-header-info .modal-icon { color: #0c5460; }
    .modal-header-confirm .modal-icon { color: #383d41; }

    .modal-title {
      flex: 1;
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 20px;
      color: #666;
      cursor: pointer;
      padding: 0;
    }

    .btn-close:hover {
      color: #333;
    }

    .modal-body {
      padding: 24px 20px;
      color: #495057;
      line-height: 1.6;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 20px;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
    }

    .btn-success { background: #28a745; border-color: #28a745; color: white; }
    .btn-error { background: #dc3545; border-color: #dc3545; color: white; }
    .btn-warning { background: #fd7e14; border-color: #fd7e14; color: white; }
    .btn-info { background: #17a2b8; border-color: #17a2b8; color: white; }
    .btn-secondary { background: #6c757d; border-color: #6c757d; color: white; }

    .btn:hover {
      opacity: 0.9;
    }
  `]
})
export class ModalComponent {
  modalService = inject(ModalService);

  getModalType(): string {
    return this.modalService.modalConfig()?.type || 'info';
  }

  getIcon(): string {
    const icons: Record<string, string> = {
      success: 'fa-check-circle',
      error: 'fa-times-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle',
      confirm: 'fa-question-circle'
    };
    return icons[this.getModalType()] || 'fa-info-circle';
  }

  getConfirmClass(): string {
    const type = this.getModalType();
    return type === 'confirm' ? 'primary' : type;
  }

  onBackdropClick(): void {
    const config = this.modalService.modalConfig();
    if (config?.type === 'confirm' || config?.showCancel) {
      this.onCancel();
    }
  }

  onConfirm(): void {
    this.modalService.close(true);
  }

  onCancel(): void {
    this.modalService.close(false);
  }
}
