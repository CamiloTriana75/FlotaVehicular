import '@testing-library/jest-dom';

// Ensure env vars exist for tests that depend on them
if (!import.meta.env.VITE_SUPABASE_URL) {
  Object.defineProperty(import.meta, 'env', {
    value: {
      ...import.meta.env,
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
      VITE_MAPBOX_TOKEN:
        import.meta.env.VITE_MAPBOX_TOKEN || 'test-mapbox-token',
    },
    writable: false,
  });
}
