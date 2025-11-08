/**
 * Servicio de API para Vehículos
 *
 * Este módulo centraliza todas las operaciones CRUD de vehículos
 * usando Supabase como backend.
 */

import { supabase } from '../lib/supabaseClient';

/**
 * Obtiene todos los vehículos con conductor asignado
 * @param {Object} filters - Filtros opcionales
 * @param {string} filters.estado - Filtrar por estado
 * @param {string} filters.search - Búsqueda por placa, marca o modelo
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function getVehiculos(filters = {}) {
  try {
    let query = supabase
      .from('vehiculo')
      .select(
        `
        *,
        conductor:id_conductor (
          id,
          nombre_completo,
          cedula,
          telefono,
          licencia
        )
      `
      )
      .order('placa', { ascending: true });

    // Aplicar filtros
    if (filters.estado) {
      query = query.eq('estado', filters.estado);
    }

    if (filters.search) {
      query = query.or(
        `placa.ilike.%${filters.search}%,` +
          `marca.ilike.%${filters.search}%,` +
          `modelo.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    return { data: null, error };
  }
}

/**
 * Obtiene un vehículo por ID
 * @param {string} id - UUID del vehículo
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getVehiculoById(id) {
  try {
    const { data, error } = await supabase
      .from('vehiculo')
      .select(
        `
        *,
        conductor:id_conductor (
          id,
          nombre_completo,
          cedula,
          telefono,
          licencia
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener vehículo:', error);
    return { data: null, error };
  }
}

/**
 * Obtiene un vehículo por placa
 * @param {string} placa - Placa del vehículo
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getVehiculoByPlaca(placa) {
  try {
    const { data, error } = await supabase
      .from('vehiculo')
      .select(
        `
        *,
        conductor:id_conductor (
          id,
          nombre_completo,
          cedula,
          telefono,
          licencia
        )
      `
      )
      .eq('placa', placa)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener vehículo por placa:', error);
    return { data: null, error };
  }
}

/**
 * Crea un nuevo vehículo
 * @param {Object} vehiculo - Datos del vehículo
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createVehiculo(vehiculo) {
  try {
    const { data, error } = await supabase
      .from('vehiculo')
      .insert([vehiculo])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al crear vehículo:', error);
    return { data: null, error };
  }
}

/**
 * Actualiza un vehículo existente
 * @param {string} id - UUID del vehículo
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function updateVehiculo(id, updates) {
  try {
    const { data, error } = await supabase
      .from('vehiculo')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al actualizar vehículo:', error);
    return { data: null, error };
  }
}

/**
 * Elimina un vehículo
 * @param {string} id - UUID del vehículo
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export async function deleteVehiculo(id) {
  try {
    const { error } = await supabase.from('vehiculo').delete().eq('id', id);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    return { success: false, error };
  }
}

/**
 * Asigna un conductor a un vehículo
 * @param {string} vehiculoId - UUID del vehículo
 * @param {string} conductorId - UUID del conductor
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function asignarConductor(vehiculoId, conductorId) {
  try {
    const { data, error } = await supabase
      .from('vehiculo')
      .update({
        id_conductor: conductorId,
        estado: 'asignado',
      })
      .eq('id', vehiculoId)
      .select()
      .single();

    if (error) throw error;

    // También actualizar estado del conductor
    await supabase
      .from('conductor')
      .update({ estado: 'en_servicio' })
      .eq('id', conductorId);

    return { data, error: null };
  } catch (error) {
    console.error('Error al asignar conductor:', error);
    return { data: null, error };
  }
}

/**
 * Obtiene vehículos con mantenimiento próximo (próximos 15 días)
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function getVehiculosMantenimientoPendiente() {
  try {
    const hoy = new Date();
    const en15Dias = new Date();
    en15Dias.setDate(hoy.getDate() + 15);

    const { data, error } = await supabase
      .from('vehiculo')
      .select('*')
      .gte('fecha_proximo_mantenimiento', hoy.toISOString().split('T')[0])
      .lte('fecha_proximo_mantenimiento', en15Dias.toISOString().split('T')[0])
      .order('fecha_proximo_mantenimiento');

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error(
      'Error al obtener vehículos con mantenimiento pendiente:',
      error
    );
    return { data: null, error };
  }
}

/**
 * Obtiene estadísticas de vehículos
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getVehiculosStats() {
  try {
    // Total de vehículos
    const { count: total } = await supabase
      .from('vehiculo')
      .select('*', { count: 'exact', head: true });

    // Vehículos activos
    const { count: activos } = await supabase
      .from('vehiculo')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'activo');

    // Vehículos en mantenimiento
    const { count: mantenimiento } = await supabase
      .from('vehiculo')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'mantenimiento');

    // Vehículos disponibles
    const { count: disponibles } = await supabase
      .from('vehiculo')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'disponible');

    return {
      data: {
        total: total || 0,
        activos: activos || 0,
        mantenimiento: mantenimiento || 0,
        disponibles: disponibles || 0,
        porcentajeActivos: total > 0 ? ((activos / total) * 100).toFixed(1) : 0,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de vehículos:', error);
    return { data: null, error };
  }
}
