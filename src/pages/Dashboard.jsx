import React, { useEffect, useState } from 'react';
import { mockVehicles, mockDrivers } from '../data/mockVehicles'; // TODO: Reemplazar datos mock por fuente real cuando esté disponible
import Card from '../components/Card';
import { Link } from 'react-router-dom';
import MapViewer from '../components/MapViewer';
import {
  Truck,
  Users,
  MapPin,
  AlertTriangle,
  Fuel,
  Wrench,
  TrendingUp,
  Clock,
  Activity,
  Zap,
  Shield,
} from 'lucide-react';
import { getIncidentNotifications } from '../services/incidentNotificationService';

const Dashboard = () => {
  const [incidentNotifications, setIncidentNotifications] = useState([]);
  const [incidentLoading, setIncidentLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await getIncidentNotifications({ limit: 5 });
      setIncidentNotifications(data || []);
      setIncidentLoading(false);
    })();
  }, []);
  const vehiculosActivos = mockVehicles.filter(
    (v) => v.status === 'activo'
  ).length;
  const vehiculosTotal = mockVehicles.length;
  const conductoresActivos = mockDrivers.filter(
    (d) => d.estado === 'activo'
  ).length;
  const vehiculosMantenimiento = mockVehicles.filter(
    (v) => v.status === 'mantenimiento'
  ).length;
  const vehiculosEstacionados = mockVehicles.filter(
    (v) => v.status === 'estacionado'
  ).length;
  const consumoPromedio =
    mockVehicles.reduce((acc, v) => acc + v.combustible, 0) /
    mockVehicles.length;

  const kpis = [
    {
      title: 'Vehículos Activos',
      value: vehiculosActivos,
      total: vehiculosTotal,
      icon: Truck,
      color: 'from-green-500 to-emerald-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+12%',
      changeType: 'positive',
    },
    {
      title: 'Conductores Activos',
      value: conductoresActivos,
      total: mockDrivers.length,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+8%',
      changeType: 'positive',
    },
    {
      title: 'En Mantenimiento',
      value: vehiculosMantenimiento,
      total: vehiculosTotal,
      icon: Wrench,
      color: 'from-orange-500 to-amber-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '-5%',
      changeType: 'negative',
    },
    {
      title: 'Eficiencia de Combustible',
      value: Math.round(consumoPromedio),
      total: 100,
      icon: Fuel,
      color: 'from-purple-500 to-violet-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+3%',
      changeType: 'positive',
      unit: '%',
    },
  ];

  const vehiculosRecientes = mockVehicles.slice(0, 4);
  const alertas = [
    {
      id: 1,
      tipo: 'critica',
      titulo: 'Combustible bajo',
      descripcion: 'Vehículo JKL-012 - 15% restante',
      tiempo: '5 min',
    },
    {
      id: 2,
      tipo: 'advertencia',
      titulo: 'Mantenimiento programado',
      descripcion: 'Vehículo ABC-123 - Próxima semana',
      tiempo: '2 horas',
    },
    {
      id: 3,
      tipo: 'info',
      titulo: 'Nueva ubicación',
      descripcion: 'Vehículo GHI-789 - Centro de la ciudad',
      tiempo: '1 hora',
    },
    {
      id: 4,
      tipo: 'critica',
      titulo: 'Exceso de velocidad',
      descripcion: 'Vehículo MNO-345 - 85 km/h en zona escolar',
      tiempo: '10 min',
    },
  ];

  const getAlertIcon = (tipo) => {
    switch (tipo) {
      case 'critica':
        return AlertTriangle;
      case 'advertencia':
        return Clock;
      case 'info':
        return MapPin;
      default:
        return Activity;
    }
  };

  const getAlertStyles = (tipo) => {
    switch (tipo) {
      case 'critica':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'advertencia':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const [loading] = React.useState(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Resumen general de la flota vehicular
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Activity className="w-4 h-4 text-green-500" />
            <span>Sistema en línea</span>
          </div>
          <div className="text-sm text-gray-500">
            Última actualización: {new Date().toLocaleTimeString('es-ES')}
          </div>
        </div>
      </div>

      {/* Notificaciones de incidentes en tiempo real */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Notificaciones de incidentes
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              Últimas alertas recibidas con ubicación y estado de envío
            </p>
          </div>
          <Link
            to="/incidentes"
            className="text-sm text-blue-600 hover:underline"
          >
            Ver incidentes
          </Link>
        </div>

        {incidentLoading ? (
          <div className="text-sm text-gray-500">
            Cargando notificaciones...
          </div>
        ) : incidentNotifications.length === 0 ? (
          <div className="text-sm text-gray-500">
            Sin notificaciones recientes
          </div>
        ) : (
          <div className="space-y-3">
            {incidentNotifications.slice(0, 3).map((n) => {
              const payload = n.payload || {};
              const mapUrl =
                typeof payload.location_lat === 'number' &&
                typeof payload.location_lng === 'number'
                  ? `https://www.google.com/maps?q=${payload.location_lat},${payload.location_lng}`
                  : payload.location
                    ? `https://www.google.com/maps?q=${encodeURIComponent(payload.location)}`
                    : null;

              return (
                <div
                  key={n.id}
                  className="flex items-start justify-between border rounded-lg p-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {payload.title || 'Incidente reportado'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {payload.type || 'incidente'} • Severidad:{' '}
                      {payload.severity || 'N/D'}
                    </div>
                    {mapUrl ? (
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 underline"
                      >
                        Abrir mapa
                      </a>
                    ) : null}
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div className="font-medium text-gray-700">{n.channel}</div>
                    <div
                      className={
                        n.status === 'sent'
                          ? 'text-green-600'
                          : n.status === 'failed'
                            ? 'text-red-600'
                            : 'text-gray-600'
                      }
                    >
                      {n.status}
                    </div>
                    <div>
                      {new Date(n.created_at).toLocaleTimeString('es-ES')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card
            key={index}
            className="p-6 hover:shadow-lg transition-shadow duration-200"
            aria-label={`KPI ${kpi.title}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.color}`}>
                <kpi.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <span
                  className={`text-sm font-medium ${
                    kpi.changeType === 'positive'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {kpi.change}
                </span>
                <p className="text-xs text-gray-500">vs mes anterior</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
                <span className="text-lg text-gray-500">
                  /{kpi.total}
                  {kpi.unit || ''}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progreso</span>
                <span>{Math.round((kpi.value / kpi.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${kpi.color}`}
                  style={{
                    width: `${Math.min((kpi.value / kpi.total) * 100, 100)}%`,
                  }}
                />
              </div>
              <div className="mt-3 text-right">
                <Link
                  to={
                    kpi.title === 'Vehículos Activos'
                      ? '/vehiculos'
                      : kpi.title === 'Conductores Activos'
                        ? '/conductores'
                        : kpi.title === 'En Mantenimiento'
                          ? '/mantenimiento'
                          : '/reportes'
                  }
                  className="text-sm text-blue-600 hover:underline"
                >
                  Ver detalle
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehículos Activos */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Vehículos Activos
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Truck className="w-4 h-4" />
              <span>
                {vehiculosActivos} de {vehiculosTotal}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {vehiculosRecientes.map((vehiculo) => (
              <div
                key={vehiculo.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      vehiculo.status === 'activo'
                        ? 'bg-green-500'
                        : vehiculo.status === 'estacionado'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      <Link
                        to={`/vehiculos/${vehiculo.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {vehiculo.placa}
                      </Link>
                    </p>
                    <p className="text-sm text-gray-600">{vehiculo.modelo}</p>
                    <p className="text-xs text-gray-500">
                      {vehiculo.conductor}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      vehiculo.status === 'activo'
                        ? 'bg-green-100 text-green-800'
                        : vehiculo.status === 'estacionado'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {vehiculo.status}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    {vehiculo.speed} km/h
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Alertas y Notificaciones */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Alertas</h2>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-600">
                {alertas.filter((a) => a.tipo === 'critica').length}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {alertas.map((alerta) => {
              const Icon = getAlertIcon(alerta.tipo);
              return (
                <div
                  key={alerta.id}
                  className={`flex items-start p-4 rounded-xl border-l-4 ${getAlertStyles(alerta.tipo)}`}
                >
                  <Icon className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{alerta.titulo}</p>
                    <p className="text-xs mt-1 opacity-80">
                      {alerta.descripcion}
                    </p>
                    <p className="text-xs mt-2 opacity-60">{alerta.tiempo}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Mapa de Flota */}
        <Card className="p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Vista de Flota
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>Bogotá, Colombia</span>
            </div>
          </div>

          <div className="h-80 rounded-xl overflow-hidden">
            {loading ? (
              <div
                className="w-full h-full animate-pulse bg-gray-100"
                aria-busy="true"
              />
            ) : (
              <MapViewer
                vehicles={mockVehicles}
                center={[4.711, -74.0721]}
                zoom={11}
              />
            )}
          </div>
        </Card>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Eficiencia de Rutas
              </p>
              <p className="text-2xl font-bold text-gray-900">94.2%</p>
              <p className="text-xs text-green-600">+2.1% este mes</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Ahorro de Combustible
              </p>
              <p className="text-2xl font-bold text-gray-900">15.3%</p>
              <p className="text-xs text-green-600">+3.2% este mes</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Seguridad</p>
              <p className="text-2xl font-bold text-gray-900">99.8%</p>
              <p className="text-xs text-green-600">Sin incidentes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Acceso rápido a gestión de usuarios */}
      <div className="grid grid-cols-1">
        <Card className="p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Gestión de Usuarios
            </h2>
            <p className="text-gray-600 mt-1">
              Administra usuarios y roles del sistema.
            </p>
          </div>
          <Link
            to="/usuarios"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Ir a Usuarios
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
