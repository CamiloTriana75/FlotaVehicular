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
  import.meta.env.VITE_SUPABASE_URL ||
  'https://nqsfitpsygpwfglchihl.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2ZpdHBzeWdwd2ZnbGNoaWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTc4MzAsImV4cCI6MjA3NTQ3MzgzMH0.irv8AM9lW6-pf2f0D0qmLoYH-FbHrtaml9H9qWEYfi0';
const isMockMode = import.meta.env.VITE_MOCK_MODE === 'true';

const MOCK_USERS = [
  {
    id: 'mock-admin',
    email: 'admin@flotavehicular.com',
    password: 'Admin123!',
    role: 'admin',
    fullName: 'Administrador',
  },
  {
    id: 'mock-mecanico',
    email: 'mecanico@flotavehicular.com',
    password: 'Mecanico123!',
    role: 'mecanico',
    fullName: 'Mecánico Demo',
  },
];

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
  // Intento rápido contra una tabla estable del nuevo esquema: 'vehicles'
  // Usamos head + count para minimizar carga.
  try {
    const { error } = await supabase
      .from('vehicles')
      .select('id', { count: 'exact', head: true })
      .limit(1);
    if (error) throw error;
    return {
      connected: true,
      message: 'Conexión exitosa con Supabase (tabla vehicles accesible)',
      mode: 'real',
    };
  } catch (err) {
    return {
      connected: false,
      message: `Fallo al consultar Supabase: ${err.message}`,
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

    const normalizedEmail = (email || '').toLowerCase();
    const matchedUser = MOCK_USERS.find((u) => u.email === normalizedEmail);

    if (matchedUser && matchedUser.password !== password) {
      return { data: null, error: { message: 'Contraseña incorrecta' } };
    }

    const userData = matchedUser || {
      id: 'mock-user-id',
      email,
      role: 'admin',
      fullName: email || 'Usuario',
    };

    const mockUser = {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      user_metadata: {
        full_name: userData.fullName,
        role: userData.role,
      },
    };

    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    return {
      data: { user: mockUser, session: { access_token: 'mock-token' } },
      error: null,
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
