/**
 * Hook: usePanicAlert
 * Gestiona la lógica de alertas de pánico en componentes
 *
 * Uso:
 * const { sendAlert, history, loading, error } = usePanicAlert(driverId, vehicleId);
 * await sendAlert('Razón del pánico');
 */

import { useState, useCallback, useEffect } from 'react';
import {
  sendPanicAlert,
  getPanicAlertHistory,
  resolvePanicAlert,
  getPanicAlertStatus,
} from '@/services/panicAlertService';

export function usePanicAlert(driverId, vehicleId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState(null);

  // Cargar historial al montar el componente
  useEffect(() => {
    loadHistory();
  }, [driverId]);

  const loadHistory = useCallback(async () => {
    if (!driverId) return;

    try {
      setLoading(true);
      const alerts = await getPanicAlertHistory(driverId, {
        limit: 10,
        offset: 0,
      });
      setHistory(alerts);
    } catch (err) {
      console.error('Error loading panic alert history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  const sendAlert = useCallback(
    async (location, reason = 'Alerta de pánico') => {
      if (!driverId || !vehicleId || !location) {
        throw new Error('Driver ID, Vehicle ID, and location are required');
      }

      try {
        setLoading(true);
        setError(null);

        const result = await sendPanicAlert(
          driverId,
          vehicleId,
          location,
          reason
        );

        // Actualizar historial
        await loadHistory();

        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [driverId, vehicleId, loadHistory]
  );

  const resolve = useCallback(
    async (incidentId, resolution = 'RESOLVED', notes = '') => {
      try {
        setLoading(true);
        const result = await resolvePanicAlert(incidentId, resolution, notes);
        await loadHistory();
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadHistory]
  );

  const checkStatus = useCallback(async (incidentId) => {
    try {
      const st = await getPanicAlertStatus(incidentId);
      setStatus(st);
      return st;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    sendAlert,
    resolve,
    checkStatus,
    history,
    status,
    loading,
    error,
    reload: loadHistory,
  };
}

export default usePanicAlert;
