import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './store/context/AppContext';
import App from './App';
import './index.css';

/**
 * Punto de entrada principal de la aplicación
 * Envuelve la app con AppProvider para estado global
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>
);
