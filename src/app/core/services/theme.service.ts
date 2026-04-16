import { Injectable, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeConfig {
  primary: string;
  accent: string;
  warn: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  private readonly storageKey = 'hrm_theme';
  private readonly mediaQuery = '(prefers-color-scheme: dark)';

  readonly userPreference = signal<Theme>(this.loadPreference());
  readonly resolvedTheme = signal<ResolvedTheme>(this.getSystemTheme());

  readonly isDark = computed(() => this.resolvedTheme() === 'dark');
  readonly isLight = computed(() => this.resolvedTheme() === 'light');

  private mediaQueryList: MediaQueryList | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.init();
    }
  }

  private init(): void {
    this.setupMediaQuery();
    this.updateResolvedTheme();
    this.applyTheme();

    effect(() => {
      this.applyTheme();
    });
  }

  private loadPreference(): Theme {
    if (typeof localStorage === 'undefined') return 'system';

    const stored = localStorage.getItem(this.storageKey);
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as Theme;
    }
    return 'system';
  }

  private getSystemTheme(): ResolvedTheme {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia(this.mediaQuery).matches ? 'dark' : 'light';
  }

  private setupMediaQuery(): void {
    if (typeof window === 'undefined') return;

    this.mediaQueryList = window.matchMedia(this.mediaQuery);

    this.mediaQueryList.addEventListener('change', (e) => {
      if (this.userPreference() === 'system') {
        this.resolvedTheme.set(e.matches ? 'dark' : 'light');
        this.applyTheme();
      }
    });
  }

  private updateResolvedTheme(): void {
    const preference = this.userPreference();
    if (preference === 'system') {
      this.resolvedTheme.set(this.getSystemTheme());
    } else {
      this.resolvedTheme.set(preference);
    }
  }

  setTheme(theme: Theme): void {
    this.userPreference.set(theme);
    localStorage.setItem(this.storageKey, theme);
    this.updateResolvedTheme();
  }

  toggleTheme(): void {
    const current = this.resolvedTheme();
    this.setTheme(current === 'dark' ? 'light' : 'dark');
  }

  private applyTheme(): void {
    if (typeof this.document === 'undefined') return;

    const theme = this.resolvedTheme();
    const html = this.document.documentElement;

    html.setAttribute('data-theme', theme);

    if (theme === 'dark') {
      html.classList.add('dark-theme');
      html.classList.remove('light-theme');
    } else {
      html.classList.add('light-theme');
      html.classList.remove('dark-theme');
    }

    const metaTheme = this.document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#121212' : '#3f51b5');
    }
  }

  getThemeConfig(): ThemeConfig {
    const isDark = this.isDark();

    return {
      primary: '#3f51b5',
      accent: '#ff4081',
      warn: '#f44336',
      background: isDark ? '#121212' : '#fafafa',
      surface: isDark ? '#1e1e1e' : '#ffffff',
      text: isDark ? '#ffffff' : '#212121',
      textSecondary: isDark ? '#b0b0b0' : '#757575',
      border: isDark ? '#333333' : '#e0e0e0',
    };
  }
}
