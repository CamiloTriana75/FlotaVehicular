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
import NewVehiclePage from './pages/NewVehiclePage';
import DriversList from './pages/DriversList';
import NewDriver from './pages/NewDriver';
import DriverDetail from './pages/DriverDetail';
import RRHHDashboard from './pages/RRHHDashboard';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import VehicleDetail from './pages/VehicleDetail';
import Alerts from './pages/Alerts';
import RoutesPage from './pages/Routes';
import HealthCheck from './pages/HealthCheck';
import AssignmentsPage from './pages/AssignmentsPage';
import DriverIncidents from './pages/DriverIncidents';
import DriverPerformance from './pages/DriverPerformance';
import UsersAdmin from './pages/UsersAdmin';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { useAuth } from './lib/supabaseClient';

function App() {
  const auth = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return (
      localStorage.getItem('mockUser') !== null ||
      localStorage.getItem('currentUser') !== null
    );
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Cargar usuario actual
  React.useEffect(() => {
    const userStr =
      localStorage.getItem('currentUser') || localStorage.getItem('mockUser');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (err) {
        console.error('Error al parsear usuario:', err);
      }
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('mockUser');
    localStorage.removeItem('currentUser');
    if (auth.isMockMode) {
      console.log('Sesión cerrada en modo mock');
    }
  };

  // Debug: Mostrar estado de autenticación
  console.log('App render - isAuthenticated:', isAuthenticated);
  console.log('App render - auth.isMockMode:', auth.isMockMode);
  console.log('App render - currentUser:', currentUser);

  // Componente para redirección basada en rol
  const RoleDashboardRedirect = () => {
    const userRole =
      currentUser?.rol || currentUser?.user_metadata?.role || currentUser?.role;

    // Redirección según el rol
    if (userRole === 'rrhh') {
      return <Navigate to="/rrhh/dashboard" replace />;
    }

    // Por defecto, ir al dashboard general
    return <Navigate to="/dashboard" replace />;
  };

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
              <Route path="/" element={<RoleDashboardRedirect />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/rrhh/dashboard" element={<RRHHDashboard />} />
              <Route path="/vehiculos" element={<VehiclesList />} />
              <Route path="/vehiculos/nuevo" element={<NewVehiclePage />} />
              <Route path="/vehiculos/:id" element={<VehicleDetail />} />
              <Route path="/conductores" element={<DriversList />} />
              <Route path="/conductores/nuevo" element={<NewDriver />} />
              <Route path="/conductores/:id" element={<DriverDetail />} />
              <Route path="/asignaciones" element={<AssignmentsPage />} />
              <Route path="/mantenimiento" element={<Maintenance />} />
              <Route path="/reportes" element={<Reports />} />
              <Route path="/configuracion" element={<Settings />} />
              <Route path="/alertas" element={<Alerts />} />
              <Route path="/incidentes" element={<DriverIncidents />} />
              <Route path="/desempeno" element={<DriverPerformance />} />
              <Route path="/usuarios" element={<UsersAdmin />} />
              <Route path="/rutas" element={<RoutesPage />} />
              <Route path="/health" element={<HealthCheck />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
