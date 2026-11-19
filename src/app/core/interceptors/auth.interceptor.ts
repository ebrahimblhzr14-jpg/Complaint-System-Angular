import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../services/toast.service';
import { TranslationService } from '../services/translation.service';

// Throttle timestamp to prevent multiple simultaneous 429 toast alerts
let lastRateLimitToastTime = 0;

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const auth = inject(AuthService);
  const toast = inject(ToastService);
  const translation = inject(TranslationService);

  const token = auth.getAccessToken();

  let authReq = req;
  if (token && req.url.startsWith('/api')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      let handled = false;

      // Handle Rate Limiting (429) - Throttled notification respecting Retry-After
      if (error.status === 429) {
        handled = true;
        const now = Date.now();
        if (now - lastRateLimitToastTime > 6000) {
          lastRateLimitToastTime = now;
          const retryAfter = error.headers?.get('Retry-After');
          const waitMsg = retryAfter
            ? (translation.currentLang() === 'ar'
                ? `تم تجاوز الحد الأقصى للطلبات مؤقتاً. يرجى الانتظار ${retryAfter} ثانية قبل إعادة المحاولة.`
                : `Rate limit exceeded temporarily. Please wait ${retryAfter} seconds before retrying.`)
            : translation.translate('rateLimitAlertMsg');
          toast.warning(waitMsg, translation.translate('rateLimitAlertTitle'));
        }
      }
      // Handle Forbidden (403)
      else if (error.status === 403) {
        handled = true;
        toast.error(translation.translate('forbiddenAlertMsg'), translation.translate('forbiddenAlertTitle'));
      }
      // Handle Server Internal Error (500)
      else if (error.status === 500) {
        handled = true;
        toast.error(translation.translate('serverErrorMsg'), translation.translate('serverErrorTitle'));
      }
      // Handle Backend unreachable (0)
      else if (error.status === 0) {
        handled = true;
        toast.error(
          translation.translate('backendUnreachableMsg'),
          translation.translate('backendUnreachableTitle')
        );
      }
      // Handle Unauthorized (401)
      else if (
        error.status === 401 &&
        !req.url.includes('/api/Auth/login') &&
        !req.url.includes('/api/Auth/SingIn') &&
        !req.url.includes('/api/Auth/refresh')
      ) {
        return auth.refreshToken().pipe(
          switchMap((res) => {
            if (res?.accessToken) {
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${res.accessToken}`
                }
              });
              return next(retryReq);
            }
            auth.logoutLocal();
            return throwError(() => error);
          }),
          catchError((refreshErr) => {
            auth.logoutLocal();
            return throwError(() => refreshErr);
          })
        );
      }

      // Mark error with handledByInterceptor flag to avoid duplicate toast notifications in components
      (error as any).handledByInterceptor = handled;
      return throwError(() => error);
    })
  );
};
