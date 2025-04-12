import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withViewTransitions } from '@angular/router';
import { JwtModule } from '@auth0/angular-jwt';
import { providePrimeNG } from 'primeng/config';
import { environment } from '../environments/environment.development';
import Aura from '@primeng/themes/aura';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';

export function tokenGetter() {
  return localStorage.getItem('access_token');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: tokenGetter,
          allowedDomains: [environment.api.baseUrl],
          disallowedRoutes: [
            `${environment.api.baseUrl}/api/v1/auth/login`,
            `${environment.api.baseUrl}/api/v1/auth/signup`,
            `${environment.api.baseUrl}/api/v1/auth/activate-account`,
            `${environment.api.baseUrl}/api/v1/auth/resend-activate-account-token`,
            `${environment.api.baseUrl}/api/v1/auth/reset-password`,
          ],
        },
      })
    ),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
            
          },
          darkModeSelector: '.dark',
        },
      },
    }),
    MessageService,
  ],
};
