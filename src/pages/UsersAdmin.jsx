import React, { useEffect, useMemo, useState } from 'react';
import {
  Users as UsersIcon,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  AlertCircle,
} from 'lucide-react';
import { userService, ALLOWED_ROLES } from '../services/userService';
import securityService from '../services/securityService';

const ROLES = ALLOWED_ROLES.map((r) => ({ value: r, label: r.toUpperCase() }));

export default function UsersAdmin() {
  const [list, setList] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('supervisor');
  const [password, setPassword] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editing, setEditing] = useState({
    name: '',
    email: '',
    role: 'supervisor',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      const { data, error } = await userService.list();
      if (error) setError(error.message || 'Error al cargar usuarios');
      const mapped = (data || []).map((u) => ({
        id: u.id_usuario,
        name: u.username,
        email: u.email,
        role: u.rol,
        createdAt: new Date().toISOString(),
        activo: u.activo !== false,
      }));
      setList(mapped);
      setLoading(false);
    })();
  }, []);

  const addUser = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('Nombre es obligatorio');
    if (!role) return alert('Seleccione un rol');
    if (!password.trim()) return alert('Contraseña es obligatoria');
    setLoading(true);
    const { data, error } = await userService.create({
      username: name.trim(),
      email: email.trim() || null,
      rol: role,
      password: password.trim(),
    });
    if (error) {
      setError(error.message || 'Error al crear usuario');
    } else {
      // Refrescar lista
      const { data: fresh } = await userService.list();
      const mapped = (fresh || []).map((u) => ({
        id: u.id_usuario,
        name: u.username,
        email: u.email,
        role: u.rol,
        createdAt: new Date().toISOString(),
      }));
      setList(mapped);
      setName('');
      setEmail('');
      setRole('supervisor');
      setPassword('');
    }
    setLoading(false);
  };
  const removeUser = async (id, username) => {
    const confirmMsg = username
      ? `¿Eliminar usuario "${username}"?\n\nSi es un conductor, también se eliminará su acceso de autenticación.`
      : '¿Eliminar usuario?';

    if (!confirm(confirmMsg)) return;

    setLoading(true);
    setError('');

    try {
      // Intentar eliminar desde seguridad (elimina usuario y su acceso)
      const {
        success,
        message,
        error: deleteError,
      } = await securityService.deleteUser(id, username, 'conductor');

      if (!success) {
        // Si falla la eliminación desde seguridad, intentar con el método normal
        console.warn(
          'No se pudo eliminar desde seguridad, intentando método normal...'
        );
        const { error: normalError } = await userService.remove(id);
        if (normalError) {
          setError(normalError.message || 'Error al eliminar usuario');
          setLoading(false);
          return;
        }
      }

      // Recargar lista
      const { data: fresh } = await userService.list();
      const mapped = (fresh || []).map((u) => ({
        id: u.id_usuario,
        name: u.username,
        email: u.email,
        role: u.rol,
        createdAt: new Date().toISOString(),
      }));
      setList(mapped);
      alert(message || 'Usuario eliminado exitosamente');
    } catch (err) {
      setError(err.message || 'Error inesperado al eliminar usuario');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (u) => {
    setEditingId(u.id);
    setEditing({ name: u.name, email: u.email, role: u.role });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditing({ name: '', email: '', role: 'supervisor' });
  };

  const saveEdit = async (id) => {
    if (!editing.name.trim()) return alert('Nombre es obligatorio');
    if (!editing.role) return alert('Seleccione un rol');
    setLoading(true);
    // Actualizar perfil completo (nombre/email/rol)
    await userService.updateProfile(id, {
      username: editing.name.trim(),
      email: editing.email.trim(),
      rol: editing.role,
    });
    const { data: fresh } = await userService.list();
    const mapped = (fresh || []).map((u) => ({
      id: u.id_usuario,
      name: u.username,
      email: u.email,
      role: u.rol,
      createdAt: new Date().toISOString(),
    }));
    setList(mapped);
    cancelEdit();
    setLoading(false);
  };

  const countByRole = useMemo(() => {
    return list.reduce(
      (acc, u) => ({ ...acc, [u.role]: (acc[u.role] || 0) + 1 }),
      {}
    );
  }, [list]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <UsersIcon size={18} />
          </div>
          <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        </div>
        <div className="text-sm text-gray-600">
          Administra usuarios y roles desde la base de datos
        </div>
      </div>

      {/* Resumen dinámico por rol existente en BD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.keys(countByRole).length === 0 ? (
          <div className="text-sm text-gray-500">Sin usuarios registrados</div>
        ) : (
          Object.entries(countByRole).map(([roleKey, count]) => (
            <div key={roleKey} className="border rounded-lg p-4">
              <div className="text-sm text-gray-500">
                {String(roleKey).toUpperCase()}
              </div>
              <div className="text-2xl font-semibold">{count}</div>
            </div>
          ))
        )}
      </div>

      {/* Formulario */}
      <form
        onSubmit={addUser}
        className="bg-white border rounded-lg p-4 grid grid-cols-1 md:grid-cols-5 gap-3"
      >
        <div className="md:col-span-2">
          <label className="text-sm text-gray-600">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="Ej: Ana Pérez"
            required
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Email (opcional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="ana@empresa.com"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="Mínimo 8 caracteres"
            required
            minLength={8}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border rounded p-2"
            required
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-5 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2"
          >
            <Plus size={16} /> Agregar
          </button>
        </div>
      </form>

      {/* Tabla */}
      <div className="bg-white border rounded-lg overflow-x-auto">
        {loading && (
          <div className="p-3 text-sm text-gray-500">Cargando...</div>
        )}
        {error && <div className="p-3 text-sm text-red-600">{error}</div>}
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 border-b">Nombre</th>
              <th className="text-left p-3 border-b">Email</th>
              <th className="text-left p-3 border-b">Rol</th>
              <th className="text-left p-3 border-b">Creado</th>
              <th className="text-right p-3 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={5}>
                  Sin usuarios
                </td>
              </tr>
            ) : (
              list.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-3 border-b">
                    {editingId === u.id ? (
                      <input
                        value={editing.name}
                        onChange={(e) =>
                          setEditing((s) => ({ ...s, name: e.target.value }))
                        }
                        className="border rounded p-1 w-full"
                      />
                    ) : (
                      <span>{u.name}</span>
                    )}
                  </td>
                  <td className="p-3 border-b">
                    {editingId === u.id ? (
                      <input
                        value={editing.email}
                        onChange={(e) =>
                          setEditing((s) => ({ ...s, email: e.target.value }))
                        }
                        className="border rounded p-1 w-full"
                      />
                    ) : (
                      <span className="text-gray-600">{u.email || '-'}</span>
                    )}
                  </td>
                  <td className="p-3 border-b">
                    {editingId === u.id ? (
                      <select
                        value={editing.role}
                        onChange={(e) =>
                          setEditing((s) => ({ ...s, role: e.target.value }))
                        }
                        className="border rounded p-1"
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="uppercase text-gray-700 text-xs px-2 py-1 rounded bg-gray-100">
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="p-3 border-b text-gray-600">
                    {new Date(u.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 border-b text-right">
                    {editingId === u.id ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => saveEdit(u.id)}
                          className="px-2 py-1 bg-green-600 text-white rounded flex items-center gap-1"
                        >
                          <Save size={14} /> Guardar
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-2 py-1 bg-gray-200 rounded flex items-center gap-1"
                        >
                          <X size={14} /> Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => startEdit(u)}
                          className="px-2 py-1 bg-blue-600 text-white rounded flex items-center gap-1"
                        >
                          <Edit2 size={14} /> Editar
                        </button>
                        <button
                          onClick={() => removeUser(u.id, u.name)}
                          className="px-2 py-1 bg-red-600 text-white rounded flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Información de error global */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle
            size={20}
            className="text-red-600 flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-red-800 font-semibold">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Sección: Gestión de Conductores desde Seguridad */}
      <div className="mt-8 p-6 bg-orange-50 border-2 border-orange-200 rounded-lg">
        <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
          <AlertCircle size={20} />
          🔐 Gestión de Conductores desde Seguridad
        </h3>
        <p className="text-sm text-orange-800 mb-4">
          Aquí puedes eliminar conductores y revocar su acceso de autenticación
          de forma atómica. También verifica qué conductores están dados de alta
          en el sistema.
        </p>
        <div className="mt-4 p-4 bg-white border border-orange-100 rounded text-xs text-gray-600">
          <p className="font-semibold mb-2">📌 Notas importantes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Eliminar un conductor elimina tanto su registro como su usuario de
              acceso
            </li>
            <li>Esta acción es irreversible - asegúrate de tener respaldos</li>
            <li>
              Los usuarios creados con cédula como username se eliminan
              automáticamente
            </li>
            <li>
              Usa el script CLEAN_DRIVERS_AND_USERS.sql para limpiar toda la
              tabla de una vez
            </li>
          </ul>
        </div>
      </div>

      {/* Ayuda */}
      <div className="mt-4 text-xs text-gray-500">
        <p>
          📝 Nota: La creación usa una contraseña temporal en el servidor.
          Ajusta políticas de seguridad/RLS en Supabase para producción.
        </p>
        <p className="mt-2">
          🔗 Ver también: Scripts en{' '}
          <code>scripts/CLEAN_DRIVERS_AND_USERS.sql</code> y{' '}
          <code>scripts/CREATE_RPC_DELETE_USER.sql</code>
        </p>
      </div>
    </div>
  );
}
