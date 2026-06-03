import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { UiMotionService } from '../services/ui-motion';

export const SKIP_GLOBAL_LOADER = new HttpContextToken<boolean>(() => false);

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const motion = inject(UiMotionService);

  if (req.context.get(SKIP_GLOBAL_LOADER)) {
    return next(req);
  }

  motion.startRequest(req.url, req.method);
  return next(req).pipe(finalize(() => motion.endRequest()));
};
