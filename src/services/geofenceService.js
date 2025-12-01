import { supabase } from '../lib/supabaseClient';

export const geofenceService = {
  async list() {
    const { data, error } = await supabase
      .from('geofences')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async create({
    nombre,
    descripcion,
    tipo,
    geometry,
    radio_m,
    activo = true,
  }) {
    const payload = { nombre, descripcion, tipo, geometry, radio_m, activo };
    const { data, error } = await supabase
      .from('geofences')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async update(id, updates) {
    const { data, error } = await supabase
      .from('geofences')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async remove(id) {
    const { error } = await supabase.from('geofences').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
  async listEvents({ vehicleId, limit = 50 }) {
    let q = supabase
      .from('geofence_events')
      .select(
        `
        *,
        geofence:geofences(id, nombre),
        vehicle:vehicles(id, placa, marca, modelo)
      `
      )
      .order('occurred_at', { ascending: false })
      .limit(limit);
    if (vehicleId) q = q.eq('vehicle_id', vehicleId);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },
  async evaluate({ vehicleId, lng, lat }) {
    // Invoke Edge Function
    const { data, error } = await supabase.functions.invoke(
      'geofence-evaluator',
      {
        body: { vehicleId, position: { lng, lat } },
      }
    );
    if (error) throw error;
    return data;
  },
};
