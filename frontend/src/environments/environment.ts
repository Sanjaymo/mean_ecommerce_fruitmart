export const environment = {
  production: true,
  apiBaseUrl: 'http://localhost:3000/api',
  features: {
    globalMotion: true,
    requestRetry: true,
    soundFeedback: false,
    experimentalUi: false,
  },
} as const;
