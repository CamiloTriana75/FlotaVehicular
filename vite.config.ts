import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// import mkcert from 'vite-plugin-mkcert';

// Configuración Vite
// - Exponer host 0.0.0.0 para permitir acceso desde otros dispositivos (móvil en la misma red)
// - strictPort para evitar cambio de puerto silencioso
// - HTTP simple para usar con ngrok (el túnel maneja HTTPS)
export default defineConfig({
  plugins: [
    react(),
    // mkcert(), // Deshabilitado: usamos HTTP con ngrok
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
});
