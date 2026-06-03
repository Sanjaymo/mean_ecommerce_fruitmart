import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true;
  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/login']);
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true;
  if (auth.isLoggedIn() && auth.isAdmin()) return true;
  // Logged-in non-admins go to their dashboard; unauthenticated go to login
  if (auth.isLoggedIn()) return router.createUrlTree(['/dashboard']);
  return router.createUrlTree(['/login']);
};

export const userGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true;
  if (!auth.isLoggedIn()) return router.createUrlTree(['/login']);
  // Admins visiting user routes get sent to their dashboard, not user dashboard
  if (auth.isAdmin()) return router.createUrlTree(['/admin']);
  return true;
};

export const sellerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true;
  if (!auth.isLoggedIn()) return router.createUrlTree(['/login']);
  if (auth.isSeller() || auth.isAdmin()) return true;
  return auth.refreshProfile().pipe(
    map(() => {
      if (auth.isSeller() || auth.isAdmin()) return true;
      return router.createUrlTree(['/dashboard']);
    })
  );
};

export const becomeSellerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true;

  const shouldRedirectToSeller = () =>
    auth.isSeller() || auth.isAdmin() || auth.user()?.sellerProfile?.sellerStatus === 'approved';

  if (!auth.isLoggedIn()) return router.createUrlTree(['/login']);
  if (shouldRedirectToSeller()) return router.createUrlTree(['/seller-dashboard']);

  return auth.refreshProfile().pipe(
    map((user) => {
      if (auth.isSeller() || auth.isAdmin() || user?.sellerProfile?.sellerStatus === 'approved') {
        return router.createUrlTree(['/seller-dashboard']);
      }
      return true;
    })
  );
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true;
  if (!auth.isLoggedIn()) return true;
  if (auth.isAdmin()) return router.createUrlTree(['/admin']);
  if (auth.isSeller()) return router.createUrlTree(['/seller-dashboard']);
  return router.createUrlTree(['/dashboard']);
};

export const homeGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true;
  if (!auth.isLoggedIn()) return true;
  if (auth.isAdmin()) return router.createUrlTree(['/admin']);
  if (auth.isSeller()) return router.createUrlTree(['/seller-dashboard']);
  return router.createUrlTree(['/dashboard']);
};
