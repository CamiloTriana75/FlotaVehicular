/**
 * Servicio de Seguridad - Gestión de usuarios y permisos
 *
 * Proporciona funcionalidades para gestionar usuarios desde la interfaz de Seguridad
 * incluyendo eliminación de conductores y sus usuarios asociados
 */

import { supabase, isInMockMode } from '../lib/supabaseClient';

export const securityService = {
  /**
   * Elimina un usuario y si es conductor, también elimina su registro en drivers
   * @param {number} userId - ID del usuario a eliminar
   * @param {string} username - Username del usuario (para buscar cédula)
   * @param {string} rol - Rol del usuario
   * @returns {Promise<{success: boolean, message: string, error: Error|null}>}
   */
  deleteUser: async (userId, username, rol = 'conductor') => {
    try {
      if (isInMockMode()) {
        // Modo mock
        const raw = localStorage.getItem('usersMockList');
        const list = raw ? JSON.parse(raw) : [];
        const updated = list.filter((u) => u.id !== userId);
        localStorage.setItem('usersMockList', JSON.stringify(updated));
        return {
          success: true,
          message: `Usuario ${username} eliminado exitosamente (mock)`,
          error: null,
        };
      }

      // Modo real - usar RPC para eliminar por username (más seguro)
      const { data, error } = await supabase.rpc('delete_user_by_username', {
        p_username: username,
      });

      if (error) {
        console.error('Error al eliminar usuario:', error);
        return {
          success: false,
          message: `Error al eliminar usuario: ${error.message}`,
          error,
        };
      }

      // Verifica si el resultado de la RPC indica éxito
      if (data && Array.isArray(data) && data[0]?.success) {
        return {
          success: true,
          message: `Usuario ${username} eliminado exitosamente`,
          error: null,
        };
      } else if (data && data.success) {
        return {
          success: true,
          message: `Usuario ${username} eliminado exitosamente`,
          error: null,
        };
      }

      return {
        success: false,
        message: `No se pudo eliminar el usuario: ${data?.message || 'razón desconocida'}`,
        error: null,
      };
    } catch (err) {
      console.error('Error en deleteUser:', err);
      return {
        success: false,
        message: `Error inesperado: ${err.message}`,
        error: err,
      };
    }
  },

  /**
   * Elimina un usuario por su ID usando deactivate_user (eliminación lógica)
   * @param {number} userId - ID del usuario
   * @returns {Promise<{success: boolean, error: Error|null}>}
   */
  deactivateUser: async (userId) => {
    try {
      if (isInMockMode()) {
        const raw = localStorage.getItem('usersMockList');
        const list = raw ? JSON.parse(raw) : [];
        const updated = list.filter((u) => u.id !== userId);
        localStorage.setItem('usersMockList', JSON.stringify(updated));
        return { success: true, error: null };
      }

      const { data, error } = await supabase.rpc('deactivate_user', {
        p_user_id: userId,
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (err) {
      console.error('Error al desactivar usuario:', err);
      return { success: false, error: err };
    }
  },

  /**
   * Obtiene todos los usuarios conductores para auditoría
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  getConductorUsers: async () => {
    try {
      if (isInMockMode()) {
        const raw = localStorage.getItem('usersMockList');
        const list = raw ? JSON.parse(raw) : [];
        return {
          data: list.filter((u) => u.role === 'conductor'),
          error: null,
        };
      }

      const { data, error } = await supabase
        .from('usuario')
        .select('id_usuario, username, email, rol, activo, created_at')
        .eq('rol', 'conductor')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Error al obtener usuarios conductores:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Obtiene todos los conductores con sus usuarios asociados
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  getConductorsWithUsers: async () => {
    try {
      if (isInMockMode()) {
        return { data: [], error: null };
      }

      // Obtener drivers con información de usuario
      const { data: drivers, error: driversError } = await supabase
        .from('drivers')
        .select('id, cedula, nombre, apellidos, email, estado')
        .order('nombre', { ascending: true });

      if (driversError) throw driversError;

      if (!drivers || drivers.length === 0) {
        return { data: [], error: null };
      }

      // Obtener información de usuarios de los conductores
      const cedulas = drivers.map((d) => d.cedula).filter(Boolean);

      let users = [];
      if (cedulas.length > 0) {
        const { data: userData, error: userError } = await supabase
          .from('usuario')
          .select('id_usuario, username, email, rol, activo, created_at')
          .in('username', cedulas);

        if (userError) {
          console.warn('Error al obtener datos de usuarios:', userError);
        } else {
          users = userData || [];
        }
      }

      // Combinar información
      const combined = drivers.map((driver) => {
        const usuario = users.find((u) => u.username === driver.cedula);
        return {
          ...driver,
          usuario: usuario || null,
          tieneAcceso: !!usuario,
        };
      });

      return { data: combined, error: null };
    } catch (err) {
      console.error('Error al obtener conductores con usuarios:', err);
      return { data: null, error: err };
    }
  },
};

export default securityService;
