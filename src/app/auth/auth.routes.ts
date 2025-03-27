import { LoginPageComponent } from './pages/login-page/login-page.component';
import { Routes } from '@angular/router';
import { RegisterPageComponent } from './pages/register-page/register-page.component';


export const authRoutes: Routes = [
  {path: 'login', component: LoginPageComponent},
 {path: 'register', component: RegisterPageComponent},
];