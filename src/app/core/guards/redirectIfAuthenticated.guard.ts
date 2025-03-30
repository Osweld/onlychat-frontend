import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

export const redirectIfAuthenticatedGuard: CanActivateFn = (route, state) => {

  const token = localStorage.getItem('access_token');
  const jwtHelper = inject(JwtHelperService);
  const router = inject(Router);


  if (token && !jwtHelper.isTokenExpired(token)) {
    router.navigate(['/chat']);
    return false;
  }
  return true;
};
