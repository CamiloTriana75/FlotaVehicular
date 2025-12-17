import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createIncident,
  INCIDENT_TYPES,
  INCIDENT_TYPES_LABELS,
  INCIDENT_SEVERITY_LABELS,
} from '../services/incidentService';
import { supabase } from '../lib/supabaseClient';
import { driverService } from '../services/driverService';
import { vehicleService } from '../services/vehicleService';
import Card from '../components/Card';

const SEVERITIES = ['low', 'medium', 'high', 'critical'];

const ReportIncident = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: 'other',
    severity: 'medium',
    title: 'Incidente reportado por conductor',
    description: '',
    location: '',
    location_lat: '',
    location_lng: '',
    driver_id: '',
    vehicle_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [activeAssignment, setActiveAssignment] = useState(null);

  // Obtener asignación activa del usuario y cargar listas
  useEffect(() => {
    const loadData = async () => {
      try {
        // Obtener usuario autenticado
        const mockUser = localStorage.getItem('mockUser');
        if (!mockUser) return;

        const user = JSON.parse(mockUser);
        console.log('User autenticado:', user.email);

        // Cargar lista de conductores y vehículos
        const [driversRes, vehiclesRes] = await Promise.all([
          driverService.getAll(),
          vehicleService.getAll(),
        ]);

        setDrivers(driversRes.data || []);
        setVehicles(vehiclesRes.data || []);

        // Obtener asignación activa del usuario
        // Búsqueda por email del conductor
        const driverMatch = driversRes.data?.find(
          (d) => d.email?.toLowerCase() === user.email?.toLowerCase()
        );

        if (driverMatch) {
          console.log(
            'Conductor encontrado:',
            driverMatch.id,
            driverMatch.nombre
          );

          // Buscar asignación activa de este conductor
          const { data: assignments, error: assignError } = await supabase
            .from('vehicle_assignments')
            .select('id, driver_id, vehicle_id, status')
            .eq('driver_id', driverMatch.id)
            .in('status', ['active', 'assigned', 'en_servicio'])
            .limit(1)
            .single();

          if (!assignError && assignments) {
            console.log('Asignación activa encontrada:', assignments);
            setActiveAssignment(assignments);
            setForm((f) => ({
              ...f,
              driver_id: assignments.driver_id,
              vehicle_id: assignments.vehicle_id,
            }));
          } else {
            // No hay asignación activa, pero establecer el driver encontrado
            console.log('No hay asignación activa, usando driver encontrado');
            setForm((f) => ({
              ...f,
              driver_id: driverMatch.id,
            }));
          }
        } else {
          console.log('No se encontró conductor para el email:', user.email);
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
      }
    };

    loadData();
  }, []);

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocalización no disponible en este navegador');
      return;
    }
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm((f) => ({
          ...f,
          location_lat: latitude.toFixed(6),
          location_lng: longitude.toFixed(6),
        }));
        setMessage('Ubicación capturada.');
      },
      (err) => {
        setError(`No se pudo obtener ubicación: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    console.log('Creando incidente con:', {
      driver_id: form.driver_id,
      vehicle_id: form.vehicle_id,
    });

    const payload = {
      driver_id: form.driver_id ? Number(form.driver_id) : null,
      vehicle_id: form.vehicle_id ? Number(form.vehicle_id) : null,
      type: form.type,
      severity: form.severity,
      title: form.title || 'Incidente reportado',
      description: form.description,
      location: form.location || null,
      location_lat: form.location_lat ? Number(form.location_lat) : null,
      location_lng: form.location_lng ? Number(form.location_lng) : null,
      occurred_at: new Date().toISOString(),
      status: 'reported',
    };

    const { data, error: err } = await createIncident(payload);
    setLoading(false);

    if (err) {
      console.error('Error creando incidente:', err);
      setError(err.message || 'Error al enviar incidente');
      return;
    }

    setMessage(`Incidente enviado. ID ${data?.id || ''}`);
    // Redirigir a mis rutas (conductor no tiene acceso a /incidentes)
    setTimeout(() => navigate('/conductor/mis-rutas'), 1200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reportar incidente
          </h1>
          <p className="text-gray-600 text-sm">
            Envía un incidente con ubicación; los supervisores serán notificados
            en tiempo real.
          </p>
        </div>
      </div>

      <Card className="p-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Información de asignación */}
          {activeAssignment && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                Asignación activa detectada
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
                <div>
                  <p className="text-gray-600">Conductor:</p>
                  <p className="font-medium">
                    {drivers.find((d) => d.id == form.driver_id)
                      ? `${drivers.find((d) => d.id == form.driver_id).nombre} ${
                          drivers.find((d) => d.id == form.driver_id).apellidos
                        }`
                      : 'No asignado'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Vehículo:</p>
                  <p className="font-medium">
                    {vehicles.find((v) => v.id == form.vehicle_id)?.placa ||
                      'No asignado'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Conductor - Solo lectura si hay asignación */}
            <div>
              <label className="text-sm text-gray-600">Conductor</label>
              {activeAssignment ? (
                <input
                  type="text"
                  className="w-full border rounded p-2 bg-gray-50"
                  value={
                    drivers.find((d) => d.id == form.driver_id)
                      ? `${drivers.find((d) => d.id == form.driver_id).nombre} ${
                          drivers.find((d) => d.id == form.driver_id).apellidos
                        }`
                      : 'No disponible'
                  }
                  disabled
                />
              ) : (
                <select
                  className="w-full border rounded p-2"
                  value={form.driver_id}
                  onChange={(e) => handleChange('driver_id', e.target.value)}
                  required
                >
                  <option value="">Seleccionar conductor</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre} {d.apellidos}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Vehículo - Solo lectura si hay asignación */}
            <div>
              <label className="text-sm text-gray-600">Vehículo</label>
              {activeAssignment ? (
                <input
                  type="text"
                  className="w-full border rounded p-2 bg-gray-50"
                  value={
                    vehicles.find((v) => v.id == form.vehicle_id)?.placa
                      ? `${vehicles.find((v) => v.id == form.vehicle_id).placa} - ${
                          vehicles.find((v) => v.id == form.vehicle_id).marca
                        } ${vehicles.find((v) => v.id == form.vehicle_id).modelo}`
                      : 'No disponible'
                  }
                  disabled
                />
              ) : (
                <select
                  className="w-full border rounded p-2"
                  value={form.vehicle_id}
                  onChange={(e) => handleChange('vehicle_id', e.target.value)}
                  required
                >
                  <option value="">Seleccionar vehículo</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.placa} - {v.marca} {v.modelo}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Tipo de incidente */}
            <div>
              <label className="text-sm text-gray-600">Tipo</label>
              <select
                className="w-full border rounded p-2"
                value={form.type}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                {INCIDENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {INCIDENT_TYPES_LABELS[t] || t}
                  </option>
                ))}
              </select>
            </div>

            {/* Severidad */}
            <div>
              <label className="text-sm text-gray-600">Severidad</label>
              <select
                className="w-full border rounded p-2"
                value={form.severity}
                onChange={(e) => handleChange('severity', e.target.value)}
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {INCIDENT_SEVERITY_LABELS[s] || s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="text-sm text-gray-600">
              Título del incidente
            </label>
            <input
              className="w-full border rounded p-2"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              maxLength={255}
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="text-sm text-gray-600">Descripción</label>
            <textarea
              className="w-full border rounded p-2"
              rows={4}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe qué ocurrió..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600">Ubicación (texto)</label>
              <input
                className="w-full border rounded p-2"
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Ej: Av. Siempre Viva 123, Bogotá"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={captureLocation}
                className="w-full px-3 py-2 bg-indigo-600 text-white rounded-md"
              >
                Usar mi ubicación
              </button>
            </div>
            <div>
              <label className="text-sm text-gray-600">Latitud</label>
              <input
                className="w-full border rounded p-2"
                value={form.location_lat}
                onChange={(e) => handleChange('location_lat', e.target.value)}
                placeholder="4.711"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Longitud</label>
              <input
                className="w-full border rounded p-2"
                value={form.location_lng}
                onChange={(e) => handleChange('location_lng', e.target.value)}
                placeholder="-74.0721"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Al enviar, se notificará a supervisores/admin en tiempo real.
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar incidente'}
            </button>
          </div>
        </form>

        {message && (
          <div className="mt-4 text-green-600 text-sm">{message}</div>
        )}
        {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}
      </Card>
    </div>
  );
};

export default ReportIncident;
