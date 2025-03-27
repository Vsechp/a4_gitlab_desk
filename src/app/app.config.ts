import { ApplicationConfig } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withDebugTracing,
  withRouterConfig,
  RouteReuseStrategy
} from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { HashLocationStrategy, LocationStrategy, PathLocationStrategy } from '@angular/common';

// Простая стратегия переиспользования маршрутов
export class SimpleRouteReuseStrategy implements RouteReuseStrategy {
  shouldDetach() { return false; }
  store() { }
  shouldAttach() { return false; }
  retrieve() { return null; }
  shouldReuseRoute() { return false; } // Всегда создаем новый компонент
}

export const appConfig: ApplicationConfig = {
  providers: [
    // { provide: LocationStrategy, useClass: HashLocationStrategy }, // Раскомментировать для использования хэш-навигации
    provideRouter(
      routes,
      withComponentInputBinding(),
      withDebugTracing(), // Включаем отладочное логирование для маршрутизации
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
        onSameUrlNavigation: 'reload',
        urlUpdateStrategy: 'eager'
        // enableTracing доступен только через глобальную конфигурацию
      })
    ),
    { provide: RouteReuseStrategy, useClass: SimpleRouteReuseStrategy }, // Отключаем переиспользование компонентов
    provideAnimations(),
    provideHttpClient(withFetch()),
    provideClientHydration()
  ]
};