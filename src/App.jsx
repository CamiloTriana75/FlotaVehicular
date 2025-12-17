import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import VehiclesList from './pages/VehiclesList';
import NewVehiclePage from './pages/NewVehiclePage';
import DriversList from './pages/DriversList';
import NewDriver from './pages/NewDriver';
import DriverDetail from './pages/DriverDetail';
import RRHHDashboard from './pages/RRHHDashboard';
import OperadorDashboard from './pages/OperadorDashboard';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import VehicleDetail from './pages/VehicleDetail';
import Alerts from './pages/Alerts';
import AlertRulesConfig from './pages/AlertRulesConfig';
import RoutesPage from './pages/Routes';
import HealthCheck from './pages/HealthCheck';
import AssignmentsPage from './pages/AssignmentsPage';
import DriverIncidents from './pages/DriverIncidents';
import DriverPerformance from './pages/DriverPerformance';
import UsersAdmin from './pages/UsersAdmin';
import RealTimeMonitoring from './pages/RealTimeMonitoring';
import RoutesList from './pages/RoutesList';
import NewRoutePage from './pages/NewRoutePage';
import AssignRoutePage from './pages/AssignRoutePage';
import MyRoutes from './pages/MyRoutes';
import ConductorRouteView from './pages/ConductorRouteView';
import RouteMonitoring from './pages/RouteMonitoring';
import RouteComparison from './pages/RouteComparison';
import Geofences from './pages/Geofences';
import ReportIncident from './pages/ReportIncident';
// Eliminado: los conductores no tienen dashboard principal
import SupervisorPanicCenter from './pages/SupervisorPanicCenter';
import ChatbotWidget from './components/ChatbotWidget';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { useAuth } from './lib/supabaseClient';
import ProtectedRoute from './components/ProtectedRoute';
import {
  initializeNotifications,
  stopNotifications,
} from './services/notificationService';

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

  // Inicializar notificaciones globales al autenticarse
  React.useEffect(() => {
    if (isAuthenticated) {
      console.log('🔔 Inicializando notificaciones globales...');
      initializeNotifications();
    } else {
      stopNotifications();
    }

    return () => {
      stopNotifications();
    };
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('mockUser');
    localStorage.removeItem('currentUser');
    stopNotifications(); // Detener notificaciones al cerrar sesión
    if (auth.isMockMode) {
      console.log('Sesión cerrada en modo mock');
    }
    // Forzar recarga completa para limpiar estado y navegación
    window.location.href = '/';
  };

  // Debug: Mostrar estado de autenticación
  console.log('App render - isAuthenticated:', isAuthenticated);
  console.log('App render - auth.isMockMode:', auth.isMockMode);
  console.log('App render - currentUser:', currentUser);

  // No redirigir automáticamente - dejar que el usuario elija desde el sidebar

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const getUserRole = () => {
    const userStr =
      localStorage.getItem('currentUser') || localStorage.getItem('mockUser');
    if (!userStr) return null;
    try {
      const u = JSON.parse(userStr);
      return u.rol || u.user_metadata?.role || u.role || null;
    } catch (err) {
      console.warn('No se pudo determinar el rol del usuario:', err);
      return null;
    }
  };
  const userRole = getUserRole();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex overflow-hidden">
        {userRole !== 'analista' && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar
            onMenuClick={() => setIsSidebarOpen(true)}
            onLogout={handleLogout}
            isMockMode={auth.isMockMode}
          />
          <main className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
            <Routes>
              <Route
                path="/"
                element={
                  <div className="max-w-4xl mx-auto">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Bienvenido
                      </h2>
                      <p className="mt-2 text-gray-600">
                        Selecciona una opción en la barra lateral para comenzar.
                      </p>
                    </div>
                  </div>
                }
              />
              {/* Ruta /dashboard eliminada */}
              <Route
                path="/rrhh/dashboard"
                element={
                  <ProtectedRoute roles={['rrhh', 'superusuario', 'admin']}>
                    <RRHHDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operador/dashboard"
                element={
                  <ProtectedRoute roles={['operador', 'admin', 'superusuario']}>
                    <OperadorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/vehiculos" element={<VehiclesList />} />
              <Route path="/vehiculos/nuevo" element={<NewVehiclePage />} />
              <Route path="/vehiculos/:id" element={<VehicleDetail />} />
              <Route path="/conductores" element={<DriversList />} />
              <Route
                path="/conductores/nuevo"
                element={
                  <ProtectedRoute roles={['superusuario', 'admin', 'rrhh']}>
                    <NewDriver />
                  </ProtectedRoute>
                }
              />
              <Route path="/conductores/:id" element={<DriverDetail />} />
              <Route path="/asignaciones" element={<AssignmentsPage />} />
              {/* Ruta de mantenimiento - accesible para mecánicos */}
              <Route
                path="/mantenimiento"
                element={
                  <ProtectedRoute roles={['superusuario', 'admin', 'mecanico']}>
                    <Maintenance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reportes"
                element={
                  <ProtectedRoute
                    roles={['analista', 'superusuario', 'gerente']}
                  >
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route path="/configuracion" element={<Settings />} />
              <Route path="/alertas" element={<Alerts />} />
              <Route
                path="/alertas/configuracion"
                element={
                  <ProtectedRoute roles={['superusuario', 'admin']}>
                    <AlertRulesConfig />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/incidentes"
                element={
                  <ProtectedRoute
                    roles={['supervisor', 'admin', 'superusuario']}
                  >
                    <DriverIncidents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/conductor/reportar-incidente"
                element={
                  <ProtectedRoute roles={['conductor']}>
                    <ReportIncident />
                  </ProtectedRoute>
                }
              />
              <Route path="/desempeno" element={<DriverPerformance />} />
              <Route path="/usuarios" element={<UsersAdmin />} />
              <Route path="/monitoreo" element={<RealTimeMonitoring />} />
              <Route path="/rutas" element={<RoutesPage />} />
              <Route
                path="/rutas/planificacion"
                element={
                  <ProtectedRoute
                    roles={[
                      'superusuario',
                      'admin',
                      'operador',
                      'planificador',
                    ]}
                  >
                    <RoutesList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rutas/planificacion/nueva"
                element={
                  <ProtectedRoute
                    roles={[
                      'superusuario',
                      'admin',
                      'operador',
                      'planificador',
                    ]}
                  >
                    <NewRoutePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rutas/planificacion/:routeId/asignar"
                element={
                  <ProtectedRoute
                    roles={[
                      'superusuario',
                      'admin',
                      'operador',
                      'planificador',
                    ]}
                  >
                    <AssignRoutePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/conductor/mis-rutas"
                element={
                  <ProtectedRoute
                    roles={['conductor', 'operador', 'superusuario', 'admin']}
                  >
                    <MyRoutes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/conductor/mis-rutas/:assignmentId"
                element={
                  <ProtectedRoute roles={['conductor']}>
                    <ConductorRouteView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rutas/monitoreo"
                element={
                  <ProtectedRoute
                    roles={[
                      'superusuario',
                      'admin',
                      'operador',
                      'planificador',
                      'supervisor',
                    ]}
                  >
                    <RouteMonitoring />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rutas/comparacion/:assignmentId"
                element={
                  <ProtectedRoute
                    roles={[
                      'superusuario',
                      'admin',
                      'supervisor',
                      'planificador',
                    ]}
                  >
                    <RouteComparison />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/geocercas"
                element={
                  <ProtectedRoute
                    roles={['superusuario', 'admin', 'operador', 'supervisor']}
                  >
                    <Geofences />
                  </ProtectedRoute>
                }
              />
              <Route path="/health" element={<HealthCheck />} />
              {/* Dashboard de Conductor eliminado por decisión de producto */}
              <Route
                path="/supervisor/centro-control"
                element={
                  <ProtectedRoute roles={['supervisor', 'gerente', 'admin']}>
                    <SupervisorPanicCenter />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          {/* Widget flotante del asistente (n8n + Ollama) */}
          <ChatbotWidget />
        </div>
        {userRole === 'analista' && (
          <Sidebar
            align="right"
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
