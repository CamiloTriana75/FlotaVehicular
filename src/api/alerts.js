/**
 * Servicio de Alertas (Botón de Pánico)
 * Inserta un incidente en la tabla `incidents` y devuelve el resultado.
 */
import { supabase } from '../lib/supabaseClient';

/**
 * Envía una alerta de pánico creando un incidente en la BD.
 * @param {Object} payload
 * @param {number|string} payload.driver_id
 * @param {number|string} payload.vehicle_id
 * @param {{lat:number,lon:number,accuracy?:number}|null} payload.location
 * @param {string} [payload.message]
 * @param {string} [payload.source]
 */
export async function sendPanicAlert({
  driver_id,
  vehicle_id,
  location = null,
  message = null,
  source = 'web',
}) {
  try {
    // Construir campos compatibles con la tabla `incidents` existente
    const title = message || 'Alerta de pánico';
    const description = message || 'Alerta inmediata enviada desde conductor';

    // Guardamos la ubicación como texto "lat,lon,accuracy" en el campo `location`
    let locationText = null;
    if (
      location &&
      typeof location.lat === 'number' &&
      typeof location.lon === 'number'
    ) {
      locationText = `${location.lat},${location.lon}${
        location.accuracy ? `,acc:${location.accuracy}` : ''
      }`;
    }

    const incident = {
      driver_id: driver_id ? Number(driver_id) : null,
      vehicle_id: vehicle_id ? Number(vehicle_id) : null,
      type: 'panic',
      severity: 'critical',
      title,
      description,
      location: locationText,
      source,
    };

    const { data, error } = await supabase
      .from('incidents')
      .insert([incident])
      .select()
      .single();

    if (error) {
      console.error('Error creating panic incident:', error);
      return { data: null, error };
    }

    // Al insertar en Supabase, los listeners realtime del dashboard recibirán el evento
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error in sendPanicAlert:', err);
    return { data: null, error: err };
  }
}

export default { sendPanicAlert };
