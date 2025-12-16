/**
 * Servicio de API para Conductores
 *
 * Este módulo centraliza todas las operaciones CRUD de conductores
 * usando Supabase como backend.
 */

import { supabase } from '../lib/supabaseClient';

/**
 * Obtiene todos los conductores
 * @param {Object} filters - Filtros opcionales
 * @param {string} filters.estado - Filtrar por estado
 * @param {string} filters.search - Búsqueda por nombre o cédula
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function getConductores(filters = {}) {
  try {
    let query = supabase
      .from('conductor')
      .select('*')
      .order('nombre_completo', { ascending: true });

    // Aplicar filtros
    if (filters.estado) {
      query = query.eq('estado', filters.estado);
    }

    if (filters.search) {
      query = query.or(
        `nombre_completo.ilike.%${filters.search}%,` +
          `cedula.ilike.%${filters.search}%,` +
          `email.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener conductores:', error);
    return { data: null, error };
  }
}

/**
 * Obtiene un conductor por ID
 * @param {string} id - UUID del conductor
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getConductorById(id) {
  try {
    const { data, error } = await supabase
      .from('conductor')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener conductor:', error);
    return { data: null, error };
  }
}

/**
 * Crea un nuevo conductor
 * @param {Object} conductor - Datos del conductor
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createConductor(conductor) {
  try {
    // Validación mínima
    const required = ['cedula', 'nombre_completo', 'email'];
    const missing = required.filter(
      (f) => !conductor[f] || String(conductor[f]).trim() === ''
    );
    if (missing.length) {
      return {
        data: null,
        error: new Error(`Faltan campos requeridos: ${missing.join(', ')}`),
      };
    }

    // Evitar duplicados por cedula, email o licencia
    const [cedulaDup, emailDup, licenciaDup] = await Promise.all([
      conductor.cedula
        ? supabase
            .from('conductor')
            .select('id')
            .eq('cedula', conductor.cedula)
            .maybeSingle()
        : { data: null, error: null },
      conductor.email
        ? supabase
            .from('conductor')
            .select('id')
            .eq('email', conductor.email)
            .maybeSingle()
        : { data: null, error: null },
      conductor.numero_licencia
        ? supabase
            .from('conductor')
            .select('id')
            .eq('numero_licencia', conductor.numero_licencia)
            .maybeSingle()
        : { data: null, error: null },
    ]);

    if (cedulaDup.error) throw cedulaDup.error;
    if (emailDup.error) throw emailDup.error;
    if (licenciaDup.error) throw licenciaDup.error;

    const conflicts = [];
    if (cedulaDup.data) conflicts.push('cédula');
    if (emailDup.data) conflicts.push('email');
    if (licenciaDup.data) conflicts.push('número de licencia');

    if (conflicts.length > 0) {
      return {
        data: null,
        error: new Error(
          `No se creó el conductor: ya existe ${conflicts.join(', ')}`
        ),
      };
    }

    const payload = {
      ...conductor,
      estado: conductor?.estado || 'disponible',
    };

    const { data, error } = await supabase
      .from('conductor')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    if (error?.code === '23505') {
      return {
        data: null,
        error: new Error(
          'No se creó el conductor: cédula o email ya están registrados'
        ),
      };
    }

    console.error('Error al crear conductor:', error);
    return { data: null, error };
  }
}

/**
 * Actualiza un conductor existente
 * @param {string} id - UUID del conductor
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function updateConductor(id, updates) {
  try {
    const { data, error } = await supabase
      .from('conductor')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al actualizar conductor:', error);
    return { data: null, error };
  }
}

/**
 * Elimina un conductor
 * @param {string} id - UUID del conductor
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export async function deleteConductor(id) {
  try {
    const { error } = await supabase.from('conductor').delete().eq('id', id);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error al eliminar conductor:', error);
    return { success: false, error };
  }
}

/**
 * Obtiene conductores disponibles (activos y sin vehículo asignado)
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function getConductoresDisponibles() {
  try {
    const { data, error } = await supabase
      .from('conductor')
      .select('*')
      .in('estado', ['activo', 'disponible'])
      .gt('fecha_venc_licencia', new Date().toISOString().split('T')[0])
      .order('nombre_completo');

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener conductores disponibles:', error);
    return { data: null, error };
  }
}

/**
 * Obtiene conductores con licencia por vencer (próximos 30 días)
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function getConductoresLicenciaPorVencer() {
  try {
    const hoy = new Date();
    const en30Dias = new Date();
    en30Dias.setDate(hoy.getDate() + 30);

    const { data, error } = await supabase
      .from('conductor')
      .select('*')
      .gte('fecha_venc_licencia', hoy.toISOString().split('T')[0])
      .lte('fecha_venc_licencia', en30Dias.toISOString().split('T')[0])
      .order('fecha_venc_licencia');

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error(
      'Error al obtener conductores con licencia por vencer:',
      error
    );
    return { data: null, error };
  }
}

/**
 * Obtiene estadísticas de conductores
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getConductoresStats() {
  try {
    // Total de conductores
    const { count: total } = await supabase
      .from('conductor')
      .select('*', { count: 'exact', head: true });

    // Conductores activos
    const { count: activos } = await supabase
      .from('conductor')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'activo');

    // Conductores disponibles
    const { count: disponibles } = await supabase
      .from('conductor')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'disponible');

    // Conductores en servicio
    const { count: enServicio } = await supabase
      .from('conductor')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'en_servicio');

    return {
      data: {
        total: total || 0,
        activos: activos || 0,
        disponibles: disponibles || 0,
        enServicio: enServicio || 0,
        porcentajeActivos: total > 0 ? ((activos / total) * 100).toFixed(1) : 0,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de conductores:', error);
    return { data: null, error };
  }
}
