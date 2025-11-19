/**
 * Servicio de Turnos y Asignaciones de Turnos a Conductores
 */
import { supabase } from '../lib/supabaseClient';

function parseTimeToDate(dateStr, timeStr) {
  // dateStr: 'YYYY-MM-DD', timeStr: 'HH:MM' or 'HH:MM:SS'
  // Crear objeto Date local
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute, second = 0] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, second);
}

function computeEndDateIfNextDay(startTimeStr, endTimeStr, dateStr) {
  const start = parseTimeToDate(dateStr, startTimeStr);
  let end = parseTimeToDate(dateStr, endTimeStr);
  // Si end es menor o igual que start, el turno cruza la medianoche
  if (end <= start) {
    // sumar 1 día
    end = new Date(end.getTime() + 24 * 3600 * 1000);
  }
  return { start, end };
}

export async function createShiftTemplate({ name, start_time, end_time, notes }) {
  try {
    const { data, error } = await supabase
      .from('shift_templates')
      .insert([{ name, start_time, end_time, notes }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error crear plantilla de turno:', error);
    return { data: null, error };
  }
}

export async function assignShiftToDriver({ driver_id, shift_id, shift_date }) {
  try {
    // Obtener plantilla
    const { data: tmpl, error: tmplErr } = await supabase
      .from('shift_templates')
      .select('*')
      .eq('id', shift_id)
      .single();
    if (tmplErr) throw tmplErr;

    const { start_time, end_time } = tmpl;
    const { start, end } = computeEndDateIfNextDay( start_time, end_time, shift_date );

    const hours = Number(((end.getTime() - start.getTime()) / (1000 * 3600)).toFixed(2));

    const payload = {
      driver_id,
      shift_id,
      shift_date,
      start_timestamp: start.toISOString(),
      end_timestamp: end.toISOString(),
      hours,
    };

    const { data, error } = await supabase
      .from('driver_shift_assignments')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error asignar turno:', error);
    return { data: null, error };
  }
}

export async function getDriverShifts(driver_id, { from_date, to_date } = {}) {
  try {
    let query = supabase.from('driver_shift_assignments').select('*').eq('driver_id', driver_id).order('shift_date', { ascending: true });
    if (from_date) query = query.gte('shift_date', from_date);
    if (to_date) query = query.lte('shift_date', to_date);
    const { data, error } = await query;
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getDriverShifts:', error);
    return { data: null, error };
  }
}

export async function getDriverHoursForPeriod(driver_id, from_date, to_date) {
  try {
    const { data, error } = await supabase
      .from('driver_shift_assignments')
      .select('hours')
      .eq('driver_id', driver_id)
      .gte('shift_date', from_date)
      .lte('shift_date', to_date);

    if (error) throw error;

    const total = (data || []).reduce((acc, row) => acc + Number(row.hours || 0), 0);
    return { data: { total_hours: Number(total.toFixed(2)) }, error: null };
  } catch (error) {
    console.error('Error getDriverHoursForPeriod:', error);
    return { data: null, error };
  }
}

export async function deleteDriverShiftsByDriver(driver_id) {
  try {
    const { error } = await supabase.from('driver_shift_assignments').delete().eq('driver_id', driver_id);
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}
