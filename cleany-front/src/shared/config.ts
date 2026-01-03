export const config = {
  demoMode: import.meta.env.VITE_DEMO_MODE === 'true' || true,
  apiBase: import.meta.env.VITE_API_BASE || '',
  appName: 'Clean Today'
};
