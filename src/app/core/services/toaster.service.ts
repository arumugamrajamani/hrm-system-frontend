import { Injectable, signal } from '@angular/core';
import { Toast } from '../models';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {
  private toastsSignal = signal<Toast[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  private defaultDuration = 6000;

  show(toast: Omit<Toast, 'id'>): void {
    const newToast: Toast = {
      ...toast,
      id: this.generateId(),
      duration: toast.duration || this.defaultDuration
    };

    this.toastsSignal.update(toasts => [...toasts, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => this.remove(newToast.id), newToast.duration);
    }
  }

  success(title: string, message: string = ''): void {
    this.show({ type: 'success', title, message, icon: 'fa-check-circle' });
  }

  error(title: string, message: string = ''): void {
    this.show({ type: 'error', title, message, icon: 'fa-times-circle' });
  }

  warning(title: string, message: string = ''): void {
    this.show({ type: 'warning', title, message, icon: 'fa-exclamation-circle' });
  }

  info(title: string, message: string = ''): void {
    this.show({ type: 'info', title, message, icon: 'fa-info-circle' });
  }

  remove(id: string): void {
    this.toastsSignal.update(toasts => toasts.filter(t => t.id !== id));
  }

  clear(): void {
    this.toastsSignal.set([]);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
