import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Wifi,
  WifiOff,
} from 'lucide-react';

const TopBar = ({ onMenuClick, onLogout, isMockMode }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Cargar usuario actual desde localStorage
  useEffect(() => {
    const userStr =
      localStorage.getItem('currentUser') || localStorage.getItem('mockUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (err) {
        console.error('Error al parsear usuario:', err);
      }
    }
  }, []);
  const [notifications] = useState([
    {
      id: 1,
      title: 'Vehículo ABC-123 necesita mantenimiento',
      time: '5 min',
      type: 'warning',
    },
    {
      id: 2,
      title: 'Nueva ruta optimizada disponible',
      time: '15 min',
      type: 'info',
    },
    {
      id: 3,
      title: 'Alerta: Exceso de velocidad detectado',
      time: '1 hora',
      type: 'alert',
    },
  ]);

  const currentTime = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Obtener nombre para mostrar y rol
  const getUserDisplayName = () => {
    if (!currentUser) return 'Usuario';
    return (
      currentUser.username ||
      currentUser.user_metadata?.full_name ||
      currentUser.email?.split('@')[0] ||
      'Usuario'
    );
  };

  const getUserRole = () => {
    if (!currentUser) return 'Usuario';
    const rol =
      currentUser.rol || currentUser.user_metadata?.role || currentUser.role;

    // Mapear roles a nombres legibles
    const roleMap = {
      superusuario: 'Superusuario',
      admin: 'Administrador',
      rrhh: 'Recursos Humanos',
      operador: 'Operador',
      conductor: 'Conductor',
    };

    return roleMap[rol] || rol || 'Usuario';
  };

  const getUserEmail = () => {
    if (!currentUser) return '';
    return currentUser.email || 'sin-email@sistema.com';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Abrir menú lateral"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>

          <div className="hidden md:block">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-sm text-gray-500">Sistema de Gestión de Flota</p>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar vehículos, conductores, rutas..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Buscar"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isMockMode ? (
              <div
                className="flex items-center space-x-1 text-yellow-600"
                title="Sin conexión a backend real"
              >
                <WifiOff className="w-4 h-4" />
                <span className="text-sm font-medium">Offline</span>
              </div>
            ) : (
              <div
                className="flex items-center space-x-1 text-green-600"
                title="Conectado a base de datos"
              >
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">Online</span>
              </div>
            )}
          </div>

          {/* Time */}
          <div className="hidden sm:block text-sm text-gray-600 font-mono">
            {currentTime}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
              aria-label="Notificaciones"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-haspopup="menu"
              aria-expanded={showUserMenu}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-500">{getUserRole()}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500">{getUserEmail()}</p>
                </div>

                <div className="py-2">
                  <button className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <User className="w-4 h-4" />
                    <span>Perfil</span>
                  </button>
                  <button className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Settings className="w-4 h-4" />
                    <span>Configuración</span>
                  </button>
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
