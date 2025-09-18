import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import VehiclesList from './pages/VehiclesList';
import VehicleDetail from './pages/VehicleDetail';
import DriversList from './pages/DriversList';
import Docs from './pages/Docs';
import { useAuth } from './lib/supabaseClient';

function App() {
  const auth = useAuth();
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => {
    return localStorage.getItem('mockUser') !== null;
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('mockUser');
    if (auth.isMockMode) {
      // Limpiar cualquier estado adicional en modo mock
      console.log('Sesión cerrada en modo mock');
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <NavBar onLogout={handleLogout} isMockMode={auth.isMockMode} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vehiculos" element={<VehiclesList />} />
            <Route path="/vehiculos/:id" element={<VehicleDetail />} />
            <Route path="/conductores" element={<DriversList />} />
            <Route path="/documentos" element={<Docs />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;