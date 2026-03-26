import { Injectable, signal } from '@angular/core';
import { ModalConfig } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalConfigSignal = signal<ModalConfig | null>(null);
  private isOpenSignal = signal<boolean>(false);
  private resolveSignal = signal<((result: boolean) => void) | null>(null);

  readonly modalConfig = this.modalConfigSignal.asReadonly();
  readonly isOpen = this.isOpenSignal.asReadonly();

  open(config: ModalConfig): Promise<boolean> {
    return new Promise((resolve) => {
      this.resolveSignal.set(resolve);
      this.modalConfigSignal.set(config);
      this.isOpenSignal.set(true);

      if (config.autoClose) {
        setTimeout(() => this.close(), config.autoClose);
      }
    });
  }

  close(result: boolean = false): void {
    const resolve = this.resolveSignal();
    if (resolve) {
      resolve(result);
    }
    this.isOpenSignal.set(false);
    this.modalConfigSignal.set(null);
    this.resolveSignal.set(null);
  }

  confirm(title: string, message: string, autoClose: number = 15000): Promise<boolean> {
    return this.open({
      title,
      message,
      type: 'confirm',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      showCancel: true,
      autoClose
    });
  }

  showError(title: string, message: string): Promise<boolean> {
    return this.open({
      title,
      message,
      type: 'error',
      confirmText: 'OK',
      showCancel: false,
      autoClose: 15000
    });
  }

  showSuccess(title: string, message: string): Promise<boolean> {
    return this.open({
      title,
      message,
      type: 'success',
      confirmText: 'OK',
      showCancel: false,
      autoClose: 15000
    });
  }
}
