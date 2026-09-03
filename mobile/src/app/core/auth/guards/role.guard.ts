import { inject } from '@angular/core';

import {
  CanActivateFn,
  Router,
} from '@angular/router';

import { AuthSessionService } from '../auth-session.service';

import type {
  UserRole,
} from '../types/user-role.type';


export const roleGuard: CanActivateFn = (
  route,
) => {

  const authSession =
    inject(AuthSessionService);

  const router =
    inject(Router);


  const user =
    authSession.user();


  /*
   * Ako korisnik nije prijavljen,
   * vraćamo ga na login.
   */
  if (!user) {
    return router.createUrlTree([
      '/login',
    ]);
  }


  /*
   * Iz route.data čitamo koje role
   * imaju pristup konkretnoj ruti.
   */
  const allowedRoles =
    route.data['roles'] as
      UserRole[] | undefined;


  /*
   * Ako ruta nema definisane role,
   * dovoljno je da je korisnik prijavljen.
   */
  if (
    !allowedRoles ||
    allowedRoles.length === 0
  ) {
    return true;
  }


  /*
   * Ako korisnik ima dozvoljenu rolu,
   * navigacija je dozvoljena.
   */
  if (
    allowedRoles.includes(user.role)
  ) {
    return true;
  }


  /*
   * Korisnik jeste prijavljen,
   * ali nema odgovarajuću rolu.
   */
  return router.createUrlTree([
    '/forbidden',
  ]);
};