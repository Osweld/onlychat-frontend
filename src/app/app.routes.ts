import { Routes } from '@angular/router';
import { authRoutes } from './auth/auth.routes';
import { authGuard } from './core/guards/auth.guard';
import { redirectIfAuthenticatedGuard } from './core/guards/redirectIfAuthenticated.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes),
    canActivate: [redirectIfAuthenticatedGuard],
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
