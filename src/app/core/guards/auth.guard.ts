import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('access_token');
  const jwtHelper = inject(JwtHelperService);
  const router = inject(Router);

  if (token && !jwtHelper.isTokenExpired(token)) {
    return true;
  }

  localStorage.clear();
  router.navigate(['/login']);
  return false;
};
