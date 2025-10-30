// Cliente Supabase configurado para modo mock por defecto
import { createClient } from '@supabase/supabase-js';

// Configuración mock por defecto
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key';

// Cliente Supabase (solo se usa si hay configuración real)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sistema de autenticación mock para desarrollo
export const mockAuth = {
  signIn: async (email, password) => {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (email && password) {
      const mockUser = {
        id: 'mock-user-id',
        email: email,
        user_metadata: {
          full_name: 'Usuario Demo',
        },
        role: 'admin',
      };
      return {
        data: { user: mockUser },
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
    return { error: null };
  },

  getUser: () => {
    const mockUser = localStorage.getItem('mockUser');
    return mockUser ? JSON.parse(mockUser) : null;
  },

  // Función para verificar si estamos en modo mock
  isMockMode: () => {
    return (
      !import.meta.env.VITE_SUPABASE_URL ||
      import.meta.env.VITE_SUPABASE_URL === 'https://mock.supabase.co'
    );
  },
};

// Exportar por defecto el modo que se debe usar
export const useAuth = () => {
  const isMock = mockAuth.isMockMode();

  return {
    signIn: isMock ? mockAuth.signIn : supabase.auth.signInWithPassword,
    signOut: isMock ? mockAuth.signOut : supabase.auth.signOut,
    getUser: isMock ? mockAuth.getUser : () => supabase.auth.getUser(),
    isMockMode: isMock,
  };
};
