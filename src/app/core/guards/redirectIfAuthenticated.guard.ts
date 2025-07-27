import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

export const redirectIfAuthenticatedGuard: CanActivateFn = (route, state) => {

  const token = localStorage.getItem('access_token');
  const authService = inject(AuthService);
  const router = inject(Router);


  if (token && !authService.isTokenExpired()) {
    router.navigate(['/chat']);
    return false;
  }
  return true;
};
