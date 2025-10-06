import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import VehiclesList from './pages/VehiclesList';
import DriversList from './pages/DriversList';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import VehicleDetail from './pages/VehicleDetail';
import Alerts from './pages/Alerts';
import RoutesPage from './pages/Routes';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { useAuth } from './lib/supabaseClient';

function App() {
  const auth = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('mockUser') !== null;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('mockUser');
    if (auth.isMockMode) {
      console.log('Sesión cerrada en modo mock');
    }
  };

  // Debug: Mostrar estado de autenticación
  console.log('App render - isAuthenticated:', isAuthenticated);
  console.log('App render - auth.isMockMode:', auth.isMockMode);

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar
            onMenuClick={() => setIsSidebarOpen(true)}
            onLogout={handleLogout}
            isMockMode={auth.isMockMode}
          />
          <main className="p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/vehiculos" element={<VehiclesList />} />
              <Route path="/vehiculos/:id" element={<VehicleDetail />} />
              <Route path="/conductores" element={<DriversList />} />
              <Route path="/mantenimiento" element={<Maintenance />} />
              <Route path="/reportes" element={<Reports />} />
              <Route path="/configuracion" element={<Settings />} />
              <Route path="/alertas" element={<Alerts />} />
              <Route path="/rutas" element={<RoutesPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
