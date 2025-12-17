import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { driverService } from '../services/driverService';
import Card from '../components/Card';
import {
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { HR_CONFIG } from '../shared/constants';

/**
 * Dashboard específico para el rol RRHH
 * Muestra KPIs y accesos rápidos a gestión de conductores
 */
const RRHHDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    disponibles: 0,
    licenciasVenciendo: 0,
  });
  const [conductoresRecientes, setConductoresRecientes] = useState([]);
  const [licenciasProximas, setLicenciasProximas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Obtener todos los conductores desde la tabla drivers
      const { data: conductores } = await driverService.getAll();

      console.log(
        '🔍 RRHH Dashboard - Conductores cargados:',
        conductores?.length
      );
      if (conductores && conductores.length > 0) {
        console.log('Muestra de conductor:', conductores[0]);
      }

      // Calcular estadísticas
      const total = conductores?.length || 0;
      const activos =
        conductores?.filter(
          (c) => c.estado === 'activo' || c.estado === 'en_servicio'
        ).length || 0;
      const disponibles =
        conductores?.filter((c) => c.estado === 'disponible').length || 0;

      // Licencias próximas a vencer (threshold configurable)
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const thresholdDays = HR_CONFIG.LICENSE_EXPIRY_THRESHOLD_DAYS;
      const enThresholdDias = new Date();
      enThresholdDias.setDate(hoy.getDate() + thresholdDays);

      const licenciasVenciendo =
        conductores?.filter((c) => {
          if (!c.fecha_vencimiento_licencia) return false;
          const fecha = new Date(c.fecha_vencimiento_licencia);
          const dias = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
          return dias >= 0 && dias <= thresholdDays;
        }).length || 0;

      setStats({ total, activos, disponibles, licenciasVenciendo });

      // Conductores recientes (últimos 5)
      const recientes =
        conductores
          ?.sort(
            (a, b) =>
              new Date(b.fecha_ingreso || 0) - new Date(a.fecha_ingreso || 0)
          )
          .slice(0, 5) || [];
      setConductoresRecientes(recientes);

      // Licencias próximas a vencer (primeros 5)
      const proximas =
        conductores
          ?.filter((c) => {
            if (!c.fecha_vencimiento_licencia) return false;
            const fecha = new Date(c.fecha_vencimiento_licencia);
            const dias = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
            return dias >= 0 && dias <= thresholdDays;
          })
          .sort(
            (a, b) =>
              new Date(a.fecha_vencimiento_licencia) -
              new Date(b.fecha_vencimiento_licencia)
          )
          .slice(0, 5) || [];
      setLicenciasProximas(proximas);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularDiasRestantes = (fechaVencimiento) => {
    const hoy = new Date();
    const fecha = new Date(fechaVencimiento);
    const diffTime = fecha - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard RRHH</h1>
            <p className="text-gray-600">
              Gestión de Recursos Humanos - Conductores
            </p>
          </div>
        </div>
        <Link
          to="/conductores/nuevo"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nuevo Conductor
        </Link>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">
                Total Conductores
              </p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="p-3 bg-blue-200 rounded-full">
              <Users className="h-8 w-8 text-blue-700" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Activos</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {stats.activos}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {stats.total > 0
                  ? Math.round((stats.activos / stats.total) * 100)
                  : 0}
                % del total
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-full">
              <UserCheck className="h-8 w-8 text-green-700" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-600 font-medium">Disponibles</p>
              <p className="text-3xl font-bold text-indigo-900 mt-1">
                {stats.disponibles}
              </p>
            </div>
            <div className="p-3 bg-indigo-200 rounded-full">
              <UserX className="h-8 w-8 text-indigo-700" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">
                Licencias por Vencer
              </p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">
                {stats.licenciasVenciendo}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Próximos {HR_CONFIG.LICENSE_EXPIRY_THRESHOLD_DAYS} días
              </p>
            </div>
            <div className="p-3 bg-yellow-200 rounded-full">
              <AlertTriangle className="h-8 w-8 text-yellow-700" />
            </div>
          </div>
        </Card>
      </div>

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/conductores"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Ver Todos los Conductores
              </h3>
              <p className="text-sm text-gray-600">
                Lista completa con filtros
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/conductores/nuevo"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Plus className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Registrar Conductor
              </h3>
              <p className="text-sm text-gray-600">Agregar nuevo conductor</p>
            </div>
          </div>
        </Link>

        <Link
          to="/reportes"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Reportes</h3>
              <p className="text-sm text-gray-600">Análisis y estadísticas</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Tablas de información */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conductores recientes */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            Conductores Recientes
          </h2>
          {conductoresRecientes.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No hay conductores registrados recientemente
            </p>
          ) : (
            <div className="space-y-3">
              {conductoresRecientes.map((conductor) => (
                <Link
                  key={conductor.id}
                  to={`/conductores/${conductor.id}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {conductor.nombre} {conductor.apellidos}
                      </p>
                      <p className="text-sm text-gray-600">
                        CC: {conductor.cedula}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        conductor.estado === 'activo'
                          ? 'bg-green-100 text-green-800'
                          : conductor.estado === 'disponible'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {conductor.estado}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Licencias próximas a vencer */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Licencias por Vencer
          </h2>
          {licenciasProximas.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No hay licencias próximas a vencer
            </p>
          ) : (
            <div className="space-y-3">
              {licenciasProximas.map((conductor) => {
                const diasRestantes = calcularDiasRestantes(
                  conductor.fecha_vencimiento_licencia
                );
                return (
                  <Link
                    key={conductor.id}
                    to={`/conductores/${conductor.id}`}
                    className="block p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors border border-yellow-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {conductor.nombre} {conductor.apellidos}
                        </p>
                        <p className="text-sm text-gray-600">
                          Vence:{' '}
                          {new Date(
                            conductor.fecha_vencimiento_licencia
                          ).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded-full font-medium">
                        {diasRestantes} días
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default RRHHDashboard;
