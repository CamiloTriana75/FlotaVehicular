import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  RefreshCw,
  Bell,
  BellOff,
  Clock,
  Car,
  TrendingUp,
  MapPin,
  Gauge,
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
  combustible_bajo: TrendingUp,
  mantenimiento_vencido: Clock,
  licencia_vencida: AlertTriangle,
  parada_no_autorizada: MapPin,
  falla_sistema: XCircle,
};

// Mapeo de colores por prioridad
const PRIORITY_COLORS = {
  critica: 'bg-red-100 text-red-800 border-red-300',
  alta: 'bg-orange-100 text-orange-800 border-orange-300',
  media: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  baja: 'bg-blue-100 text-blue-800 border-blue-300',
};

// Mapeo de colores por estado
const STATUS_COLORS = {
  pendiente: 'bg-red-50 border-red-200',
  vista: 'bg-yellow-50 border-yellow-200',
  resuelta: 'bg-green-50 border-green-200',
  ignorada: 'bg-gray-50 border-gray-200',
};

const AlertCenter = () => {
  const [alertas, setAlertas] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    estado: 'pendiente',
    tipo_alerta: '',
    prioridad: '',
  });
  const [notificacionesHabilitadas, setNotificacionesHabilitadas] =
    useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [autoRefreshActivo, setAutoRefreshActivo] = useState(true);

  // Cargar alertas y estadísticas
  const cargarAlertas = async () => {
    setLoading(true);
    const { data } = await obtenerAlertas(filtros);
    setAlertas(data || []);
    setUltimaActualizacion(new Date());
    setLoading(false);
  };

  const cargarEstadisticas = async () => {
    const { data } = await obtenerEstadisticasAlertas();
    setEstadisticas(data || {});
  };

  const handleRefreshManual = () => {
    cargarAlertas();
    cargarEstadisticas();
  };

  useEffect(() => {
    cargarAlertas();
    cargarEstadisticas();
  }, [filtros]);

  // Auto-refresh cada 10 segundos
  useEffect(() => {
    if (!autoRefreshActivo) return;

    const intervalId = setInterval(() => {
      console.log('🔄 Auto-actualizando alertas y estadísticas...');
      cargarAlertas();
      cargarEstadisticas();
    }, 10000); // 10 segundos

    return () => clearInterval(intervalId);
  }, [filtros, autoRefreshActivo]); // Se reinicia si cambian los filtros o el estado de auto-refresh

  // Helper: enriquecer alerta con datos de vehículo si vienen vacíos (realtime INSERT no trae join)
  const enrichAlertWithVehicle = async (alerta) => {
    if (alerta && alerta.vehicle_id && !alerta.vehicles) {
      try {
        const { data: vehiculo, error } = await supabase
          .from('vehicles')
          .select('id, placa, marca, modelo')
          .eq('id', alerta.vehicle_id)
          .single();
        if (!error && vehiculo) {
          return { ...alerta, vehicles: vehiculo };
        }
      } catch {}
    }
    return alerta;
  };

  // Suscripción a nuevas alertas en tiempo real
  useEffect(() => {
    if (!notificacionesHabilitadas) return;

    const subscription = suscribirseAAlertas(async (nuevaAlerta) => {
      const alertaEnriquecida = await enrichAlertWithVehicle(nuevaAlerta);
      // Agregar nueva alerta si cumple con filtros
      if (!filtros.estado || alertaEnriquecida.estado === filtros.estado) {
        setAlertas((prev) => [alertaEnriquecida, ...prev]);
      }

      // Mostrar notificación del navegador
      if ('Notification' in window && Notification.permission === 'granted') {
        const prioridadEmoji = {
          critica: '🚨',
          alta: '⚠️',
          media: '⚡',
          baja: 'ℹ️',
        };

        const tipoEmoji = {
          velocidad_excesiva: '🏎️',
          parada_prolongada: '⏸️',
          combustible_bajo: '⛽',
          mantenimiento_vencido: '🔧',
        };

        // Construir información detallada
        const vehiculoInfo = alertaEnriquecida.vehicles
          ? `${alertaEnriquecida.vehicles.placa} - ${alertaEnriquecida.vehicles.marca} ${alertaEnriquecida.vehicles.modelo}`
          : 'Vehículo desconocido';

        const conductorInfo = alertaEnriquecida.drivers
          ? `\n👤 ${nuevaAlerta.drivers.nombre} ${nuevaAlerta.drivers.apellido}`
          : '';

        const velocidadInfo = alertaEnriquecida.metadata?.velocidad_actual
          ? `\n🏎️ ${alertaEnriquecida.metadata.velocidad_actual} km/h`
          : '';

        const duracionInfo = alertaEnriquecida.metadata?.duracion_segundos
          ? `\n⏱️ ${Math.floor(alertaEnriquecida.metadata.duracion_segundos / 60)}m ${alertaEnriquecida.metadata.duracion_segundos % 60}s`
          : '';

        const fechaHora = new Date(
          alertaEnriquecida.fecha_alerta
        ).toLocaleTimeString('es-ES');

        const titulo = `${prioridadEmoji[alertaEnriquecida.nivel_prioridad]} ${tipoEmoji[alertaEnriquecida.tipo_alerta] || ''} ${alertaEnriquecida.tipo_alerta.replace(/_/g, ' ').toUpperCase()}`;
        const cuerpo = `🚗 ${vehiculoInfo}${conductorInfo}\n📝 ${alertaEnriquecida.mensaje}${velocidadInfo}${duracionInfo}\n🕐 ${fechaHora}`;

        const notification = new Notification(titulo, {
          body: cuerpo,
          icon: '/logo.png',
          badge: '/logo.png',
          tag: `alert-${alertaEnriquecida.id}`,
          requireInteraction: alertaEnriquecida.nivel_prioridad === 'critica',
          vibrate:
            alertaEnriquecida.nivel_prioridad === 'critica'
              ? [300, 100, 300, 100, 300]
              : alertaEnriquecida.nivel_prioridad === 'alta'
                ? [200, 100, 200]
                : [100],
          silent: false,
        });

        // Auto-cerrar según prioridad
        if (alertaEnriquecida.nivel_prioridad === 'alta') {
          setTimeout(() => notification.close(), 10000);
        } else if (alertaEnriquecida.nivel_prioridad !== 'critica') {
          setTimeout(() => notification.close(), 5000);
        }

        // Click para enfocar ventana
        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Reproducir sonido según prioridad
        try {
          const audio = new Audio('/notification.mp3');
          audio.volume =
            { critica: 0.8, alta: 0.6, media: 0.4, baja: 0.2 }[
              alertaEnriquecida.nivel_prioridad
            ] || 0.4;
          audio.play().catch(() => console.log('🔇 Sonido bloqueado'));
        } catch (e) {}
      }

      // Actualizar estadísticas
      cargarEstadisticas();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [filtros, notificacionesHabilitadas]);

  // Solicitar permiso para notificaciones
  const solicitarPermisoNotificaciones = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('✅ Notificaciones habilitadas');
        // Mostrar notificación de confirmación
        new Notification('✅ Notificaciones activadas', {
          body: 'Recibirás alertas en tiempo real del sistema',
          icon: '/logo.png',
          badge: '/logo.png',
          vibrate: [200, 100, 200],
          requireInteraction: false,
        });
      }
    }
  };

  useEffect(() => {
    solicitarPermisoNotificaciones();
  }, []);

  // Acciones sobre alertas
  const handleMarcarVista = async (alertaId) => {
    await marcarAlertaComoVista(alertaId);
    cargarAlertas();
  };

  const handleResolver = async (alertaId) => {
    const usuario = 'Admin'; // TODO: Obtener del auth context
    await resolverAlerta(alertaId, usuario);
    cargarAlertas();
    cargarEstadisticas();
  };

  const handleIgnorar = async (alertaId) => {
    await ignorarAlerta(alertaId);
    cargarAlertas();
    cargarEstadisticas();
  };

  // Renderizar tarjeta de alerta
  const renderAlertCard = (alerta) => {
    const IconComponent = ALERT_ICONS[alerta.tipo_alerta] || AlertTriangle;
    const priorityClass =
      PRIORITY_COLORS[alerta.nivel_prioridad] || PRIORITY_COLORS.media;
    const statusClass = STATUS_COLORS[alerta.estado] || STATUS_COLORS.pendiente;

    return (
      <div
        key={alerta.id}
        className={`border-l-4 p-4 rounded-lg shadow-sm ${statusClass}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className={`p-2 rounded-full ${priorityClass}`}>
              <IconComponent className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900">
                  {alerta.vehicles?.placa || 'Vehículo desconocido'}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityClass}`}
                >
                  {alerta.nivel_prioridad.toUpperCase()}
                </span>
              </div>

              <p className="text-sm text-gray-700 mb-2">{alerta.mensaje}</p>

              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Car className="w-3 h-3" />
                  <span>{alerta.vehicles?.modelo || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(alerta.fecha_alerta).toLocaleString()}</span>
                </div>
                {alerta.drivers && (
                  <div className="flex items-center space-x-1">
                    <span>
                      {alerta.drivers.nombre} {alerta.drivers.apellido}
                    </span>
                  </div>
                )}
              </div>

              {alerta.estado === 'resuelta' && alerta.resuelto_por && (
                <div className="mt-2 text-xs text-green-600">
                  ✓ Resuelta por {alerta.resuelto_por} el{' '}
                  {new Date(alerta.fecha_resolucion).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Acciones */}
          {alerta.estado === 'pendiente' && (
            <div className="flex flex-col space-y-2 ml-4">
              <button
                onClick={() => handleMarcarVista(alerta.id)}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                title="Marcar como vista"
              >
                <Eye className="w-4 h-4" />
                <span>Vista</span>
              </button>
              <button
                onClick={() => handleResolver(alerta.id)}
                className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                title="Resolver"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Resolver</span>
              </button>
              <button
                onClick={() => handleIgnorar(alerta.id)}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                title="Ignorar"
              >
                <XCircle className="w-4 h-4" />
                <span>Ignorar</span>
              </button>
            </div>
          )}

          {alerta.estado === 'vista' && (
            <div className="flex flex-col space-y-2 ml-4">
              <button
                onClick={() => handleResolver(alerta.id)}
                className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Resolver</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
            <span>Centro de Alertas</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona y monitorea alertas operacionales en tiempo real
          </p>
          {ultimaActualizacion && (
            <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>
                Última actualización: {ultimaActualizacion.toLocaleTimeString()}
              </span>
              {autoRefreshActivo && (
                <span className="ml-2 text-green-600 flex items-center space-x-1">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span>Auto-refresh cada 10s</span>
                </span>
              )}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefreshActivo(!autoRefreshActivo)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              autoRefreshActivo
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            title={
              autoRefreshActivo
                ? 'Desactivar auto-actualización'
                : 'Activar auto-actualización'
            }
          >
            <RefreshCw
              className={`w-5 h-5 ${autoRefreshActivo ? 'animate-spin' : ''}`}
            />
            <span>{autoRefreshActivo ? 'Auto' : 'Manual'}</span>
          </button>

          <button
            onClick={() =>
              setNotificacionesHabilitadas(!notificacionesHabilitadas)
            }
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              notificacionesHabilitadas
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            title={
              notificacionesHabilitadas
                ? 'Desactivar notificaciones'
                : 'Activar notificaciones'
            }
          >
            {notificacionesHabilitadas ? (
              <>
                <Bell className="w-5 h-5" />
                <span>Notif</span>
              </>
            ) : (
              <>
                <BellOff className="w-5 h-5" />
                <span>Notif</span>
              </>
            )}
          </button>

          <button
            onClick={handleRefreshManual}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Pendientes</p>
              <p className="text-2xl font-bold text-red-700">
                {estadisticas.porEstado?.pendiente || 0}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Vistas</p>
              <p className="text-2xl font-bold text-yellow-700">
                {estadisticas.porEstado?.vista || 0}
              </p>
            </div>
            <Eye className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Resueltas</p>
              <p className="text-2xl font-bold text-green-700">
                {estadisticas.porEstado?.resuelta || 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Críticas</p>
              <p className="text-2xl font-bold text-blue-700">
                {estadisticas.porPrioridad?.critica || 0}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-900">Filtros</h2>
          </div>
          <a
            href="/alertas/config"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Settings className="w-4 h-4" />
            <span>Configurar Reglas</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filtros.estado}
              onChange={(e) =>
                setFiltros({ ...filtros, estado: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendientes</option>
              <option value="vista">Vistas</option>
              <option value="resuelta">Resueltas</option>
              <option value="ignorada">Ignoradas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Alerta
            </label>
            <select
              value={filtros.tipo_alerta}
              onChange={(e) =>
                setFiltros({ ...filtros, tipo_alerta: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              <option value="velocidad_excesiva">Velocidad Excesiva</option>
              <option value="parada_prolongada">Parada Prolongada</option>
              <option value="combustible_bajo">Combustible Bajo</option>
              <option value="mantenimiento_vencido">
                Mantenimiento Vencido
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad
            </label>
            <select
              value={filtros.prioridad}
              onChange={(e) =>
                setFiltros({ ...filtros, prioridad: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Alertas */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Cargando alertas...</p>
          </div>
        ) : alertas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-600">
              No hay alertas que coincidan con los filtros
            </p>
          </div>
        ) : (
          alertas.map(renderAlertCard)
        )}
      </div>
    </div>
  );
};

export default AlertCenter;
