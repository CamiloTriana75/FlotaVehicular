/**
 * Página: Dashboard del Conductor
 * Muestra información del viaje actual y botón de pánico
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/supabaseClient';
import { supabase } from '../lib/supabaseClient';
import PanicButton from '../components/PanicButton';
import { MapPin, Navigation, Clock, AlertTriangle } from 'lucide-react';

export default function DriverDashboard() {
  const { user } = useAuth();
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [stats, setStats] = useState({
    todayDistance: 0,
    todayDuration: 0,
    speed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    loadDriverData();
  }, [user?.id]);

  const loadDriverData = async () => {
    try {
      setLoading(true);

      // Obtener vehículo asignado al conductor
      const { data: vehicleData } = await supabase
        .from('vehicles')
        .select('*')
        .eq('assigned_driver_id', user.id)
        .single();

      if (vehicleData) {
        setCurrentVehicle(vehicleData);

        // Obtener ruta actual
        const { data: routeData } = await supabase
          .from('routes')
          .select('*')
          .eq('vehicle_id', vehicleData.id)
          .eq('status', 'IN_PROGRESS')
          .single();

        if (routeData) {
          setCurrentRoute(routeData);
        }
      }
    } catch (error) {
      console.error('Error loading driver data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-3">⏳</div>
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Encabezado */}
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            👋 Bienvenido, {user?.user_metadata?.full_name || user?.email}
          </h1>
          <p className="text-gray-600 mt-1">Dashboard del Conductor</p>
        </div>

        {/* Información del Vehículo */}
        {currentVehicle && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🚗 Vehículo Asignado
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Placa</p>
                <p className="text-xl font-bold text-gray-900">
                  {currentVehicle.plate}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Modelo</p>
                <p className="text-xl font-bold text-gray-900">
                  {currentVehicle.model}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tipo</p>
                <p className="text-xl font-bold text-gray-900">
                  {currentVehicle.vehicle_type}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Año</p>
                <p className="text-xl font-bold text-gray-900">
                  {currentVehicle.year}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ruta Actual */}
        {currentRoute ? (
          <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              🗺️ Ruta en Progreso
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-blue-700">Origen</p>
                  <p className="font-bold text-gray-900">
                    {currentRoute.start_location || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Navigation className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-blue-700">Destino</p>
                  <p className="font-bold text-gray-900">
                    {currentRoute.end_location || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-blue-700">Duración Estimada</p>
                  <p className="font-bold text-gray-900">
                    {currentRoute.estimated_duration || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border-l-4 border-yellow-600 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-yellow-900">Sin Ruta Asignada</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  No tienes una ruta activa. Contacta con tu supervisor para
                  obtener una.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sección de Estadísticas */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📊 Estadísticas del Día
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700 font-semibold">
                Distancia Recorrida
              </p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {stats.todayDistance} km
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-700 font-semibold">
                Tiempo en Ruta
              </p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {stats.todayDuration}h
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-700 font-semibold">
                Velocidad Promedio
              </p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {stats.speed} km/h
              </p>
            </div>
          </div>
        </div>

        {/* Información de Seguridad */}
        <div className="bg-red-50 border-l-4 border-red-600 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-red-900 mb-3">
            🚨 Sistema de Emergencia
          </h2>
          <p className="text-red-800 mb-4">
            En caso de emergencia, presiona y mantén el botón rojo de pánico en
            la esquina inferior derecha durante 2 segundos. Los supervisores
            serán notificados de inmediato con tu ubicación exacta.
          </p>
          <div className="bg-red-100 border border-red-300 rounded p-3">
            <p className="text-sm text-red-900">
              ⚠️ <strong>Advertencia:</strong> Las falsas alarmas pueden
              resultar en sanciones. Usa este botón solo en emergencias reales.
            </p>
          </div>
        </div>
      </div>

      {/* Botón de Pánico - Componente Flotante */}
      {currentVehicle && (
        <PanicButton
          driverId={user.id}
          vehicleId={currentVehicle.id}
          onAlertSent={(result) => {
            console.log('🚨 Alerta enviada:', result);
            // Aquí puedes agregar notificación visual adicional si es necesario
          }}
        />
      )}
    </div>
  );
}
