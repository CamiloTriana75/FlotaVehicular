import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Users,
  Wrench,
  BarChart3,
  Settings,
  MapPin,
  AlertTriangle,
  Fuel,
  Route,
  Shield,
  X,
  Activity,
  Briefcase,
  Calendar,
  Navigation,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

  // Cargar usuario actual
  useEffect(() => {
    const userStr =
      localStorage.getItem('currentUser') || localStorage.getItem('mockUser');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (err) {
        console.error('Error al parsear usuario:', err);
      }
    }
  }, []);

  // Obtener rol del usuario
  const getUserRole = () => {
    if (!currentUser) return null;
    return (
      currentUser.rol || currentUser.user_metadata?.role || currentUser.role
    );
  };

  const userRole = getUserRole();

  // Configuración de menús por rol
  const allMenuItems = [
    {
      title: 'Dashboard General',
      path: '/dashboard',
      icon: LayoutDashboard,
      description: 'Vista general del sistema',
      roles: ['superusuario', 'admin'], // Solo admin y superusuario
    },
    {
      title: 'Panel Operador',
      path: '/operador/dashboard',
      icon: Activity,
      description: 'Monitoreo de Flota',
      roles: ['operador'], // Solo para operador
    },
    {
      title: 'Dashboard RRHH',
      path: '/rrhh/dashboard',
      icon: Briefcase,
      description: 'Panel de Recursos Humanos',
      roles: ['rrhh'], // Solo para RRHH
    },
    {
      title: 'Vehículos',
      path: '/vehiculos',
      icon: Truck,
      description: 'Gestión de flota vehicular',
      badge: '5',
      roles: ['superusuario', 'admin'],
    },
    {
      title: 'Conductores',
      path: '/conductores',
      icon: Users,
      description: 'Gestión de personal',
      roles: ['superusuario', 'admin', 'rrhh'],
    },
    {
      title: 'Nuevo Conductor',
      path: '/conductores/nuevo',
      icon: Users,
      description: 'Crear conductor (RRHH / Superusuario)',
      roles: ['superusuario', 'admin', 'rrhh'],
    },
    {
      title: 'Asignaciones',
      path: '/asignaciones',
      icon: Calendar,
      description: 'Vehículos a conductores',
      roles: ['superusuario', 'admin', 'supervisor'],
    },
    {
      title: 'Incidentes',
      path: '/incidentes',
      icon: AlertTriangle,
      description: 'Historial y gestión de incidentes',
      roles: ['superusuario', 'admin', 'supervisor'],
    },
    {
      title: 'Desempeño',
      path: '/desempeno',
      icon: BarChart3,
      description: 'KPIs por conductor',
      roles: ['superusuario', 'admin', 'supervisor'],
    },
    {
      title: 'Monitoreo',
      path: '/monitoreo',
      icon: MapPin,
      description: 'Tracking en tiempo real',
      badge: '3',
      roles: ['superusuario', 'admin', 'operador'],
    },
    {
      title: 'Geocercas',
      path: '/geocercas',
      icon: MapPin,
      description: 'Configurar y auditar geocercas',
      roles: ['superusuario', 'admin', 'supervisor', 'operador'],
    },
    {
      title: 'Mis Rutas',
      path: '/conductor/mis-rutas',
      icon: Navigation,
      description: 'Rutas asignadas (conductor)',
      roles: ['conductor'],
    },
    {
      title: 'Planificación Rutas',
      path: '/rutas/planificacion',
      icon: Navigation,
      description: 'Crear y asignar rutas optimizadas',
      roles: ['planificador'],
    },
    {
      title: 'Monitoreo Rutas',
      path: '/rutas/monitoreo',
      icon: Route,
      description: 'Seguimiento de rutas en progreso',
      roles: [
        'superusuario',
        'admin',
        'operador',
        'planificador',
        'supervisor',
      ],
    },
    {
      title: 'Combustible',
      path: '/combustible',
      icon: Fuel,
      description: 'Control de combustible',
      roles: ['superusuario', 'admin', 'operador'],
    },
    {
      title: 'Mantenimiento',
      path: '/mantenimiento',
      icon: Wrench,
      description: 'Mantenimiento predictivo',
      roles: ['superusuario', 'admin', 'operador', 'mecanico'],
    },
    {
      title: 'Alertas',
      path: '/alertas',
      icon: AlertTriangle,
      description: 'Incidentes y emergencias',
      badge: '2',
      badgeColor: 'bg-red-500',
      roles: ['superusuario', 'admin', 'operador', 'rrhh', 'supervisor'],
    },
    {
      title: 'Config. Alertas',
      path: '/alertas/configuracion',
      icon: Settings,
      description: 'Configurar umbrales',
      roles: ['superusuario', 'admin'],
    },
    {
      title: 'Reportes',
      path: '/reportes',
      icon: BarChart3,
      description: 'Analytics y reportes',
      roles: ['superusuario', 'admin', 'rrhh'],
    },
    {
      title: 'Seguridad',
      path: '/seguridad',
      icon: Shield,
      description: 'Roles y permisos',
      roles: ['superusuario', 'admin'],
    },
    {
      title: 'Usuarios',
      path: '/usuarios',
      icon: Users,
      description: 'Gestión de usuarios',
      roles: ['superusuario', 'admin'],
    },
    {
      title: 'Configuración',
      path: '/configuracion',
      icon: Settings,
      description: 'Configuración del sistema',
      roles: ['superusuario', 'admin', 'rrhh', 'operador'],
    },
    {
      title: 'Estado BD',
      path: '/health',
      icon: Activity,
      description: 'Verificar conexión',
      badgeColor: 'bg-green-100 text-green-800',
      roles: ['superusuario', 'admin'],
    },
  ];

  // Filtrar menús según el rol del usuario
  const menuItems = userRole
    ? allMenuItems.filter(
        (item) => !item.roles || item.roles.includes(userRole)
      )
    : allMenuItems;

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + '/')
    );
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          role="button"
          aria-label="Cerrar menú"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">FleetManager</h1>
              <p className="text-sm text-gray-500">Sistema de Gestión</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6">
          <div className="px-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200
                    ${
                      active
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-sm'
                        : 'hover:bg-gray-50 hover:shadow-sm'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`
                      p-2 rounded-lg transition-colors
                      ${
                        active
                          ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                      }
                    `}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p
                        className={`font-medium ${active ? 'text-blue-900' : 'text-gray-900'}`}
                      >
                        {item.title}
                      </p>
                      <p
                        className={`text-xs ${active ? 'text-blue-600' : 'text-gray-500'}`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`
                      px-2 py-1 text-xs font-medium rounded-full
                      ${item.badgeColor || 'bg-blue-100 text-blue-800'}
                    `}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Sistema Seguro
                </p>
                <p className="text-xs text-gray-600">Datos encriptados</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
