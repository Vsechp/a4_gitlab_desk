import { Component, OnInit, OnDestroy, isDevMode } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, Router, NavigationEnd, NavigationError, NavigationStart, NavigationCancel, RouterStateSnapshot, Event as RouterEvent } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from './services/theme.service';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil, delay } from 'rxjs/operators';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  title = 'GitLab Projects Explorer';
  isDarkMode$: Observable<boolean>;
  isSidebarExpanded = false;
  currentRoute: string = '';

  navItems: NavItem[] = [
    { path: '', icon: 'home', label: 'Главная' },
    { path: 'projects', icon: 'folder', label: 'Проекты' },
    { path: 'statistics', icon: 'bar_chart', label: 'Статистика' },
    { path: 'history', icon: 'history', label: 'История' },
    { path: 'settings', icon: 'settings', label: 'Настройки' }
  ];

  constructor(
    private readonly themeService: ThemeService,
    private router: Router,
    private location: Location
  ) {
    this.isDarkMode$ = this.themeService.isDarkMode$;
    this.setupRouterEvents();
    this.logEnvironmentInfo();
  }

  private logEnvironmentInfo(): void {
    console.group('🔍 Environment Info');
    console.log('Development mode:', isDevMode() ? 'Yes' : 'No');
    console.log('Base HREF:', document.querySelector('base')?.getAttribute('href') || '/');
    console.log('Current URL:', window.location.href);
    console.log('Current Path:', window.location.pathname);
    console.log('Router URL:', this.router.url);
    const snapshot: RouterStateSnapshot = this.router.routerState.snapshot;
    console.log('Router Snapshot URL:', snapshot.url);
    console.log('Active route configuration:', JSON.stringify(snapshot.root.routeConfig));
    console.groupEnd();
  }

  private setupRouterEvents(): void {
    // Log all router events
    this.router.events.pipe(
      takeUntil(this.destroy$)
    ).subscribe((event: RouterEvent) => {
      if (event instanceof NavigationStart) {
        console.log('🚀 Navigation Start:', event.url);
      } else if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
        console.log('✅ Navigation End:', {
          url: event.url,
          urlAfterRedirects: event.urlAfterRedirects,
          id: event.id
        });
        
        // Добавим задержку и еще раз проверим URL после навигации
        setTimeout(() => {
          console.log('⏱️ After navigation check:');
          console.log('  - window.location.pathname:', window.location.pathname);
          console.log('  - router.url:', this.router.url);
          console.log('  - currentRoute:', this.currentRoute);
        }, 100);
      } else if (event instanceof NavigationCancel) {
        console.warn('⚠️ Navigation Cancelled:', {
          url: event.url,
          reason: event.reason
        });
      } else if (event instanceof NavigationError) {
        console.error('❌ Navigation Error:', {
          url: event.url,
          id: event.id,
          error: event.error
        });
      }
    });
  }

  ngOnInit(): void {
    // Add a delay to check if everything was initialized properly
    setTimeout(() => {
      this.logEnvironmentInfo();
    }, 500);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleSidebar(): void {
    this.isSidebarExpanded = !this.isSidebarExpanded;
  }

  trackByPath(_: number, item: NavItem): string {
    return item.path;
  }

  isRouteActive(path: string): boolean {
    const currentPath = this.router.url.split('?')[0];
    return path === '' ? currentPath === '/' : currentPath === '/' + path;
  }

  navigateTo(path: string): void {
    console.log('📱 Manual Navigation to:', path);
    
    // Try both methods for navigation
    const fullPath = path === '' ? '/' : `/${path}`;
    
    // Method 1: Using Router
    this.router.navigate([path], { 
      onSameUrlNavigation: 'reload',
      skipLocationChange: false
    }).then(success => {
      console.log('🔄 Router navigation result:', success);
      
      // If router navigation failed or we're still on the same page after 100ms,
      // try using location service
      setTimeout(() => {
        const currentPath = window.location.pathname;
        if (!success || currentPath !== fullPath) {
          console.log('⚠️ Router navigation did not change URL, trying location service...');
          
          // Method 2: Using Location service
          this.location.go(fullPath);
          console.log('📍 Location changed to:', fullPath);
          
          // If we're still on the same page after another 100ms, force reload
          setTimeout(() => {
            const newPath = window.location.pathname;
            if (newPath !== fullPath) {
              console.log('🔄 Location service did not work, forcing page reload...');
              window.location.href = fullPath;
            }
          }, 100);
        }
      }, 100);
    }).catch(error => {
      console.error('❌ Navigation error:', error);
      
      // Fallback: use window.location
      window.location.href = fullPath;
    });
  }
} 