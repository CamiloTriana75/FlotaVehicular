import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Bell,
  BellOff,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Car,
  Gauge,
  MapPin,
  Settings,
} from 'lucide-react';
import {
  obtenerAlertas,
  obtenerEstadisticasAlertas,
  marcarAlertaComoVista,
  resolverAlerta,
  ignorarAlerta,
  suscribirseAAlertas,
} from '../services/alertService';

// Mapeo de iconos por tipo de alerta
const ALERT_ICONS = {
  velocidad_excesiva: Gauge,
  parada_prolongada: MapPin,
  combustible_bajo: AlertTriangle,
  mantenimiento_vencido: Clock,
  licencia_vencida: AlertTriangle,
  parada_no_autorizada: MapPin,
  falla_sistema: XCircle,
};

const Alerts = () => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState('pendiente');
  const [typeFilter, setTypeFilter] = useState('Todas');
  const [priorityFilter, setPriorityFilter] = useState('Todas');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [alertas, setAlertas] = useState([]);
  const [stats, setStats] = useState({
    pendientes: 0,
    vistas: 0,
    resueltas: 0,
    criticas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Cargar alertas
  const cargarAlertas = async () => {
    setLoading(true);
    try {
      // Construir filtros
      const filtros = {};
      if (filter !== 'Todas' && filter.toLowerCase() !== 'todas') {
        filtros.estado = filter.toLowerCase();
      }
      if (typeFilter !== 'Todas') {
        filtros.tipo_alerta = typeFilter.toLowerCase().replace(/ /g, '_');
      }
      if (priorityFilter !== 'Todas') {
        filtros.nivel_prioridad = priorityFilter.toLowerCase();
      }

      const { data } = await obtenerAlertas(filtros);
      setAlertas(data || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error cargando alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const cargarEstadisticas = async () => {
    const { data } = await obtenerEstadisticasAlertas();
    if (data) {
      setStats(data);
    }
  };

  // Inicializar
  useEffect(() => {
    cargarAlertas();
    cargarEstadisticas();
  }, [filter, typeFilter, priorityFilter]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      cargarAlertas();
      cargarEstadisticas();
    }, 10000); // Cada 10 segundos

    return () => clearInterval(interval);
  }, [autoRefresh, filter, typeFilter, priorityFilter]);

  // Suscripción a cambios en tiempo real
  useEffect(() => {
    if (!notificationsEnabled) return;

    const subscription = suscribirseAAlertas((nuevaAlerta) => {
      // Mostrar notificación del navegador
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Nueva Alerta: ${nuevaAlerta.tipo_alerta}`, {
          body: nuevaAlerta.mensaje,
          icon: '/alert-icon.png',
        });
      }

      // Recargar alertas
      cargarAlertas();
      cargarEstadisticas();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [notificationsEnabled]);

  // Habilitar notificaciones
  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      // Pedir permiso
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
        } else {
          alert('Permiso de notificaciones denegado');
        }
      } else {
        alert('Notificaciones no soportadas en este navegador');
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const alertDate = new Date(date);
    const diffMs = now - alertDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return alertDate.toLocaleDateString('es-CO');
  };

  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case 'critica':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'alta':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'media':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getPriorityBadge = (prioridad) => {
    const colors = {
      critica: 'bg-red-100 text-red-800',
      alta: 'bg-orange-100 text-orange-800',
      media: 'bg-yellow-100 text-yellow-800',
      baja: 'bg-blue-100 text-blue-800',
    };
    return colors[prioridad] || colors.baja;
  };

  const handleMarcarVista = async (alertaId) => {
    await marcarAlertaComoVista(alertaId);
    cargarAlertas();
    cargarEstadisticas();
  };

  const handleResolver = async (alertaId) => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    await resolverAlerta(alertaId, user.username || 'Usuario');
    cargarAlertas();
    cargarEstadisticas();
  };

  const handleIgnorar = async (alertaId) => {
    await ignorarAlerta(alertaId);
    cargarAlertas();
    cargarEstadisticas();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Centro de Alertas
            </h1>
            <p className="text-sm text-gray-600">
              Gestiona y monitorea alertas operacionales en tiempo real
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              autoRefresh
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <RefreshCw
              className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`}
            />
            Auto
          </button>
          <button
            onClick={toggleNotifications}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              notificationsEnabled
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {notificationsEnabled ? (
              <Bell className="w-4 h-4" />
            ) : (
              <BellOff className="w-4 h-4" />
            )}
            Notif
          </button>
          <button
            onClick={() => {
              cargarAlertas();
              cargarEstadisticas();
            }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={() => (window.location.href = '/alertas/configuracion')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            <Settings className="w-4 h-4" />
            Configurar
          </button>
        </div>
      </div>

      {/* Última actualización */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        Última actualización: {formatTime(lastUpdate)} •{' '}
        {autoRefresh ? 'Auto-refresh cada 10s' : 'Auto-refresh desactivado'}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Pendientes</p>
              <p className="text-3xl font-bold text-red-900">
                {stats.pendientes}
              </p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 font-medium">Vistas</p>
              <p className="text-3xl font-bold text-yellow-900">
                {stats.vistas}
              </p>
            </div>
            <Eye className="w-10 h-10 text-yellow-400" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Resueltas</p>
              <p className="text-3xl font-bold text-green-900">
                {stats.resueltas}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Críticas</p>
              <p className="text-3xl font-bold text-blue-900">
                {stats.criticas}
              </p>
            </div>
            <AlertTriangle className="w-10 h-10 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="font-semibold text-gray-700">Filtros</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Todas">Todas</option>
              <option value="pendiente">Pendientes</option>
              <option value="vista">Vistas</option>
              <option value="resuelta">Resueltas</option>
              <option value="ignorada">Ignoradas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Alerta
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>Todas</option>
              <option>Velocidad Excesiva</option>
              <option>Parada Prolongada</option>
              <option>Combustible Bajo</option>
              <option>Mantenimiento Vencido</option>
              <option>Licencia Vencida</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridad
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>Todas</option>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="bg-white border rounded-xl">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Cargando alertas...</p>
          </div>
        ) : alertas.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <p className="text-gray-600">
              No hay alertas que coincidan con los filtros
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {alertas.map((alerta) => {
              const Icon = ALERT_ICONS[alerta.tipo_alerta] || AlertTriangle;
              return (
                <div
                  key={alerta.id}
                  className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${getPriorityColor(alerta.nivel_prioridad)}`}
                >
                  <div className="flex items-start gap-4">
                    <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {alerta.tipo_alerta
                              .replace(/_/g, ' ')
                              .toUpperCase()}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {alerta.mensaje}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded ${getPriorityBadge(alerta.nivel_prioridad)}`}
                        >
                          {alerta.nivel_prioridad}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Car className="w-3 h-3" />
                          {alerta.vehiculo?.placa || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(alerta.fecha_alerta)}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 rounded">
                          {alerta.estado}
                        </span>
                      </div>

                      {alerta.estado === 'pendiente' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleMarcarVista(alerta.id)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
                          >
                            <Eye className="w-3 h-3 inline mr-1" />
                            Marcar vista
                          </button>
                          <button
                            onClick={() => handleResolver(alerta.id)}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded"
                          >
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                            Resolver
                          </button>
                          <button
                            onClick={() => handleIgnorar(alerta.id)}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded"
                          >
                            <XCircle className="w-3 h-3 inline mr-1" />
                            Ignorar
                          </button>
                        </div>
                      )}

                      {alerta.estado === 'vista' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResolver(alerta.id)}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded"
                          >
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                            Resolver
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
