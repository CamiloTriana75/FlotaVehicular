import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  Play,
  StopCircle,
  Loader,
  Route as RouteIcon,
} from 'lucide-react';
import { useAuth } from '../lib/supabaseClient';
import {
  getRouteAssignments,
  updateRouteAssignmentStatus,
} from '../services/routeService';
import { locationService } from '../services/locationService';

const metersToKm = (m) => `${(m / 1000).toFixed(2)} km`;
const secondsToHhmm = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
};

export default function MyRoutes() {
  const navigate = useNavigate();
  const { getUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [active, setActive] = useState(null);
  const watchIdRef = useRef(null);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const { data: userRes } = await getUser();
      const user = userRes?.user || userRes;
      const { data, error } = await getRouteAssignments({});
      if (error) throw error;
      const list = (data || []).filter(
        (a) =>
          a.driver &&
          user &&
          a.driver.email?.toLowerCase?.() === user.email?.toLowerCase?.()
      );
      setAssignments(list);
      const running = list.find((a) => a.status === 'in_progress');
      setActive(running || null);
    } catch (e) {
      console.error('Error cargando asignaciones del conductor:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
    return () => {
      if (watchIdRef.current) locationService.clearWatch(watchIdRef.current);
    };
  }, []);

  const startTracking = async (assignment) => {
    try {
      await updateRouteAssignmentStatus(assignment.id, 'in_progress');
      setActive(assignment);
      watchIdRef.current = locationService.watchPosition(
        async (coords, err) => {
          if (err || !coords) return;
          const vehId =
            assignment.vehicle?.placa || assignment.vehicle?.id || 'UNKNOWN';
          await locationService.insertLocation({
            vehicle_id: vehId,
            latitude: coords.latitude,
            longitude: coords.longitude,
            speed: coords.speed || 0,
            heading: coords.heading || 0,
            accuracy: coords.accuracy,
            altitude: coords.altitude,
          });
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 1000 }
      );
    } catch (e) {
      console.error('Error al iniciar ruta:', e);
      alert(e.message);
    }
  };

  const stopTracking = async (assignment) => {
    try {
      if (watchIdRef.current) {
        locationService.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      await updateRouteAssignmentStatus(assignment.id, 'completed');
      setActive(null);
      await loadAssignments();
    } catch (e) {
      console.error('Error al finalizar ruta:', e);
      alert(e.message);
    }
  };

  const openNavigation = (assignment) => {
    navigate(`/conductor/mis-rutas/${assignment.id}`, {
      state: { assignment },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <RouteIcon className="w-6 h-6 text-blue-600" /> Mis Rutas
        </h1>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center text-gray-600 py-12">
          No tienes rutas asignadas por ahora.
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="border rounded-xl p-4 bg-white flex items-center justify-between"
            >
              <div className="space-y-1">
                <p className="font-semibold">{a.route?.name || 'Ruta'}</p>
                <p className="text-sm text-gray-600">
                  {a.route?.waypoints?.length || 0} puntos ·{' '}
                  {a.route ? metersToKm(a.route.total_distance) : '-'} ·{' '}
                  {a.route ? secondsToHhmm(a.route.total_duration) : '-'}
                </p>
                <p className="text-xs text-gray-500">
                  Vehículo: {a.vehicle?.placa || a.vehicle?.id}
                </p>
                <p className="text-xs text-gray-500">Estado: {a.status}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openNavigation(a)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center gap-1"
                >
                  <Navigation className="w-4 h-4" /> Ver ruta
                </button>
                {active && active.id === a.id ? (
                  <button
                    onClick={() => stopTracking(a)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm flex items-center gap-1"
                  >
                    <StopCircle className="w-4 h-4" /> Finalizar
                  </button>
                ) : (
                  <button
                    onClick={() => startTracking(a)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-1"
                  >
                    <Play className="w-4 h-4" /> Iniciar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
