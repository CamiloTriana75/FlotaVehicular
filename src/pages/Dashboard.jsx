import React, { useEffect, useMemo, useState } from 'react';
import { mockVehicles, mockDrivers } from '../data/mockVehicles'; // TODO: Reemplazar datos mock por fuente real cuando esté disponible
import { mockMaintenanceOrders } from '../data/mockMaintenance';
import Card from '../components/Card';
import { Link } from 'react-router-dom';
import MapViewer from '../components/MapViewer';
import {
  Truck,
  Users,
  MapPin,
  AlertTriangle,
  Wrench,
  TrendingUp,
  Clock,
  Activity,
  Zap,
  Shield,
  DollarSign,
  Gauge,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { getIncidentNotifications } from '../services/incidentNotificationService';
import { supabase } from '../lib/supabaseClient';

const Dashboard = () => {
  const [incidentNotifications, setIncidentNotifications] = useState([]);
  const [incidentLoading, setIncidentLoading] = useState(true);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [filters, setFilters] = useState({
    period: '30d',
    vehicleId: 'all',
  });

  // Fetch incident notifications
  useEffect(() => {
    (async () => {
      const { data } = await getIncidentNotifications({ limit: 5 });
      setIncidentNotifications(data || []);
      setIncidentLoading(false);
    })();
  }, []);

  // Fetch maintenance orders from Supabase
  useEffect(() => {
    (async () => {
      try {
        setDataLoading(true);

        // Calcular rango de fechas según filtro
        const end = new Date();
        const start = new Date();
        switch (filters.period) {
          case '7d':
            start.setDate(end.getDate() - 7);
            break;
          case '30d':
            start.setDate(end.getDate() - 30);
            break;
          case '90d':
            start.setDate(end.getDate() - 90);
            break;
          case '1y':
            start.setFullYear(end.getFullYear() - 1);
            break;
          default:
            start.setMonth(end.getMonth() - 1);
        }

        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];

        // Fetch maintenance orders - try with error handling
        try {
          let maintenanceQuery = supabase
            .from('maintenance_orders')
            .select('*')
            .gte('execution_date', startStr)
            .lte('execution_date', endStr);

          if (filters.vehicleId !== 'all') {
            maintenanceQuery = maintenanceQuery.eq(
              'vehicle_id',
              parseInt(filters.vehicleId)
            );
          }

          const { data: maintData, error: maintError } = await maintenanceQuery;

          if (maintError) {
            console.warn('⚠️ Warning fetching maintenance orders:', maintError);
            // Fallback to empty array - will use mock data in useMemo
            setMaintenanceData([]);
          } else if (maintData && maintData.length > 0) {
            console.log(
              '✅ Maintenance orders fetched successfully:',
              maintData.length,
              'records'
            );
            setMaintenanceData(maintData);
          } else {
            console.info('ℹ️ No maintenance orders found for period');
            setMaintenanceData([]);
          }
        } catch (maintError) {
          console.warn('⚠️ Exception fetching maintenance orders:', maintError);
          setMaintenanceData([]);
        }

        setDataLoading(false);
      } catch (error) {
        console.error('Error in dashboard data fetch:', error);
        setDataLoading(false);
      }
    })();
  }, [filters]);

  const vehicleOptions = useMemo(
    () => [
      { id: 'all', label: 'Todos los vehículos' },
      ...mockVehicles.map((v) => ({
        id: String(v.id),
        label: `${v.placa} - ${v.modelo}`,
      })),
    ],
    []
  );

  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    switch (filters.period) {
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      case '90d':
        start.setDate(end.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        start.setMonth(end.getMonth() - 1);
    }
    return { start, end };
  }, [filters.period]);

  const filteredMaintenance = useMemo(() => {
    // Use real data if available, fallback to mock
    const dataSource =
      maintenanceData.length > 0 ? maintenanceData : mockMaintenanceOrders;
    return dataSource.filter((order) => {
      const orderDate =
        order.execution_date || order.actualDate || order.scheduledDate;
      const d = new Date(orderDate);
      const matchVehicle =
        filters.vehicleId === 'all' ||
        String(order.vehicle_id) === filters.vehicleId;
      return matchVehicle && d >= dateRange.start && d <= dateRange.end;
    });
  }, [maintenanceData, filters.vehicleId, dateRange]);

  const maintenanceTotals = useMemo(() => {
    let total = 0;
    let orderCount = 0;
    filteredMaintenance.forEach((o) => {
      // Real database structure: labor_hours, labor_rate, parts_cost, other_costs
      const parts =
        o.parts_cost ||
        (o.parts || []).reduce(
          (sum, p) => sum + (p.unitCost || 0) * (p.quantity || 1),
          0
        );
      const labor = (o.labor_hours || 0) * (o.labor_rate || 0);
      const other = o.other_costs || 0;
      total += parts + labor + other;
      orderCount += 1;
    });
    return {
      cost: Math.round(total),
      count: orderCount,
    };
  }, [filteredMaintenance]);

  const maintenanceStatus = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let scheduled = 0;

    filteredMaintenance.forEach((o) => {
      const status = o.status?.toLowerCase() || 'scheduled';
      if (status.includes('completad') || status.includes('completed')) {
        completed += 1;
      } else if (status.includes('progreso') || status.includes('progress')) {
        inProgress += 1;
      } else {
        scheduled += 1;
      }
    });

    return { completed, inProgress, scheduled };
  }, [filteredMaintenance]);

  const routeEfficiency = useMemo(() => {
    // Calcula eficiencia basada en cumplimiento de órdenes
    if (filteredMaintenance.length === 0) return 85;

    const { completed } = maintenanceStatus;
    const totalOrders = filteredMaintenance.length;

    // Escala: si se completó el 100% de órdenes = 100%, 0% = 0%
    const efficiency = Math.round((completed / totalOrders) * 100);

    return efficiency;
  }, [filteredMaintenance, maintenanceStatus]);

  const trendMaintenance = useMemo(() => {
    const map = {};
    filteredMaintenance.forEach((m) => {
      const day = m.execution_date || m.actualDate || m.scheduledDate;
      const parts =
        m.parts_cost ||
        (m.parts || []).reduce(
          (sum, p) => sum + (p.unitCost || 0) * (p.quantity || 1),
          0
        );
      const labor = (m.labor_hours || 0) * (m.labor_rate || 0);
      const other = m.other_costs || 0;
      const total = parts + labor + other;
      map[day] = (map[day] || 0) + total;
    });
    return Object.entries(map)
      .map(([date, cost]) => ({ date, cost }))
      .sort((a, b) => (a.date > b.date ? 1 : -1))
      .slice(-10);
  }, [filteredMaintenance]);

  const trendMaintenanceCount = useMemo(() => {
    const map = {};
    filteredMaintenance.forEach((m) => {
      const day = m.execution_date || m.actualDate || m.scheduledDate;
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => (a.date > b.date ? 1 : -1))
      .slice(-10);
  }, [filteredMaintenance]);

  const vehiculosActivos = mockVehicles.filter(
    (v) => v.status === 'activo'
  ).length;
  const vehiculosTotal = mockVehicles.length;
  const conductoresActivos = mockDrivers.filter(
    (d) => d.estado === 'activo'
  ).length;

  const vehiculosRecientes = mockVehicles.slice(0, 4);
  const alertas = [
    {
      id: 1,
      tipo: 'critica',
      titulo: 'Consumo alto',
      descripcion: 'Vehículo ABC-123 excede 12 L/100km',
      tiempo: '5 min',
    },
    {
      id: 2,
      tipo: 'advertencia',
      titulo: 'Mantenimiento programado',
      descripcion: 'Vehículo JKL-012 vence en 7 días',
      tiempo: '2 horas',
    },
    {
      id: 3,
      tipo: 'info',
      titulo: 'Rutas eficientes',
      descripcion: 'Vehículo GHI-789 mantiene eficiencia 18 km/L',
      tiempo: '1 hora',
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
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard operativo
          </h1>
          <p className="text-gray-600 mt-1">
            KPIs de eficiencia de rutas, consumo y costos de mantenimiento
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-500" />
            <span>Sistema en línea</span>
          </div>
          <div>
            Última actualización: {new Date().toLocaleTimeString('es-ES')}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <Filter className="w-4 h-4" /> Filtros del dashboard
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <select
            value={filters.period}
            onChange={(e) =>
              setFilters((f) => ({ ...f, period: e.target.value }))
            }
            className="px-3 py-2 border rounded-lg"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="1y">Último año</option>
          </select>
          <select
            value={filters.vehicleId}
            onChange={(e) =>
              setFilters((f) => ({ ...f, vehicleId: e.target.value }))
            }
            className="px-3 py-2 border rounded-lg"
          >
            {vehicleOptions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Órdenes de Mantenimiento</p>
            <p className="text-3xl font-bold text-gray-900">
              {dataLoading ? '-' : maintenanceTotals.count}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Período: {filters.period}
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <Wrench className="w-6 h-6 text-blue-600" />
          </div>
        </Card>
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Costo Total Mantenimiento</p>
            <p className="text-3xl font-bold text-gray-900">
              {dataLoading
                ? '-'
                : `$${maintenanceTotals.cost.toLocaleString('es-CO')}`}
            </p>
            <p className="text-xs text-gray-500 mt-1">Inversión operacional</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg">
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
        </Card>
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Eficiencia Mantenimiento</p>
            <p className="text-3xl font-bold text-gray-900">
              {dataLoading ? '-' : `${routeEfficiency}%`}
            </p>
            <p className="text-xs text-gray-500 mt-1">Órdenes completadas</p>
          </div>
          <div className="p-3 bg-violet-50 rounded-lg">
            <Gauge className="w-6 h-6 text-violet-600" />
          </div>
        </Card>
      </div>

      {/* Gráficas de tendencia */}
      {dataLoading ? (
        <Card className="p-6 text-center text-gray-500">
          Cargando gráficas...
        </Card>
      ) : trendMaintenance.length === 0 &&
        trendMaintenanceCount.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          Sin datos disponibles para el período seleccionado
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-gray-800 font-semibold">
                <Wrench className="w-4 h-4" /> Costo de Mantenimiento
              </div>
              <span className="text-xs text-gray-500">
                {trendMaintenance.length} puntos
              </span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendMaintenance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `$${value.toLocaleString('es-CO')}`}
                  />
                  <Bar
                    dataKey="cost"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                    name="Costo"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-gray-800 font-semibold">
                <Activity className="w-4 h-4" /> Cantidad de Órdenes
              </div>
              <span className="text-xs text-gray-500">
                {trendMaintenanceCount.length} puntos
              </span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendMaintenanceCount}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Órdenes"
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

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
