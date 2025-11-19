/**
 * Servicio para fuel logs (repostajes y consumos)
 */
import { supabase } from '../lib/supabaseClient';

/**
 * Obtiene todos los fuel logs de un vehículo ordenados por odometer desc
 * @param {number|string} vehicleId
 */
export async function getFuelLogsByVehicle(vehicleId) {
  try {
    const { data, error } = await supabase
      .from('fuel_logs')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('odometer', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener fuel logs:', error);
    return { data: null, error };
  }
}

/**
 * Crea un fuel log y calcula rendimiento respecto al registro previo
 * @param {Object} payload - { vehicle_id, date, liters, cost, odometer }
 */
export async function createFuelLog(payload) {
  try {
    const { vehicle_id, date, liters, cost, odometer } = payload;

    // Obtener último registro para el vehículo (por odometer)
    const { data: prevRows, error: prevErr } = await supabase
      .from('fuel_logs')
      .select('*')
      .eq('vehicle_id', vehicle_id)
      .order('odometer', { ascending: false })
      .limit(1);

    if (prevErr) throw prevErr;

    const prev = Array.isArray(prevRows) && prevRows.length ? prevRows[0] : null;

    let km_since_last = null;
    let km_per_l = null;
    let l_per_100km = null;

    if (prev && prev.odometer != null && typeof odometer === 'number') {
      const distance = odometer - Number(prev.odometer);
      if (distance > 0 && Number(liters) > 0) {
        km_since_last = distance;
        km_per_l = Number(distance) / Number(liters);
        l_per_100km = (Number(liters) / Number(distance)) * 100;
      }
    }

    const insertPayload = {
      vehicle_id,
      date: date || new Date().toISOString().split('T')[0],
      liters,
      cost,
      odometer,
      km_since_last,
      km_per_l,
      l_per_100km,
    };

    const { data, error } = await supabase
      .from('fuel_logs')
      .insert([insertPayload])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al crear fuel log:', error);
    return { data: null, error };
  }
}

/**
 * Elimina fuel logs por vehicle (helper para tests)
 */
export async function deleteFuelLogsByVehicle(vehicleId) {
  try {
    const { error } = await supabase.from('fuel_logs').delete().eq('vehicle_id', vehicleId);
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}
