/**
 * Cliente Supabase - Configuración centralizada
 *
 * Este módulo maneja la conexión con Supabase y proporciona
 * funcionalidades de autenticación tanto para modo real como mock.
 */

import { createClient } from '@supabase/supabase-js';

// =====================================================
// CONFIGURACIÓN
// =====================================================

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key';
const isMockMode =
  import.meta.env.VITE_MOCK_MODE === 'true' ||
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL === 'https://mock.supabase.co';

// =====================================================
// CLIENTE SUPABASE
// =====================================================

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// =====================================================
// HELPERS
// =====================================================

/**
 * Verifica si la aplicación está en modo mock
 * @returns {boolean} true si está en modo mock
 */
export const isInMockMode = () => isMockMode;

/**
 * Verifica la conexión con Supabase
 * @returns {Promise<{connected: boolean, message: string}>}
 */
export const checkConnection = async () => {
  // Realiza una consulta HEAD (sin traer filas) para validar accesibilidad a una tabla base.
  // Usamos 'conductor' porque existe en el esquema legacy que decidiste mantener.
  // Si en algún entorno aún no existe, capturamos el error y lo reportamos.
  try {
    const { error } = await supabase
      .from('conductor')
      .select('id_conductor', { count: 'exact', head: true })
      .limit(1);

    if (error) throw error;

    return {
      connected: true,
      message: 'Conexión exitosa con Supabase (tabla conductor accesible)',
      mode: 'real',
    };
  } catch (error) {
    return {
      connected: false,
      message: `Fallo al consultar Supabase: ${error.message}`,
      mode: isMockMode ? 'mock' : 'error',
    };
  }
};

// =====================================================
// AUTENTICACIÓN PERSONALIZADA (Tabla 'usuario')
// =====================================================

/**
 * Autenticación personalizada contra la tabla 'usuario'
 * Usa la función SQL validate_user_login() para validar credenciales
 */
export const customAuth = {
  signIn: async (usernameOrEmail, password) => {
    try {
      // Llamar a la función SQL de validación
      const { data, error } = await supabase.rpc('validate_user_login', {
        p_username: usernameOrEmail,
        p_password: password,
      });

      if (error) {
        return {
          data: null,
          error: { message: `Error de autenticación: ${error.message}` },
        };
      }

      // Si no hay resultados o el login falló
      if (!data || data.length === 0 || !data[0].success) {
        return {
          data: null,
          error: { message: data?.[0]?.message || 'Credenciales inválidas' },
        };
      }

      // Login exitoso - crear objeto de usuario
      const userData = data[0];
      const user = {
        id: userData.id_usuario.toString(),
        id_usuario: userData.id_usuario,
        email: userData.email,
        username: userData.username,
        rol: userData.rol,
        activo: userData.activo,
        user_metadata: {
          full_name: userData.username,
          role: userData.rol,
        },
      };

      // Guardar en localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('mockUser', JSON.stringify(user)); // Compatibilidad con código existente

      return {
        data: {
          user: user,
          session: {
            access_token: 'custom-auth-token',
            user: user,
          },
        },
        error: null,
      };
    } catch (err) {
      console.error('Error en customAuth.signIn:', err);
      return {
        data: null,
        error: { message: `Error de conexión: ${err.message}` },
      };
    }
  },

  signOut: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    localStorage.removeItem('currentUser');
    localStorage.removeItem('mockUser');
    return { error: null };
  },

  getUser: async () => {
    const currentUser = localStorage.getItem('currentUser');
    return {
      data: { user: currentUser ? JSON.parse(currentUser) : null },
      error: null,
    };
  },

  getSession: async () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      return {
        data: {
          session: {
            user: user,
            access_token: 'custom-auth-token',
          },
        },
        error: null,
      };
    }
    return { data: { session: null }, error: null };
  },

  changePassword: async (userId, oldPassword, newPassword) => {
    try {
      const { data, error } = await supabase.rpc('change_user_password', {
        p_user_id: userId,
        p_old_password: oldPassword,
        p_new_password: newPassword,
      });

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      if (!data || !data[0].success) {
        return {
          data: null,
          error: {
            message: data?.[0]?.message || 'Error al cambiar contraseña',
          },
        };
      }

      return { data: data[0], error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  },
};

// =====================================================
// AUTENTICACIÓN MOCK (Para desarrollo sin conexión)
// =====================================================

export const mockAuth = {
  signIn: async (email, password) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (email && password) {
      const mockUser = {
        id: 'mock-user-id',
        email: email,
        user_metadata: {
          full_name: 'Usuario',
        },
        role: 'admin',
      };
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      return {
        data: { user: mockUser, session: { access_token: 'mock-token' } },
        error: null,
      };
    }
    return {
      data: null,
      error: { message: 'Email y contraseña son requeridos' },
    };
  },

  signOut: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    localStorage.removeItem('mockUser');
    return { error: null };
  },

  getUser: async () => {
    const mockUser = localStorage.getItem('mockUser');
    return {
      data: { user: mockUser ? JSON.parse(mockUser) : null },
      error: null,
    };
  },

  getSession: async () => {
    const mockUser = localStorage.getItem('mockUser');
    if (mockUser) {
      return {
        data: {
          session: {
            user: JSON.parse(mockUser),
            access_token: 'mock-token',
          },
        },
        error: null,
      };
    }
    return { data: { session: null }, error: null };
  },
};

// =====================================================
// WRAPPER DE AUTENTICACIÓN
// =====================================================

/**
 * Hook unificado de autenticación
 * Automáticamente usa mock, customAuth o Supabase según configuración
 */
export const useSupabaseAuth = () => {
  if (isMockMode) {
    return {
      signIn: mockAuth.signIn,
      signOut: mockAuth.signOut,
      getUser: mockAuth.getUser,
      getSession: mockAuth.getSession,
      isMockMode: true,
    };
  }

  // Usar autenticación personalizada contra tabla 'usuario'
  return {
    signIn: customAuth.signIn,
    signOut: customAuth.signOut,
    getUser: customAuth.getUser,
    getSession: customAuth.getSession,
    changePassword: customAuth.changePassword,
    isMockMode: false,
  };
};

// Alias para compatibilidad con imports existentes
export const useAuth = useSupabaseAuth;

// =====================================================
// LOGGING (Solo en desarrollo)
// =====================================================

if (import.meta.env.DEV) {
  console.log('🔧 Supabase Client Config:', {
    url: supabaseUrl,
    mode: isMockMode ? '🎭 MOCK' : '🌐 REAL',
    hasKey: !!supabaseAnonKey && supabaseAnonKey !== 'mock-anon-key',
  });
  if (!isMockMode) {
    // Lanza un chequeo inmediato y loguea el resultado para facilitar verificación manual
    checkConnection().then((r) => console.log('🔌 Supabase connectivity:', r));
  }
}
