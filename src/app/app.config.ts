import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { catchError, of } from 'rxjs';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/services/auth.service';

// On boot, if a token exists, restore the user session before the app renders.
function initAuth(auth: AuthService) {
  return () => {
    if (!auth.token) return Promise.resolve();
    return new Promise<void>((resolve) => {
      auth
        .loadSession()
        .pipe(catchError(() => of(null)))
        .subscribe(() => resolve());
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      deps: [AuthService],
      multi: true
    }
  ]
};
