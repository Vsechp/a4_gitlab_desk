import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.darkMode.asObservable();

  constructor() {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.toggleTheme(true);
    }

    // Watch for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      this.toggleTheme(e.matches);
    });

    // Check localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.toggleTheme(savedTheme === 'dark');
    }
  }

  toggleTheme(isDark?: boolean) {
    const dark = isDark ?? !this.darkMode.value;
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    this.darkMode.next(dark);
  }
} 