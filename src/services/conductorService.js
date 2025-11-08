import { supabase } from '../lib/supabaseClient';

/**
 * Servicio para operaciones CRUD de conductores
 */
export const conductorService = {
  /**
   * Obtener todos los conductores
   * @param {Object} filters - Filtros opcionales (estado, busqueda)
   * @returns {Promise<{data: Array, error: Error}>}
   */
  getAll: async (filters = {}) => {
    try {
      let query = supabase
        .from('conductor')
        .select('*')
        .order('fecha_ingreso', { ascending: false });

      // Aplicar filtros
      if (filters.estado) {
        query = query.eq('estado', filters.estado);
      }

      if (filters.search) {
        query = query.or(
          `nombre_completo.ilike.%${filters.search}%,cedula.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error al obtener conductores:', error);
      return { data: null, error };
    }
  },

  /**
   * Obtener un conductor por ID
   * @param {number} id - ID del conductor
   * @returns {Promise<{data: Object, error: Error}>}
   */
  getById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('conductor')
        .select('*')
        .eq('id_conductor', id)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error al obtener conductor:', error);
      return { data: null, error };
    }
  },

  /**
   * Crear un nuevo conductor
   * @param {Object} conductorData - Datos del conductor
   * @returns {Promise<{data: Object, error: Error}>}
   */
  create: async (conductorData) => {
    try {
      const { data, error } = await supabase
        .from('conductor')
        .insert([conductorData])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error al crear conductor:', error);
      return { data: null, error };
    }
  },

  /**
   * Actualizar un conductor existente
   * @param {number} id - ID del conductor
   * @param {Object} conductorData - Datos a actualizar
   * @returns {Promise<{data: Object, error: Error}>}
   */
  update: async (id, conductorData) => {
    try {
      const { data, error } = await supabase
        .from('conductor')
        .update({
          ...conductorData,
          updated_at: new Date().toISOString(),
        })
        .eq('id_conductor', id)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error al actualizar conductor:', error);
      return { data: null, error };
    }
  },

  /**
   * Eliminar un conductor
   * @param {number} id - ID del conductor
   * @returns {Promise<{data: Object, error: Error}>}
   */
  delete: async (id) => {
    try {
      const { data, error } = await supabase
        .from('conductor')
        .delete()
        .eq('id_conductor', id)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error al eliminar conductor:', error);
      return { data: null, error };
    }
  },

  /**
   * Obtener conductores disponibles (sin vehículo asignado)
   * @returns {Promise<{data: Array, error: Error}>}
   */
  getAvailable: async () => {
    try {
      const { data, error } = await supabase
        .from('conductor')
        .select('*')
        .eq('estado', 'disponible')
        .order('nombre_completo');

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error al obtener conductores disponibles:', error);
      return { data: null, error };
    }
  },

  /**
   * Verificar licencias próximas a vencer
   * @param {number} days - Días de anticipación (default: 30)
   * @returns {Promise<{data: Array, error: Error}>}
   */
  getExpiringLicenses: async (days = 30) => {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const { data, error } = await supabase
        .from('conductor')
        .select('*')
        .lte('fecha_venc_licencia', futureDate.toISOString().split('T')[0])
        .gte('fecha_venc_licencia', new Date().toISOString().split('T')[0])
        .order('fecha_venc_licencia');

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error al obtener licencias por vencer:', error);
      return { data: null, error };
    }
  },
};
