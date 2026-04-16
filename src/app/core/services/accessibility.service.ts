import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface A11yConfig {
  highContrast: boolean;
  reduceMotion: boolean;
  largeText: boolean;
  keyboardOnly: boolean;
  screenReaderOptimized: boolean;
}

@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'hrm_a11y';

  readonly config = signal<A11yConfig>(this.loadConfig());

  readonly isHighContrast = () => this.config().highContrast;
  readonly isReduceMotion = () => this.config().reduceMotion;
  readonly isLargeText = () => this.config().largeText;
  readonly isKeyboardOnly = () => this.config().keyboardOnly;

  private focusTrapElements: HTMLElement[] = [];

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.init();
    }
  }

  private init(): void {
    this.setupReducedMotion();
    this.setupHighContrast();
    this.applyConfig();
  }

  private loadConfig(): A11yConfig {
    const defaults: A11yConfig = {
      highContrast: false,
      reduceMotion: this.prefersReducedMotion(),
      largeText: false,
      keyboardOnly: false,
      screenReaderOptimized: false,
    };

    if (typeof localStorage === 'undefined') return defaults;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return { ...defaults, ...JSON.parse(stored) };
      }
    } catch {
      return defaults;
    }

    return defaults;
  }

  private saveConfig(config: A11yConfig): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.storageKey, JSON.stringify(config));
  }

  private prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private setupReducedMotion(): void {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', (e) => {
      if (e.matches) {
        this.enableReduceMotion();
      } else {
        this.disableReduceMotion();
      }
    });
  }

  private setupHighContrast(): void {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    mediaQuery.addEventListener('change', (e) => {
      if (e.matches) {
        this.enableHighContrast();
      }
    });
  }

  private applyConfig(): void {
    this.applyHighContrast();
    this.applyReduceMotion();
    this.applyLargeText();
  }

  updateConfig(updates: Partial<A11yConfig>): void {
    const newConfig = { ...this.config(), ...updates };
    this.config.set(newConfig);
    this.saveConfig(newConfig);
    this.applyConfig();
  }

  enableHighContrast(): void {
    this.updateConfig({ highContrast: true });
  }

  disableHighContrast(): void {
    this.updateConfig({ highContrast: false });
  }

  toggleHighContrast(): void {
    this.updateConfig({ highContrast: !this.config().highContrast });
  }

  enableReduceMotion(): void {
    this.updateConfig({ reduceMotion: true });
  }

  disableReduceMotion(): void {
    this.updateConfig({ reduceMotion: false });
  }

  toggleReduceMotion(): void {
    this.updateConfig({ reduceMotion: !this.config().reduceMotion });
  }

  enableLargeText(): void {
    this.updateConfig({ largeText: true });
  }

  disableLargeText(): void {
    this.updateConfig({ largeText: false });
  }

  toggleLargeText(): void {
    this.updateConfig({ largeText: !this.config().largeText });
  }

  enableKeyboardOnly(): void {
    this.updateConfig({ keyboardOnly: true });
  }

  disableKeyboardOnly(): void {
    this.updateConfig({ keyboardOnly: false });
  }

  private applyHighContrast(): void {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;

    if (this.config().highContrast) {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }
  }

  private applyReduceMotion(): void {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;

    if (this.config().reduceMotion) {
      html.classList.add('reduce-motion');
      html.style.setProperty('--transition-fast', '0ms');
      html.style.setProperty('--transition-normal', '0ms');
      html.style.setProperty('--transition-slow', '0ms');
    } else {
      html.classList.remove('reduce-motion');
      html.style.setProperty('--transition-fast', '0.15s ease');
      html.style.setProperty('--transition-normal', '0.25s ease');
      html.style.setProperty('--transition-slow', '0.35s ease');
    }
  }

  private applyLargeText(): void {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;

    if (this.config().largeText) {
      html.classList.add('large-text');
      html.style.fontSize = '18px';
    } else {
      html.classList.remove('large-text');
      html.style.fontSize = '16px';
    }
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (typeof document === 'undefined') return;

    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.setAttribute('class', 'sr-only');
    announcer.style.position = 'absolute';
    announcer.style.left = '-9999px';

    document.body.appendChild(announcer);

    setTimeout(() => {
      announcer.textContent = message;
    }, 100);

    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }

  trapFocus(element: HTMLElement): void {
    this.focusTrapElements.push(element);
  }

  releaseFocus(element: HTMLElement): void {
    const index = this.focusTrapElements.indexOf(element);
    if (index > -1) {
      this.focusTrapElements.splice(index, 1);
    }
  }

  getFirstFocusable(element: HTMLElement): HTMLElement | null {
    const focusable = element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    return focusable[0] || null;
  }

  getLastFocusable(element: HTMLElement): HTMLElement | null {
    const focusable = element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    return focusable[focusable.length - 1] || null;
  }

  setupSkipLink(): void {
    if (typeof document === 'undefined') return;

    const skipLink = document.querySelector<HTMLAnchorElement>('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector<HTMLElement>(
          skipLink.getAttribute('href') || '#main-content',
        );
        if (target) {
          target.setAttribute('tabindex', '-1');
          target.focus();
        }
      });
    }
  }

  resetConfig(): void {
    const defaults: A11yConfig = {
      highContrast: false,
      reduceMotion: this.prefersReducedMotion(),
      largeText: false,
      keyboardOnly: false,
      screenReaderOptimized: false,
    };
    this.config.set(defaults);
    this.saveConfig(defaults);
    this.applyConfig();
  }
}
