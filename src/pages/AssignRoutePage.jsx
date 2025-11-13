import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Car,
  Calendar,
  Clock,
  ArrowLeft,
  Save,
  Loader,
  MapPin,
  Navigation,
} from 'lucide-react';
import { getRouteById, assignRouteToDriver } from '../services/routeService';
import { driverService } from '../services/driverService';
import { getActiveAssignments } from '../services/assignmentService';

const AssignRoutePage = () => {
  const { routeId } = useParams();
  const navigate = useNavigate();

  const [route, setRoute] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [vehicleAssignments, setVehicleAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Formulario
  const [selectedDriver, setSelectedDriver] = useState('');
  const [scheduledStart, setScheduledStart] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [routeId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [routeResult, driversResult, assignmentsResult] = await Promise.all(
        [getRouteById(routeId), driverService.getAll(), getActiveAssignments()]
      );

      if (routeResult.data) setRoute(routeResult.data);
      if (driversResult.data) setDrivers(driversResult.data);
      if (assignmentsResult.data) setVehicleAssignments(assignmentsResult.data);

      // Configurar fecha por defecto (hoy)
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      setScheduledStart(formatDateTimeLocal(now));
      setScheduledEnd(formatDateTimeLocal(tomorrow));
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTimeLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getDriverVehicle = (driverId) => {
    console.log('🔍 Buscando vehículo para conductor:', driverId);
    console.log('📋 Asignaciones:', vehicleAssignments);
    const assignment = vehicleAssignments.find(
      (a) => a.driver_id === parseInt(driverId)
    );
    console.log('✅ Asignación encontrada:', assignment);
    const vehicle = assignment?.vehicle || assignment?.vehicles || null;
    console.log('🚗 Vehículo:', vehicle);
    return vehicle;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDriver) {
      alert('Debes seleccionar un conductor');
      return;
    }

    const vehicle = getDriverVehicle(selectedDriver);
    if (!vehicle) {
      alert('El conductor seleccionado no tiene un vehículo asignado');
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await assignRouteToDriver({
        routeId: parseInt(routeId),
        driverId: parseInt(selectedDriver),
        vehicleId: vehicle.id,
        scheduledStart,
        scheduledEnd,
        notes,
      });

      if (error) throw error;

      alert('Ruta asignada exitosamente');
      navigate('/rutas');
    } catch (error) {
      console.error('Error asignando ruta:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const formatDistance = (meters) => `${(meters / 1000).toFixed(2)} km`;
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Ruta no encontrada</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/rutas')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Asignar Ruta a Conductor
          </h1>
          <p className="text-gray-600">
            Configura la asignación y notifica al conductor
          </p>
        </div>
      </div>

      {/* Información de la ruta */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Información de la Ruta
        </h2>

        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              {route.name}
            </h3>
            {route.description && (
              <p className="text-sm text-gray-600 mt-1">{route.description}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                <MapPin className="w-4 h-4" />
                Waypoints
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {route.waypoints?.length || 0}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                <Navigation className="w-4 h-4" />
                Distancia
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDistance(route.total_distance)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                <Clock className="w-4 h-4" />
                Duración
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDuration(route.total_duration)}
              </p>
            </div>
          </div>

          {/* Waypoints */}
          <div className="pt-3 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">
              Puntos de la Ruta:
            </h4>
            <div className="space-y-2">
              {route.waypoints?.map((wp, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{wp.name}</p>
                    <p className="text-gray-600 text-xs">{wp.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de asignación */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Datos de Asignación
        </h2>

        <div className="space-y-4">
          {/* Conductor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Conductor *
            </label>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar conductor</option>
              {drivers.map((driver) => {
                const vehicle = getDriverVehicle(driver.id);
                return (
                  <option key={driver.id} value={driver.id}>
                    {driver.nombre} {driver.apellidos} - {driver.cedula}
                    {vehicle ? ` (${vehicle.placa})` : ' (Sin vehículo)'}
                  </option>
                );
              })}
            </select>
            {selectedDriver && !getDriverVehicle(selectedDriver) && (
              <p className="text-sm text-red-600 mt-1">
                ⚠️ Este conductor no tiene vehículo asignado
              </p>
            )}
          </div>

          {/* Vehículo (automático) */}
          {selectedDriver && getDriverVehicle(selectedDriver) && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 mb-1">
                <Car className="w-4 h-4 inline mr-1" />
                Vehículo Asignado:
              </p>
              <p className="font-medium text-green-900">
                {getDriverVehicle(selectedDriver).placa} -{' '}
                {getDriverVehicle(selectedDriver).marca}{' '}
                {getDriverVehicle(selectedDriver).modelo}
              </p>
            </div>
          )}

          {/* Fecha de inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Inicio Programado *
            </label>
            <input
              type="datetime-local"
              value={scheduledStart}
              onChange={(e) => setScheduledStart(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Fecha de fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock className="w-4 h-4 inline mr-1" />
              Fin Programado (opcional)
            </label>
            <input
              type="datetime-local"
              value={scheduledEnd}
              onChange={(e) => setScheduledEnd(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Instrucciones especiales, recomendaciones, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/rutas')}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                saving || !selectedDriver || !getDriverVehicle(selectedDriver)
              }
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Asignando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Asignar Ruta
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AssignRoutePage;
