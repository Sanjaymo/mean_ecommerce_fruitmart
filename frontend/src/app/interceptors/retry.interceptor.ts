import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { retry } from 'rxjs';
import { runtimeConfig } from '../config/runtime-config';

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  if (!runtimeConfig.features.requestRetry || req.method !== 'GET') {
    return next(req);
  }

  return next(req).pipe(
    retry({
      count: 2,
      delay: (error, retryCount) => {
        if (!(error instanceof HttpErrorResponse)) {
          throw error;
        }

        if (error.status !== 0 && error.status < 500) {
          throw error;
        }

        return new Promise<void>((resolve) => {
          setTimeout(resolve, 180 * retryCount);
        });
      },
    })
  );
};
