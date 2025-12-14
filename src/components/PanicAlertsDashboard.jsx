/**
 * Componente: Panel de Alertas de Pánico para Supervisores
 * Vista en tiempo real de alertas activas del sistema
 *
 * Características:
 * - Lista de alertas en tiempo real (Supabase subscriptions)
 * - Mapa con ubicaciones de las alertas
 * - Acciones: "En camino", "Resuelto", "Falsa alarma"
 * - Filtros por estado y vehículo
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { resolvePanicAlert } from '@/services/panicAlertService';

export function PanicAlertsDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ACTIVE'); // ACTIVE, RESOLVED, ALL
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  // Cargar alertas iniciales
  useEffect(() => {
    loadAlerts();
    subscribeToAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);

      const query = supabase
        .from('panic_alerts')
        .select(
          `
          id,
          incident_id,
          driver_id,
          vehicle_id,
          location,
          reason,
          status,
          sent_at,
          resolved_at,
          incident:incidents(id, severity, status, notes),
          driver:users!driver_id(id, name, email, phone),
          vehicle:vehicles(id, plate, model, type)
        `
        )
        .order('sent_at', { ascending: false });

      // Filtrar por estado si es necesario
      if (filterStatus === 'ACTIVE') {
        query.eq('status', 'ACTIVE');
      } else if (filterStatus === 'RESOLVED') {
        query.eq('status', 'RESOLVED');
      }

      const { data, error: err } = await query;

      if (err) throw err;

      setAlerts(data || []);
    } catch (err) {
      console.error('Error loading panic alerts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToAlerts = () => {
    const channel = supabase
      .channel('panic-alerts-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'panic_alerts',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAlerts((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setAlerts((prev) =>
              prev.map((alert) =>
                alert.id === payload.new.id ? payload.new : alert
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setAlerts((prev) =>
              prev.filter((alert) => alert.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleResolveAlert = async (alertId, resolution) => {
    setActionLoading((prev) => ({ ...prev, [alertId]: true }));

    try {
      const alert = alerts.find((a) => a.id === alertId);
      if (!alert) throw new Error('Alert not found');

      await resolvePanicAlert(
        alert.incident_id,
        resolution === 'false-alarm' ? 'CLOSED' : 'RESOLVED',
        `Supervisor action: ${resolution}`
      );

      // Actualizar localmente
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? {
                ...a,
                status: 'RESOLVED',
                resolved_at: new Date().toISOString(),
              }
            : a
        )
      );

      setSelectedAlert(null);
    } catch (err) {
      console.error('Error resolving alert:', err);
      setError(err.message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [alertId]: false }));
    }
  };

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            🚨 Alertas de Pánico
          </h2>
          <p className="text-gray-500 mt-1">
            {activeAlerts.length} alerta(s) activa(s)
          </p>
        </div>
        <button
          onClick={loadAlerts}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {['ACTIVE', 'RESOLVED', 'ALL'].map((status) => (
          <button
            key={status}
            onClick={() => {
              setFilterStatus(status);
              loadAlerts();
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filterStatus === status
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {status === 'ACTIVE' && '🔴 Activas'}
            {status === 'RESOLVED' && '✅ Resueltas'}
            {status === 'ALL' && '📋 Todas'}
          </button>
        ))}
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin text-4xl">⏳</div>
          <p className="text-gray-500 mt-2">Cargando alertas...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          ⚠️ Error: {error}
        </div>
      )}

      {/* Lista de Alertas */}
      {!loading && alerts.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-2xl">✅</p>
          <p className="text-gray-500 mt-2">No hay alertas de pánico</p>
        </div>
      )}

      {!loading && alerts.length > 0 && (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              isSelected={selectedAlert?.id === alert.id}
              onSelect={setSelectedAlert}
              onResolve={handleResolveAlert}
              isLoading={actionLoading[alert.id]}
            />
          ))}
        </div>
      )}

      {/* Modal detallado */}
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onResolve={handleResolveAlert}
          isLoading={actionLoading[selectedAlert.id]}
        />
      )}
    </div>
  );
}

/**
 * Tarjeta de Alerta Individual
 */
function AlertCard({ alert, isSelected, onSelect, onResolve, isLoading }) {
  const isActive = alert.status === 'ACTIVE';
  const minutesAgo = Math.floor(
    (Date.now() - new Date(alert.sent_at).getTime()) / 60000
  );

  return (
    <div
      onClick={() => onSelect(alert)}
      className={`
        p-4 rounded-lg border-2 cursor-pointer transition-all
        ${isSelected ? 'border-red-600 bg-red-50' : 'border-gray-200 bg-white hover:border-red-400'}
        ${!isActive ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-start justify-between">
        {/* Info Conductor */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xl ${isActive ? '🔴' : '✅'}`}></span>
            <h3 className="font-bold text-lg text-gray-900">
              {alert.driver?.name || 'Conductor desconocido'}
            </h3>
            {isActive && (
              <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                ACTIVA
              </span>
            )}
          </div>

          {/* Detalles */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-semibold">🚗 Vehículo:</span>{' '}
              {alert.vehicle?.plate || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">⏱️ Hace:</span> {minutesAgo}m
            </div>
            <div className="col-span-2">
              <span className="font-semibold">📍 Ubicación:</span>{' '}
              {alert.location
                ? `${alert.location.lat.toFixed(4)}, ${alert.location.lng.toFixed(4)}`
                : 'N/A'}
            </div>
            {alert.reason && (
              <div className="col-span-2">
                <span className="font-semibold">💬 Razón:</span> {alert.reason}
              </div>
            )}
          </div>
        </div>

        {/* Botones de Acción Rápida */}
        {isActive && (
          <div className="ml-4 space-y-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResolve(alert.id, 'on-the-way');
              }}
              disabled={isLoading}
              className="block w-32 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '⏳' : '🚗'} En Camino
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResolve(alert.id, 'resolved');
              }}
              disabled={isLoading}
              className="block w-32 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? '⏳' : '✅'} Resuelto
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResolve(alert.id, 'false-alarm');
              }}
              disabled={isLoading}
              className="block w-32 px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 disabled:opacity-50"
            >
              {isLoading ? '⏳' : '❌'} Falsa Alarma
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Modal de Detalles Completos
 */
function AlertDetailModal({ alert, onClose, onResolve, isLoading }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 max-h-96 overflow-y-auto">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-red-600">
            🚨 Detalles de Alerta
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="space-y-4 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <p className="font-semibold text-gray-900">{alert.driver?.name}</p>
            <p className="text-gray-600">{alert.driver?.email}</p>
            <p className="text-gray-600">{alert.driver?.phone}</p>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <p className="font-semibold">Vehículo</p>
            <p className="text-gray-600">{alert.vehicle?.plate}</p>
            <p className="text-gray-600">{alert.vehicle?.model}</p>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <p className="font-semibold">Ubicación</p>
            <p className="text-gray-600 font-mono text-xs">
              {alert.location?.lat.toFixed(6)}, {alert.location?.lng.toFixed(6)}
            </p>
            <p className="text-gray-600 text-xs">
              Precisión: ±{Math.round(alert.location?.accuracy || 0)}m
            </p>
          </div>

          {alert.reason && (
            <div className="bg-blue-50 p-3 rounded">
              <p className="font-semibold">Razón Reportada</p>
              <p className="text-gray-600">{alert.reason}</p>
            </div>
          )}

          <div className="bg-gray-50 p-3 rounded">
            <p className="font-semibold">Timestamp</p>
            <p className="text-gray-600 text-xs">
              {new Date(alert.sent_at).toLocaleString('es-ES')}
            </p>
          </div>
        </div>

        {/* Acciones */}
        {alert.status === 'ACTIVE' && (
          <div className="mt-6 space-y-2">
            <button
              onClick={() => onResolve(alert.id, 'on-the-way')}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '⏳ Procesando...' : '🚗 En Camino'}
            </button>
            <button
              onClick={() => onResolve(alert.id, 'resolved')}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? '⏳ Procesando...' : '✅ Resuelto'}
            </button>
            <button
              onClick={() => onResolve(alert.id, 'false-alarm')}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
            >
              {isLoading ? '⏳ Procesando...' : '❌ Falsa Alarma'}
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default PanicAlertsDashboard;
