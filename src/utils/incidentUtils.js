// Util para crear incidentes en memoria y formatear información
export function createIncident({ id, vehicleId, driverId, timestamp = new Date().toISOString(), location = null, type = 'incident', details = '' }) {
  return {
    id,
    vehicleId,
    driverId,
    timestamp,
    location,
    type,
    details,
  };
}
