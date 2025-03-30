import { LoginPageComponent } from './pages/login-page/login-page.component';
import { Routes } from '@angular/router';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { AccountActivationPageComponent } from './pages/account-activation-page/account-activation-page.component';


export const authRoutes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: LoginPageComponent},
 {path: 'register', component: RegisterPageComponent},
 {path: 'activate/:token', component: AccountActivationPageComponent},
 {path: '**', redirectTo: 'login'}
];