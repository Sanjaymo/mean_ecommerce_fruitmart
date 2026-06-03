import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'fm-theme';
  private readonly theme = signal<ThemeMode>('light');

  readonly mode = this.theme.asReadonly();
  readonly isDark = computed(() => this.theme() === 'dark');

  init() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Force the application to light mode only. Ignore stored preference
    // and system color-scheme to ensure a consistent single-mode UI.
    this.applyTheme('light', false);
  }

  toggle() {
    // No-op: theme toggling is disabled, app is always light.
  }

  setTheme(theme: ThemeMode) {
    // Disabled: keep theme fixed to light.
  }

  private applyTheme(theme: ThemeMode, persist: boolean) {
    this.theme.set(theme);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const root = document.documentElement;
    root.dataset['theme'] = theme;
    root.style.colorScheme = theme;

    if (persist) {
      window.localStorage.setItem(this.storageKey, theme);
    }
  }
}