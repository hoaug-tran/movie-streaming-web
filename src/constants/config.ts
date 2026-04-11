/* Feature Flags */
export const FEATURES = {
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  ENABLE_BETA_FEATURES: process.env.NEXT_PUBLIC_ENABLE_BETA_FEATURES === "true",
  ENABLE_DARK_MODE: true,
  ENABLE_NOTIFICATIONS: true,
} as const;

/* URLs */
export const URLS = {
  APP_BASE: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  API_BASE: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1",
  TERMS_OF_SERVICE: "/terms",
  PRIVACY_POLICY: "/privacy",
} as const;
