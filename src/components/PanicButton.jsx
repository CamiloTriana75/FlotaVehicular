/**
 * Componente: Botón de Pánico (PanicButton)
 * Historia de Usuario: Botón de pánico - Botón visible en app móvil y web
 *
 * Características:
 * - Botón grande y visible
 * - Confirmación modal para evitar falsos positivos
 * - Contador de seguridad (keep pressing 2s)
 * - Muestra ubicación antes de enviar
 * - Feedback en tiempo real
 * - Responsive para móvil y web
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  sendPanicAlert,
  getCurrentLocation,
  requestNotificationPermission,
  requestGeolocationPermission,
} from '@/services/panicAlertService';

export function PanicButton({ driverId, vehicleId, onAlertSent }) {
  // Estados
  const [isPressed, setIsPressed] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [success, setSuccess] = useState(false);

  // Refs
  const pressTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  // Manejo de presión del botón (requiere 2 segundos)
  const handleMouseDown = useCallback(async () => {
    setIsPressed(true);
    setCountdown(2);
    setError(null);

    // Obtener ubicación en paralelo
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
    } catch (err) {
      setError(`Error de ubicación: ${err.message}`);
      setLocation(null);
    }

    // Countdown: 2 segundos de presión
    let remaining = 2;
    countdownTimerRef.current = setInterval(() => {
      remaining -= 0.1;
      setCountdown(Math.max(0, remaining));

      if (remaining <= 0) {
        clearInterval(countdownTimerRef.current);
        setShowConfirmation(true); // Mostrar confirmación después de 2s
      }
    }, 100);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      setCountdown(0);
    }
  }, []);

  // Enviar alerta (después de confirmación)
  const handleSendAlert = useCallback(async () => {
    if (!location) {
      setError('No se pudo obtener la ubicación. Intenta de nuevo.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Solicitar permisos si es necesario
      await requestNotificationPermission();

      const result = await sendPanicAlert(
        driverId,
        vehicleId,
        location,
        'Alerta de pánico enviada desde la app'
      );

      setSuccess(true);
      setShowConfirmation(false);

      // Mostrar mensaje de éxito por 3 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

      // Callback opcional
      if (onAlertSent) {
        onAlertSent(result);
      }

      console.log('✅ Alerta enviada:', result);
    } catch (err) {
      setError(`Error enviando alerta: ${err.message}`);
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  }, [location, driverId, vehicleId, onAlertSent]);

  const handleCancel = useCallback(() => {
    setShowConfirmation(false);
    setIsPressed(false);
    setLocation(null);
    setCountdown(0);
    setError(null);
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Botón de Pánico */}
      <div className="relative">
        {/* Efecto de pulso */}
        {isPressed && (
          <div className="absolute inset-0 rounded-full bg-red-500 animate-pulse opacity-30"></div>
        )}

        {/* Botón Principal */}
        <button
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          disabled={loading}
          className={`
            relative w-20 h-20 rounded-full font-bold text-white shadow-2xl
            transition-all duration-300 flex items-center justify-center
            ${isPressed ? 'scale-110 ring-4 ring-red-300' : 'scale-100'}
            ${loading ? 'opacity-70 cursor-wait' : 'cursor-pointer'}
            ${success ? 'bg-green-600' : 'bg-red-600 hover:bg-red-700'}
            active:scale-95
          `}
          title="Mantén presionado 2 segundos para enviar alerta de pánico"
        >
          <div className="text-center">
            {success ? (
              <span className="text-2xl">✅</span>
            ) : loading ? (
              <div className="animate-spin">⏳</div>
            ) : isPressed ? (
              <div className="text-sm font-bold">{countdown.toFixed(1)}s</div>
            ) : (
              <span className="text-2xl">🚨</span>
            )}
          </div>
        </button>

        {/* Indicador de presión */}
        {isPressed && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-400 rounded-full mx-1">
            <div
              className="h-full bg-red-600 rounded-full transition-all"
              style={{ width: `${(countdown / 2) * 100}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Modal de Confirmación */}
      {showConfirmation && (
        <ConfirmationModal
          location={location}
          onConfirm={handleSendAlert}
          onCancel={handleCancel}
          loading={loading}
          error={error}
        />
      )}

      {/* Notificación de Error */}
      {error && !showConfirmation && (
        <div className="absolute bottom-24 right-0 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg max-w-xs">
          <p className="font-semibold">⚠️ Error</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Descartar
          </button>
        </div>
      )}

      {/* Notificación de Éxito */}
      {success && (
        <div className="absolute bottom-24 right-0 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg max-w-xs animate-pulse">
          <p className="font-semibold">✅ ¡Alerta Enviada!</p>
          <p className="text-sm">
            Supervisores han sido notificados. Ayuda en camino.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Modal de Confirmación
 */
function ConfirmationModal({ location, onConfirm, onCancel, loading, error }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 animate-in">
        {/* Encabezado */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-3 animate-bounce">🚨</div>
          <h2 className="text-2xl font-bold text-red-600">
            CONFIRMAR ALERTA DE PÁNICO
          </h2>
          <p className="text-gray-600 text-sm mt-2">
            Esto notificará a supervisores con tu ubicación exacta
          </p>
        </div>

        {/* Información de Ubicación */}
        {location && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">
              📍 Tu Ubicación
            </h3>
            <div className="space-y-1 text-sm text-gray-700">
              <p>
                <span className="font-semibold">Latitud:</span>{' '}
                {location.lat.toFixed(6)}
              </p>
              <p>
                <span className="font-semibold">Longitud:</span>{' '}
                {location.lng.toFixed(6)}
              </p>
              <p>
                <span className="font-semibold">Precisión:</span> ±
                {Math.round(location.accuracy)}m
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(location.timestamp).toLocaleTimeString('es-ES')}
              </p>
            </div>
          </div>
        )}

        {/* Error si hay */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* Botones de Acción */}
        <div className="space-y-3">
          <button
            onClick={onConfirm}
            disabled={loading || !location}
            className={`
              w-full py-3 px-4 rounded-lg font-bold text-white
              transition-all duration-200
              ${
                loading || !location
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 active:scale-95'
              }
            `}
          >
            {loading ? '⏳ Enviando...' : '✅ Sí, Enviar Alerta'}
          </button>

          <button
            onClick={onCancel}
            disabled={loading}
            className={`
              w-full py-3 px-4 rounded-lg font-bold
              transition-all duration-200
              ${
                loading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:scale-95'
              }
            `}
          >
            ❌ Cancelar
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Las alertas falsas pueden resultar en sanciones. Úsalo solo en
          emergencias.
        </p>
      </div>
    </div>
  );
}

export default PanicButton;
