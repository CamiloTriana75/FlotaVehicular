import { supabase } from '../lib/supabaseClient';

/**
 * Servicio para operaciones sobre la tabla 'drivers'
 */
export const driverService = {
  /**
   * Crea un conductor en 'drivers' a partir del formulario de DriverForm
   * Mapea nombre_completo → nombre/apellidos y usa numero_licencia
   * @param {Object} formData
   */
  createFromForm: async (formData) => {
    // Separar nombre y apellidos a partir de nombre_completo
    const raw = (formData.nombre_completo || '').trim().replace(/\s+/g, ' ');
    let nombre = raw;
    let apellidos = '';
    if (raw.includes(' ')) {
      const parts = raw.split(' ');
      nombre = parts.shift();
      apellidos = parts.join(' ');
    }

    const payload = {
      cedula: formData.cedula || null,
      nombre: nombre || null,
      apellidos: apellidos || null,
      telefono: formData.telefono || null,
      email: formData.email || null,
      direccion: formData.direccion || null,
      numero_licencia: formData.numero_licencia || null,
      estado: formData.estado || 'activo',
    };

    try {
      const { data, error } = await supabase
        .from('drivers')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error al crear driver en tabla drivers:', error);
      return { data: null, error };
    }
  },
  /** Obtener todos los drivers */
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select(
          'id, cedula, nombre, apellidos, numero_licencia, telefono, email, estado'
        )
        .order('id', { ascending: false });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error al obtener drivers:', error);
      return { data: null, error };
    }
  },
  /** Obtener driver por ID */
  getById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select(
          'id, cedula, nombre, apellidos, numero_licencia, telefono, email, direccion, estado'
        )
        .eq('id', id)
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error al obtener driver:', error);
      return { data: null, error };
    }
  },
  /** Actualizar driver */
  update: async (id, formData) => {
    try {
      // Reconstruir nombre/apellidos si viene nombre_completo
      let updatePayload = { ...formData };
      if (
        formData.nombre_completo &&
        (!formData.nombre || !formData.apellidos)
      ) {
        const raw = formData.nombre_completo.trim().replace(/\s+/g, ' ');
        let nombre = raw;
        let apellidos = '';
        if (raw.includes(' ')) {
          const parts = raw.split(' ');
          nombre = parts.shift();
          apellidos = parts.join(' ');
        }
        updatePayload.nombre = nombre;
        updatePayload.apellidos = apellidos;
      }
      // Limpiar campos no presentes en drivers
      delete updatePayload.nombre_completo;
      delete updatePayload.fecha_venc_licencia; // no existe en drivers
      delete updatePayload.fecha_ingreso; // no existe en drivers

      const { data, error } = await supabase
        .from('drivers')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error al actualizar driver:', error);
      return { data: null, error };
    }
  },
  /** Eliminar driver */
  delete: async (id) => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error al eliminar driver:', error);
      return { data: null, error };
    }
  },
};
