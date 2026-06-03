export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api',
  features: {
    globalMotion: true,
    requestRetry: true,
    soundFeedback: false,
    experimentalUi: true,
  },
} as const;
