import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/nhs.models';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    const currentRole = auth.currentRole();
    if (currentRole && allowedRoles.includes(currentRole)) {
      return true;
    }

    // Role unauthorized - redirect to appropriate home
    if (currentRole === 'trainee') {
      return router.createUrlTree(['/tabs/feedback']);
    } else if (currentRole === 'rep' || currentRole === 'admin') {
      return router.createUrlTree(['/tabs/rep-campaigns']);
    }

    return router.createUrlTree(['/login']);
  };
};
