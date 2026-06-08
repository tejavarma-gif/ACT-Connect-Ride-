import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';
const KEY = 'cr_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme = signal<Theme>('light');

  /** Read saved theme (defaults to light) and apply it. Call once on app start. */
  init() {
    let saved: Theme = 'light';
    try {
      const v = localStorage.getItem(KEY);
      if (v === 'dark' || v === 'light') saved = v;
    } catch {}
    this.set(saved);
  }

  set(t: Theme) {
    this.theme.set(t);
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark', t === 'dark');
    }
    try {
      localStorage.setItem(KEY, t);
    } catch {}
  }

  toggle() {
    this.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  isDark() {
    return this.theme() === 'dark';
  }
}
