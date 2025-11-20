import React, { useState } from 'react';
import { sendPanicAlert } from '../api/alerts';
import { useAuth } from '../lib/supabaseClient';

/**
 * PanicButton
 * Componente simple con confirmación que obtiene la ubicación y envía la alerta.
 * - Usa `window.confirm` para evitar dependencias de UI adicionales.
 */
export default function PanicButton({ vehicleId }) {
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  const handlePanic = async () => {
    const confirm = window.confirm('¿Confirmar envío de alerta de pánico?');
    if (!confirm) return;

    setLoading(true);

    // Intentar obtener ubicación con timeout
    const getLocation = () =>
      new Promise((resolve, reject) => {
        if (!navigator.geolocation) return resolve(null);
        let resolved = false;
        const timer = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve(null);
          }
        }, 5000);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (resolved) return;
            resolved = true;
            clearTimeout(timer);
            resolve({
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            });
          },
          (err) => {
            if (resolved) return;
            resolved = true;
            clearTimeout(timer);
            resolve(null);
          },
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 5000 }
        );
      });

    try {
      const userSession = await auth.getUser();
      const currentUser = userSession?.data?.user;

      const location = await getLocation();

      const payload = {
        driver_id: currentUser?.id || null,
        vehicle_id: vehicleId || null,
        location,
        message: 'Botón de pánico activado',
        source: 'web',
      };

      const { data, error } = await sendPanicAlert(payload);
      if (error) {
        console.error('Error sending panic alert:', error);
        alert('Error al enviar la alerta. Intenta de nuevo.');
      } else {
        alert('Alerta enviada. Ayuda en camino.');
      }
    } catch (err) {
      console.error('Unexpected error in PanicButton:', err);
      alert('Error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePanic}
      disabled={loading}
      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
    >
      {loading ? 'Enviando...' : 'Botón de Pánico'}
    </button>
  );
}
