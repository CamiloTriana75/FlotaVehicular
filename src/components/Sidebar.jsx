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
  TrendingUp,
  Zap,
  Database,
  Lock,
} from 'lucide-react';
import NavLink from './NavLink';
import NavGroup from './NavGroup';

const Sidebar = ({ isOpen, onClose, align = 'left' }) => {
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
      title: 'Panel Operador',
      path: '/operador/dashboard',
      icon: Activity,
      description: 'Monitoreo de Flota',
      roles: ['operador', 'admin', 'superusuario', 'gerente'], // Operador y admins
    },
    {
      title: 'Dashboard RRHH',
      path: '/rrhh/dashboard',
      icon: Briefcase,
      description: 'Panel de Recursos Humanos',
      roles: ['rrhh'], // Solo para RRHH
    },
    {
      title: 'Reportes',
      path: '/reportes',
      icon: BarChart3,
      description: 'Reportes agregados de incidentes',
      roles: ['analista', 'superusuario', 'admin', 'gerente'],
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
      description: 'Gestión de incidentes (solo lectura)',
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
      title: 'Reportar incidente',
      path: '/conductor/reportar-incidente',
      icon: AlertTriangle,
      description: 'Enviar incidente con ubicación',
      roles: ['conductor'],
    },
    // Dashboard Conductor eliminado
    {
      title: 'Centro de Control',
      path: '/supervisor/centro-control',
      icon: Shield,
      description: 'Gestionar alertas de pánico',
      badge: '🚨',
      badgeColor: 'bg-red-500',
      roles: ['supervisor', 'gerente', 'admin'],
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

  // Organizar items por grupo funcional
  const getGroupedMenuItems = () => {
    const groups = {
      dashboards: {
        title: 'Dashboards',
        icon: LayoutDashboard,
        items: [],
      },
      flota: {
        title: 'Flota',
        icon: Truck,
        items: [],
      },
      operaciones: {
        title: 'Operaciones',
        icon: Navigation,
        items: [],
      },
      recursos: {
        title: 'Recursos',
        icon: Users,
        items: [],
      },
      gestion: {
        title: 'Gestión',
        icon: AlertTriangle,
        items: [],
      },
      admin: {
        title: 'Administración',
        icon: Settings,
        items: [],
      },
    };

    // Clasificar items en grupos
    menuItems.forEach((item) => {
      if (
        ['/dashboard', '/operador/dashboard', '/rrhh/dashboard'].includes(
          item.path
        )
      ) {
        groups.dashboards.items.push(item);
      } else if (
        [
          '/vehiculos',
          '/vehiculos/nuevo',
          '/conductores',
          '/conductores/nuevo',
          '/mantenimiento',
          '/combustible',
        ].includes(item.path) ||
        item.path.startsWith('/asignaciones')
      ) {
        groups.flota.items.push(item);
      } else if (
        [
          '/monitoreo',
          '/rutas/planificacion',
          '/rutas/monitoreo',
          '/geocercas',
          '/conductor/mis-rutas',
          '/supervisor/centro-control',
        ].includes(item.path) ||
        item.path.startsWith('/conductor/')
      ) {
        groups.operaciones.items.push(item);
      } else if (['/desempeno'].includes(item.path)) {
        groups.recursos.items.push(item);
      } else if (
        [
          '/incidentes',
          '/alertas',
          '/alertas/configuracion',
          '/reportes',
          '/supervisor/centro-control',
        ].includes(item.path)
      ) {
        groups.gestion.items.push(item);
      } else if (
        ['/usuarios', '/seguridad', '/configuracion', '/health'].includes(
          item.path
        )
      ) {
        groups.admin.items.push(item);
      }
    });

    // Retornar solo grupos que tienen items
    return Object.values(groups).filter((group) => group.items.length > 0);
  };

  const groupedMenuItems = getGroupedMenuItems();

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
        fixed inset-y-0 ${align === 'right' ? 'right-0' : 'left-0'} z-50 w-72 md:w-80 bg-white shadow-xl transform transition-all duration-300 ease-in-out
        flex flex-col border-r border-gray-200
        ${isOpen ? 'translate-x-0' : align === 'right' ? 'translate-x-full' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0 lg:h-screen
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FleetManager
              </h1>
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
        <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 py-3 md:py-4">
          {groupedMenuItems.map((group) => (
            <NavGroup key={group.title} title={group.title} icon={group.icon}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    icon={Icon}
                    title={item.title}
                    description={item.description}
                    active={active}
                    badge={item.badge}
                    badgeColor={item.badgeColor}
                    onClick={onClose}
                  />
                );
              })}
            </NavGroup>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 md:p-4 border-t border-gray-200 bg-white flex-shrink-0">
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
