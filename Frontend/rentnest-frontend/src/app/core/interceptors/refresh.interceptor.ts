import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const skipUrls = [
    '/refreshtoken',
    '/logout',
    '/signin-user',
    '/signup-user',
    '/signup-owner',
    '/verify-otp',
    '/resend-otp',
  ];

  // ← THIS WAS MISSING!
  if (skipUrls.some((url) => req.url.includes(url))) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return authService.refreshToken().pipe(
          switchMap((response) => {
            const cloned = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.data.accessToken}`,
              },
            });
            return next(cloned);
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
