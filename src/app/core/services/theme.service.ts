import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'cms_theme_mode';
  
  // Theme state signal
  readonly currentTheme = signal<ThemeMode>(this.getInitialTheme());

  constructor() {
    // Synchronously apply initial theme to avoid flash
    this.applyTheme(this.currentTheme());

    // Listen to OS preference changes if no manual override is stored
    if (typeof window !== 'undefined' && window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  private getInitialTheme(): ThemeMode {
    if (typeof window === 'undefined') return 'light';

    const saved = localStorage.getItem(this.STORAGE_KEY) as ThemeMode | null;
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }

    // Default theme is strictly Light as required
    return 'light';
  }

  toggleTheme(): void {
    const nextTheme: ThemeMode = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(nextTheme);
  }

  setTheme(theme: ThemeMode): void {
    this.currentTheme.set(theme);
    this.applyTheme(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, theme);
      // Dispatch custom window event for Chart.js or other subscribers
      window.dispatchEvent(new CustomEvent('cms-theme-changed', { detail: { theme } }));
    }
  }

  private applyTheme(theme: ThemeMode): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }
}
