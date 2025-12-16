import '@testing-library/jest-dom';

// Inyecta variables de entorno por defecto para las pruebas
const defaultEnv = {
  VITE_SUPABASE_URL: 'https://example.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  VITE_MAPBOX_TOKEN: 'test-mapbox-token',
  VITE_APP_NAME: 'FleetManager',
  VITE_APP_VERSION: '2.0.0',
  VITE_APP_ENVIRONMENT: 'test',
};

// Merge con valores reales si existen
const testEnv = {
  ...defaultEnv,
  ...Object.fromEntries(
    Object.entries(import.meta.env).filter(([key]) => key.startsWith('VITE_'))
  ),
};

// Reemplaza import.meta.env con valores merged
Object.keys(testEnv).forEach((key) => {
  if (!(key in import.meta.env)) {
    import.meta.env[key] = testEnv[key];
  }
});

// Polyfills para testing
if (!globalThis.localStorage) {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  };
}
