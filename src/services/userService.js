import { supabase, isInMockMode } from '../lib/supabaseClient';

// Roles permitidos desde UI
export const ALLOWED_ROLES = [
  'admin',
  'supervisor',
  'rrhh',
  'operador',
  'conductor',
];

// Validación ligera de payload
function sanitizeUserPayload(payload) {
  const out = {
    username: payload.username?.trim() || payload.name?.trim() || null,
    email: payload.email?.trim() || null,
    rol: ALLOWED_ROLES.includes(payload.rol) ? payload.rol : 'supervisor',
    activo: payload.activo ?? true,
  };
  return out;
}

export const userService = {
  // Listado básico de usuarios (sin password_hash)
  async list() {
    if (isInMockMode()) {
      // Fallback a mock desde localStorage para desarrollo sin backend
      try {
        const raw = localStorage.getItem('usersMockList');
        const list = raw ? JSON.parse(raw) : [];
        return {
          data: list.map((u) => ({
            id_usuario: u.id,
            username: u.name,
            email: u.email,
            rol: u.role,
            activo: true,
            created_at: u.createdAt,
          })),
          error: null,
        };
      } catch (e) {
        return { data: [], error: e };
      }
    }

    const { data, error } = await supabase
      .from('usuario')
      .select('id_usuario, username, email, rol, activo')
      .order('id_usuario', { ascending: false });
    return { data, error };
  },

  // Crear usuario (DB): password es obligatorio desde el formulario
  async create({ username, email, rol, password }) {
    const payload = sanitizeUserPayload({ username, email, rol });

    // Validación básica en cliente
    if (!payload.username) {
      return {
        data: null,
        error: new Error('El nombre de usuario es obligatorio'),
      };
    }
    if (!payload.email) {
      return { data: null, error: new Error('El email es obligatorio') };
    }

    // Validar duplicados por username o email antes de RPC
    const [usernameDup, emailDup] = await Promise.all([
      supabase
        .from('usuario')
        .select('id_usuario')
        .eq('username', payload.username)
        .maybeSingle(),
      supabase
        .from('usuario')
        .select('id_usuario')
        .eq('email', payload.email)
        .maybeSingle(),
    ]);

    if (usernameDup.error) return { data: null, error: usernameDup.error };
    if (emailDup.error) return { data: null, error: emailDup.error };

    const conflicts = [];
    if (usernameDup.data) conflicts.push('nombre de usuario');
    if (emailDup.data) conflicts.push('email');

    if (conflicts.length > 0) {
      return {
        data: null,
        error: new Error(
          `No se creó el usuario: ya existe ${conflicts.join(', ')}`
        ),
      };
    }

    if (isInMockMode()) {
      // Guardar también en mock para entorno sin backend
      const raw = localStorage.getItem('usersMockList');
      const list = raw ? JSON.parse(raw) : [];
      const user = {
        id: Date.now(),
        name: payload.username,
        email: payload.email,
        role: payload.rol,
        createdAt: new Date().toISOString(),
      };
      const updated = [user, ...list];
      localStorage.setItem('usersMockList', JSON.stringify(updated));
      return { data: { id_usuario: user.id, ...user }, error: null };
    }

    // Usar la RPC con password del formulario
    try {
      const pwd = password || 'Temporal2025$'; // Fallback en caso de llamada sin password
      const { data, error } = await supabase.rpc('create_user_with_password', {
        p_username: payload.username,
        p_email: payload.email || null,
        p_rol: payload.rol,
        p_password: pwd,
      });
      if (error) {
        // Manejar errores de clave única (email duplicado)
        if (
          error.code === '23505' ||
          (typeof error.message === 'string' &&
            (error.message.includes('usuario_email_key') ||
              error.message.includes('usuario_username_key')))
        ) {
          return {
            data: null,
            error: new Error(
              error.message.includes('username')
                ? 'Ya existe un usuario con ese nombre de usuario'
                : 'Ya existe un usuario con ese email'
            ),
          };
        }
        throw error;
      }
      return { data, error: null };
    } catch (e) {
      // Fallback de mensaje amigable
      if (
        e?.code === '23505' ||
        (typeof e?.message === 'string' &&
          (e.message.includes('usuario_email_key') ||
            e.message.includes('usuario_username_key')))
      ) {
        return {
          data: null,
          error: new Error(
            e.message.includes('username')
              ? 'Ya existe un usuario con ese nombre de usuario'
              : 'Ya existe un usuario con ese email'
          ),
        };
      }
      return { data: null, error: e };
    }
  },

  async updateProfile(id_usuario, { username, email, rol }) {
    // Validar rol si viene
    const safeRol = rol && ALLOWED_ROLES.includes(rol) ? rol : undefined;

    if (isInMockMode()) {
      const raw = localStorage.getItem('usersMockList');
      const list = raw ? JSON.parse(raw) : [];
      const updated = list.map((u) =>
        u.id === id_usuario
          ? {
              ...u,
              name: username ?? u.name,
              email: email ?? u.email,
              role: safeRol ?? u.role,
            }
          : u
      );
      localStorage.setItem('usersMockList', JSON.stringify(updated));
      return {
        data: { id_usuario, username, email, rol: safeRol },
        error: null,
      };
    }

    const { data, error } = await supabase.rpc('update_user_profile', {
      p_user_id: id_usuario,
      p_username: username ?? null,
      p_email: email ?? null,
      p_rol: safeRol ?? null,
    });
    if (error) return { data: null, error };
    const row = Array.isArray(data) ? data[0] : data;
    return { data: row, error: null };
  },

  async updateRole(id_usuario, rol) {
    if (!ALLOWED_ROLES.includes(rol)) {
      return { data: null, error: new Error('Rol no permitido') };
    }

    if (isInMockMode()) {
      const raw = localStorage.getItem('usersMockList');
      const list = raw ? JSON.parse(raw) : [];
      const updated = list.map((u) =>
        u.id === id_usuario ? { ...u, role: rol } : u
      );
      localStorage.setItem('usersMockList', JSON.stringify(updated));
      return { data: { id_usuario, rol }, error: null };
    }

    // Usar RPC para evitar problemas de RLS
    const { data, error } = await supabase.rpc('update_user_role', {
      p_user_id: id_usuario,
      p_rol: rol,
    });
    if (error) return { data: null, error };
    // Normalizar salida si la función retorna arreglo
    const row = Array.isArray(data) ? data[0] : data;
    return { data: row, error: null };
  },

  async remove(id_usuario) {
    if (isInMockMode()) {
      const raw = localStorage.getItem('usersMockList');
      const list = raw ? JSON.parse(raw) : [];
      const updated = list.filter((u) => u.id !== id_usuario);
      localStorage.setItem('usersMockList', JSON.stringify(updated));
      return { data: { id_usuario }, error: null };
    }

    // Eliminación lógica via RPC por RLS
    const { data, error } = await supabase.rpc('deactivate_user', {
      p_user_id: id_usuario,
    });
    if (error) return { data: null, error };
    const row = Array.isArray(data) ? data[0] : data;
    return { data: row, error: null };
  },
};

export default userService;
