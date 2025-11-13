import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Plus,
  Navigation,
  Clock,
  Edit,
  Trash2,
  RefreshCw,
  User,
  Car,
  Calendar,
} from 'lucide-react';
import {
  getRoutes,
  getRouteAssignments,
  deleteRoute,
} from '../services/routeService';
import Card from '../components/Card';

const RoutesList = () => {
  const [routes, setRoutes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('routes'); // 'routes' | 'assignments'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [routesResult, assignmentsResult] = await Promise.all([
        getRoutes({ status: 'active' }),
        getRouteAssignments({ status: 'pending' }),
      ]);

      if (routesResult.data) setRoutes(routesResult.data);
      if (assignmentsResult.data) setAssignments(assignmentsResult.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (routeId) => {
    if (!confirm('¿Estás seguro de eliminar esta ruta?')) return;

    try {
      const { error } = await deleteRoute(routeId);
      if (error) throw error;

      alert('Ruta eliminada');
      loadData();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const formatDistance = (meters) => {
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Navigation className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Rutas Optimizadas
            </h1>
            <p className="text-gray-600">
              Gestión de rutas y asignaciones a conductores
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>

          <Link
            to="/rutas/planificacion/nueva"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Nueva Ruta
          </Link>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Navigation className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Rutas Activas</p>
              <p className="text-2xl font-bold text-blue-600">
                {routes.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Asignaciones Pendientes</p>
              <p className="text-2xl font-bold text-green-600">
                {assignments.filter((a) => a.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Car className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">En Progreso</p>
              <p className="text-2xl font-bold text-purple-600">
                {assignments.filter((a) => a.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('routes')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'routes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Rutas ({routes.length})
            </div>
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assignments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Asignaciones ({assignments.length})
            </div>
          </button>
        </nav>
      </div>

      {/* Contenido de tabs */}
      {activeTab === 'routes' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">Cargando rutas...</p>
            </div>
          ) : routes.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No hay rutas creadas</p>
              <Link
                to="/rutas/planificacion/nueva"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Crear Primera Ruta
              </Link>
            </div>
          ) : (
            routes.map((route) => (
              <Card
                key={route.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {route.name}
                    </h3>
                    {route.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {route.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/rutas/planificacion/${route.id}/asignar`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Asignar a conductor"
                    >
                      <User className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(route.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Waypoints
                    </span>
                    <span className="font-medium text-gray-900">
                      {route.waypoints?.length || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Navigation className="w-4 h-4" />
                      Distancia
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatDistance(route.total_distance)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Duración
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatDuration(route.total_duration)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link
                    to={`/rutas/planificacion/${route.id}/asignar`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    <User className="w-4 h-4" />
                    Asignar a Conductor
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">Cargando asignaciones...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No hay asignaciones de rutas</p>
            </div>
          ) : (
            assignments.map((assignment) => (
              <Card key={assignment.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {assignment.route?.name}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          assignment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : assignment.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {assignment.status === 'pending'
                          ? 'Pendiente'
                          : assignment.status === 'in_progress'
                            ? 'En Progreso'
                            : 'Completada'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 flex items-center gap-1 mb-1">
                          <User className="w-4 h-4" />
                          Conductor
                        </p>
                        <p className="font-medium text-gray-900">
                          {assignment.driver?.nombre}{' '}
                          {assignment.driver?.apellidos}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600 flex items-center gap-1 mb-1">
                          <Car className="w-4 h-4" />
                          Vehículo
                        </p>
                        <p className="font-medium text-gray-900">
                          {assignment.vehicle?.placa} -{' '}
                          {assignment.vehicle?.marca}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600 flex items-center gap-1 mb-1">
                          <Calendar className="w-4 h-4" />
                          Inicio Programado
                        </p>
                        <p className="font-medium text-gray-900">
                          {new Date(assignment.scheduled_start).toLocaleString(
                            'es-ES'
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600 flex items-center gap-1 mb-1">
                          <MapPin className="w-4 h-4" />
                          Waypoints
                        </p>
                        <p className="font-medium text-gray-900">
                          {assignment.route?.waypoints?.length || 0} puntos
                        </p>
                      </div>
                    </div>

                    {assignment.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                        {assignment.notes}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RoutesList;
