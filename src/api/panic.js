// Servicio en memoria para alertas de pánico, notificaciones e incidentes
import { createIncident } from '../utils/incidentUtils.js';

export const panicAlerts = []; // { id, vehicleId, driverId, timestamp, location }
export const notifications = []; // { id, type, toRole, payload, timestamp }
export const incidents = []; // { id, vehicleId, driverId, timestamp, location, type, details }

export function sendPanicAlert({ id, vehicleId, driverId, timestamp = new Date().toISOString(), location = null }) {
  const alert = { id, vehicleId, driverId, timestamp, location };
  panicAlerts.push(alert);

  // Crear incidente
  const incident = createIncident({ id: `inc-${incidents.length + 1}`, vehicleId, driverId, timestamp, location, type: 'panic', details: 'Alerta de pánico enviada por el conductor' });
  incidents.push(incident);

  // Generar notificación para supervisores (simulada)
  const notification = {
    id: `not-${notifications.length + 1}`,
    type: 'panic',
    toRole: 'supervisor',
    payload: { incidentId: incident.id, vehicleId, driverId, timestamp, location },
    timestamp: new Date().toISOString(),
  };
  notifications.push(notification);

  return { alert, incident, notification };
}

export function listPanicAlerts(vehicleId, fromDate, toDate) {
  const from = fromDate ? new Date(fromDate) : null;
  const to = toDate ? new Date(toDate) : null;
  return panicAlerts.filter(a => (vehicleId ? a.vehicleId === vehicleId : true)).filter(a => {
    const d = new Date(a.timestamp);
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  });
}

export function listNotifications(toRole) {
  return notifications.filter(n => (toRole ? n.toRole === toRole : true));
}
