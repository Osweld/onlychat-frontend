import { LoginPageComponent } from './pages/login-page/login-page.component';
import { Routes } from '@angular/router';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { AccountActivationPageComponent } from './pages/account-activation-page/account-activation-page.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { ConfigurationComponent } from '../chat/pages/configuration/configuration.component';

export const authRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent, title: 'Login | OnlyChat' },
  {
    path: 'register',
    component: RegisterPageComponent,
    title: 'Register | OnlyChat',
  },
  {
    path: 'activate/:token',
    component: AccountActivationPageComponent,
    title: 'Activate Account | OnlyChat',
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    title: 'Reset Password | OnlyChat',
  },
  { path: '**', redirectTo: 'login' },
];
