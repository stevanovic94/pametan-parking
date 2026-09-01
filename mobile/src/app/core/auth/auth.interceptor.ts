import {
  HttpInterceptorFn
} from '@angular/common/http';

import { inject } from '@angular/core';

import { environment } from '../../../environments/environment';

import { AuthSessionService } from './auth-session.service';

export const authInterceptor:
  HttpInterceptorFn = (
    request,
    next
  ) => {

    const authSession =
      inject(AuthSessionService);

    const accessToken =
      authSession.accessToken();

    const isBackendRequest =
      request.url.startsWith(
        environment.apiUrl
      );

    const isPublicAuthRequest =
      request.url.includes(
        '/auth/login'
      ) ||
      request.url.includes(
        '/auth/register'
      ) ||
      request.url.includes(
        '/auth/refresh'
      );

    if (
      !isBackendRequest ||
      isPublicAuthRequest ||
      !accessToken
    ) {
      return next(request);
    }

    const authenticatedRequest =
      request.clone({
        setHeaders: {
          Authorization:
            `Bearer ${accessToken}`
        }
      });

    return next(
      authenticatedRequest
    );
  };