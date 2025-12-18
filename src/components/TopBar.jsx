import React, { useState, useEffect } from 'react';
import { Menu, User, LogOut, ChevronDown, Wifi, WifiOff } from 'lucide-react';

const TopBar = ({ onMenuClick, onLogout, isMockMode }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [companyName, setCompanyName] = useState('FleetManager 🚀');

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

  // Cargar nombre de la empresa desde localStorage
  useEffect(() => {
    const loadCompanyName = () => {
      const saved = localStorage.getItem('companyData');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setCompanyName(data.name || 'FleetManager 🚀');
        } catch (e) {
          console.error('Error al cargar nombre de empresa:', e);
        }
      }
    };

    loadCompanyName();

    // Escuchar cambios en el nombre de la empresa
    const handleCompanyUpdate = () => {
      loadCompanyName();
    };

    window.addEventListener('companyDataUpdated', handleCompanyUpdate);
    return () => {
      window.removeEventListener('companyDataUpdated', handleCompanyUpdate);
    };
  }, []);

  const [notifications] = useState([]);

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

  // Cerrar menús cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-menu="user"]')) setShowUserMenu(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 md:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Abrir menú lateral"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>

          {/* Title - Hidden on mobile */}
          <div className="hidden md:block flex-shrink-0">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 whitespace-nowrap">
              {companyName}
            </h2>
          </div>

          {/* Espacio flexible - Buscador eliminado */}
          <div className="flex-1"></div>

          {/* Right side - Icons & User Menu */}
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            {/* Connection Status - Hidden on small screens */}
            <div className="hidden sm:flex items-center gap-1">
              {isMockMode ? (
                <div
                  className="flex items-center gap-1 text-yellow-600"
                  title="Sin conexión a backend real"
                >
                  <WifiOff className="w-4 h-4" />
                  <span className="text-xs md:text-sm font-medium">
                    Offline
                  </span>
                </div>
              ) : (
                <div
                  className="flex items-center gap-1 text-green-600"
                  title="Conectado a base de datos"
                >
                  <Wifi className="w-4 h-4" />
                  <span className="text-xs md:text-sm font-medium">Online</span>
                </div>
              )}
            </div>

            {/* Time - Hidden on small screens */}
            <div className="hidden lg:block text-xs text-gray-600 font-mono px-3 py-2 bg-gray-50 rounded-lg">
              {currentTime}
            </div>

            {/* User Menu */}
            <div className="relative" data-menu="user">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-haspopup="menu"
                aria-expanded={showUserMenu}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block text-left min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {getUserRole()}
                  </p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                    showUserMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {getUserEmail()}
                    </p>
                  </div>

                  <div className="py-2">
                    <button
                      onClick={() => {
                        onLogout();
                        setShowUserMenu(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 flex-shrink-0" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
