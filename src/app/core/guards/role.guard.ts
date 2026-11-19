import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../services/toast.service';
import { TranslationService } from '../services/translation.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  const translation = inject(TranslationService);

  const expectedRoles = (route.data['roles'] as string[]) || [];
  const currentRole = auth.currentUser()?.role;

  if (currentRole && expectedRoles.includes(currentRole)) {
    return true;
  }

  toast.error(translation.translate('forbiddenMsg'), translation.translate('forbiddenAlertTitle'));
  router.navigate(['/complaints']);
  return false;
};
