import { Injectable, inject, signal, Injector } from '@angular/core';
import { ToasterService } from './toaster.service';

export interface UpdateInfo {
  available: boolean;
  version: string;
  size: string;
}

declare module '@angular/core' {
  interface InjectorOptions {
    optional?: boolean;
  }
}

@Injectable({ providedIn: 'root' })
export class PwaService {
  private toaster: ToasterService | null = null;

  readonly isOnline = signal(typeof navigator !== 'undefined' ? navigator.onLine : true);
  readonly updateAvailable = signal(false);
  readonly updateInfo = signal<UpdateInfo | null>(null);

  private swUpdate: any = null;
  private initialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init(): void {
    this.setupConnectivityListeners();
    this.setupSwUpdate();
  }

  private setupConnectivityListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline.set(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline.set(false);
    });
  }

  private setupSwUpdate(): void {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      import('@angular/service-worker')
        .then(({ SwUpdate }) => {
          const injector = (window as any).ng?.getInjector?.();
          if (injector) {
            this.toaster = injector.get(ToasterService);
          }

          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((registration: any) => {
              if (registration.active) {
                registration.active.postMessage({ type: 'GET_VERSION' });
              }
            });

            navigator.serviceWorker.addEventListener('message', (event) => {
              if (event.data?.type === 'VERSION_INFO') {
                this.updateInfo.set({
                  available: true,
                  version: event.data.version,
                  size: event.data.size || 'Unknown',
                });
                this.updateAvailable.set(true);
              }
            });
          }
        })
        .catch(() => {
          console.log('Service worker module not available');
        });
    }
  }

  checkForUpdates(): void {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATE' });
    }
  }

  applyUpdate(): void {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'APPLY_UPDATE' });
    }
  }

  installPrompt(): Promise<'accepted' | 'declined' | 'unavailable'> {
    return new Promise((resolve) => {
      if (!('BeforeInstallPromptEvent' in window)) {
        resolve('unavailable');
        return;
      }

      const handler = (e: Event) => {
        e.preventDefault();
        const promptEvent = e as BeforeInstallPromptEvent;

        promptEvent
          .prompt()
          .then(() => {
            resolve('accepted');
          })
          .catch(() => {
            resolve('declined');
          })
          .finally(() => {
            window.removeEventListener('beforeinstallprompt', handler);
          });
      };

      window.addEventListener('beforeinstallprompt', handler);
      setTimeout(() => {
        window.removeEventListener('beforeinstallprompt', handler);
        resolve('unavailable');
      }, 3000);
    });
  }

  getNetworkStatus(): 'online' | 'offline' {
    return typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline';
  }

  downloadProgress(): number {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.downloadSpeed || 0;
    }
    return 0;
  }

  clearCache(): void {
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
  }
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}
