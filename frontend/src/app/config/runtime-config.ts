import { environment } from '../../environments/environment';

export const runtimeConfig = {
  apiBaseUrl: environment.apiBaseUrl,
  features: environment.features,
} as const;
