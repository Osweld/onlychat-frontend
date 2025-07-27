import { Routes } from '@angular/router';
import { redirectIfAuthenticatedGuard } from './core/guards/redirectIfAuthenticated.guard';
import { authGuard } from './core/guards/auth.guard';
import { ConfigurationComponent } from './chat/pages/configuration/configuration.component';

export const routes: Routes = [
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.routes').then((m) => m.chatRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'configuration',
    component: ConfigurationComponent,
    title: 'Configuration | OnlyChat',
    canActivate: [authGuard],
  },
  {
    path: '',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes),
   canActivate: [redirectIfAuthenticatedGuard],
  },

  { path: '**', redirectTo: 'chat' },
];
