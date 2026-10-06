/**
 * Dynamically resolves the application version injected at build time from package.json.
 */
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '2.0.0';
