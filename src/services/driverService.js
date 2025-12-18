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
    // Validación básica de campos obligatorios
    const requiredFields = {
      cedula: formData.cedula,
      numero_licencia: formData.numero_licencia,
      nombre_completo: formData.nombre_completo,
      email: formData.email,
    };

    const missing = Object.entries(requiredFields)
      .filter(([, v]) => !v || String(v).trim() === '')
      .map(([k]) => k);

    if (missing.length > 0) {
      return {
        data: null,
        error: new Error(`Faltan campos requeridos: ${missing.join(', ')}`),
      };
    }

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
      categoria_licencia: formData.categoria_licencia || null,
      fecha_expedicion_licencia: formData.fecha_expedicion_licencia || null,
      fecha_vencimiento_licencia: formData.fecha_vencimiento_licencia || null,
      estado: formData.estado || 'disponible',
    };

    console.log('🔍 DEBUG createFromForm - payload a enviar:', payload);

    // Asegurar que no se envían flags internos
    // (Supabase error: Could not find the '_createAccount' column of 'drivers')
    // Borra campos adicionales del objeto original
    const cleaned = { ...payload }; // payload ya sólo contiene columnas válidas

    try {
      // Validar unicidad específica (cedula, email, numero_licencia)
      const [cedulaDup, emailDup, licenciaDup] = await Promise.all([
        payload.cedula
          ? supabase
              .from('drivers')
              .select('id')
              .eq('cedula', payload.cedula)
              .maybeSingle()
          : { data: null, error: null },
        payload.email
          ? supabase
              .from('drivers')
              .select('id')
              .eq('email', payload.email)
              .maybeSingle()
          : { data: null, error: null },
        payload.numero_licencia
          ? supabase
              .from('drivers')
              .select('id')
              .eq('numero_licencia', payload.numero_licencia)
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

      const { data, error } = await supabase
        .from('drivers')
        .insert([cleaned])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      // Manejo de error amigable para violaciones de unicidad
      if (error?.code === '23505') {
        return {
          data: null,
          error: new Error(
            'No se creó el conductor: cédula, email o licencia ya están registrados'
          ),
        };
      }

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
          'id, cedula, nombre, apellidos, numero_licencia, categoria_licencia, fecha_vencimiento_licencia, telefono, email, estado'
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
          'id, cedula, nombre, apellidos, numero_licencia, categoria_licencia, fecha_expedicion_licencia, fecha_vencimiento_licencia, telefono, email, direccion, estado'
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
      delete updatePayload.fecha_ingreso; // no existe en drivers
      // Limpiar flags internos del formulario
      delete updatePayload._createAccount;
      delete updatePayload._password;

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
      // 1. Obtener los datos del driver antes de eliminarlo (para obtener la cédula)
      const { data: driverData, error: getError } = await supabase
        .from('drivers')
        .select('cedula, id')
        .eq('id', id)
        .single();

      if (getError) throw getError;

      // 2. Eliminar el registro del driver
      const { data, error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // 3. Si el driver tenía cédula, eliminar el usuario asociado
      if (driverData?.cedula) {
        try {
          // Intentar con RPC primero
          const { data: rpcResult, error: rpcError } = await supabase.rpc(
            'delete_user_by_username',
            { p_username: driverData.cedula }
          );

          if (rpcError) {
            // Si falla, intentar eliminación SQL directa
            console.warn('RPC falló, intentando SQL directo:', rpcError);

            const { error: sqlError } = await supabase
              .from('usuario')
              .delete()
              .eq('username', driverData.cedula)
              .eq('rol', 'conductor');

            if (sqlError) {
              console.warn(
                'No se pudo eliminar usuario desde seguridad:',
                sqlError
              );
            } else {
              console.log('✅ Usuario eliminado con SQL directo');
            }
          } else if (rpcResult?.success) {
            console.log('✅ Usuario eliminado con RPC:', rpcResult.message);
          }
        } catch (userDeleteErr) {
          console.warn('Error al eliminar usuario:', userDeleteErr);
          // No lanzar error - el driver ya fue eliminado exitosamente
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error al eliminar driver:', error);
      return { data: null, error };
    }
  },
};
