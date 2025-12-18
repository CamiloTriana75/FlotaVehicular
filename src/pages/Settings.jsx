import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  MapPin,
  Wrench,
  Database,
  Key,
  Globe,
  Smartphone,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit2,
  X,
  Download,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { userService, ALLOWED_ROLES } from '../services/userService';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: 'FleetManager Colombia',
    nit: '900.123.456-7',
    address: 'Calle 123 #45-67, Bogotá',
    phone: '+57 1 234 5678',
  });

  // Estados para gestión de usuarios - MOVIDOS AL NIVEL SUPERIOR
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'supervisor',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editing, setEditing] = useState({ name: '', email: '', role: '' });

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'users', name: 'Usuarios', icon: User },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'integrations', name: 'Integraciones', icon: Globe },
    { id: 'system', name: 'Sistema', icon: Database },
  ];

  const handleSaveCompanyData = () => {
    localStorage.setItem('companyData', JSON.stringify(companyData));
    // Disparar evento para actualizar TopBar
    window.dispatchEvent(new Event('companyDataUpdated'));
    alert('Información de la empresa guardada correctamente');
  };

  // Cargar datos de empresa
  useEffect(() => {
    const saved = localStorage.getItem('companyData');
    if (saved) {
      try {
        setCompanyData(JSON.parse(saved));
      } catch (e) {
        console.error('Error al cargar datos de empresa:', e);
      }
    }
  }, []);

  // Cargar usuarios cuando se cambia a la pestaña de usuarios
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await userService.list();
    if (!error && data) {
      const mapped = data.map((u) => ({
        id: u.id_usuario,
        name: u.username,
        email: u.email,
        role: u.rol,
        status: u.activo ? 'Activo' : 'Inactivo',
      }));
      setUsers(mapped);
    }
    setLoading(false);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.password.trim()) {
      alert('Nombre y contraseña son obligatorios');
      return;
    }
    setLoading(true);
    const { data, error } = await userService.create({
      username: newUser.name.trim(),
      email: newUser.email.trim() || null,
      rol: newUser.role,
      password: newUser.password.trim(),
    });
    if (!error) {
      await loadUsers();
      setNewUser({ name: '', email: '', role: 'supervisor', password: '' });
      alert('Usuario creado correctamente');
    } else {
      alert('Error al crear usuario: ' + (error.message || 'Desconocido'));
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    setLoading(true);
    await userService.remove(id);
    await loadUsers();
    setLoading(false);
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditing({ name: user.name, email: user.email, role: user.role });
  };

  const saveEdit = async (id) => {
    if (!editing.name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }
    setLoading(true);
    await userService.updateProfile(id, {
      username: editing.name.trim(),
      email: editing.email.trim(),
      rol: editing.role,
    });
    await loadUsers();
    setEditingId(null);
    setLoading(false);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Información de la Empresa
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Empresa
            </label>
            <input
              type="text"
              value={companyData.name}
              onChange={(e) =>
                setCompanyData({ ...companyData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NIT
            </label>
            <input
              type="text"
              value={companyData.nit}
              onChange={(e) =>
                setCompanyData({ ...companyData, nit: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <input
              type="text"
              value={companyData.address}
              onChange={(e) =>
                setCompanyData({ ...companyData, address: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="text"
              value={companyData.phone}
              onChange={(e) =>
                setCompanyData({ ...companyData, phone: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSaveCompanyData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Información</span>
          </button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configuración de Flota
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zona Horaria
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>America/Bogota (GMT-5)</option>
              <option>America/New_York (GMT-5)</option>
              <option>Europe/Madrid (GMT+1)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unidad de Distancia
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Kilómetros</option>
              <option>Millas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unidad de Combustible
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Litros</option>
              <option>Galones</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moneda
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Peso Colombiano (COP)</option>
              <option>Dólar Americano (USD)</option>
              <option>Euro (EUR)</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderUserSettings = () => {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Gestión de Usuarios
            </h3>
          </div>

          {/* Formulario para agregar usuario */}
          <form
            onSubmit={handleAddUser}
            className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4"
          >
            <h4 className="font-medium text-gray-900">Agregar Nuevo Usuario</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del usuario"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (opcional)
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="email@empresa.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol *
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {ALLOWED_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña *
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:bg-gray-400"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Usuario</span>
              </button>
            </div>
          </form>

          {/* Lista de usuarios */}
          <div className="space-y-4">
            {loading && <p className="text-sm text-gray-500">Cargando...</p>}
            {!loading && users.length === 0 && (
              <p className="text-sm text-gray-500">
                No hay usuarios registrados
              </p>
            )}
            {!loading &&
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  {editingId === user.id ? (
                    <>
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={editing.name}
                          onChange={(e) =>
                            setEditing({ ...editing, name: e.target.value })
                          }
                          className="px-2 py-1 border rounded"
                          placeholder="Nombre"
                        />
                        <input
                          type="email"
                          value={editing.email}
                          onChange={(e) =>
                            setEditing({ ...editing, email: e.target.value })
                          }
                          className="px-2 py-1 border rounded"
                          placeholder="Email"
                        />
                        <select
                          value={editing.role}
                          onChange={(e) =>
                            setEditing({ ...editing, role: e.target.value })
                          }
                          className="px-2 py-1 border rounded"
                        >
                          {ALLOWED_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {role.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => saveEdit(user.id)}
                          className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {user.email || 'Sin email'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {user.role.toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.status === 'Activo'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.status}
                        </span>
                        <button
                          onClick={() => startEdit(user)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
          </div>
        </Card>
      </div>
    );
  };

  const renderNotifications = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configuración de Notificaciones
        </h3>
        <div className="space-y-4">
          {[
            {
              name: 'Alertas de Combustible',
              description: 'Notificaciones cuando el combustible esté bajo',
              enabled: true,
            },
            {
              name: 'Mantenimiento Programado',
              description: 'Recordatorios de mantenimiento preventivo',
              enabled: true,
            },
            {
              name: 'Exceso de Velocidad',
              description: 'Alertas por exceso de velocidad',
              enabled: true,
            },
            {
              name: 'Incidentes',
              description: 'Notificaciones de incidentes y emergencias',
              enabled: true,
            },
            {
              name: 'Reportes Diarios',
              description: 'Resumen diario de la flota',
              enabled: false,
            },
          ].map((notification, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">{notification.name}</p>
                <p className="text-sm text-gray-500">
                  {notification.description}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={notification.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Integraciones Disponibles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: 'Google Maps',
              description: 'Integración con mapas y rutas',
              status: 'Conectado',
              icon: MapPin,
            },
            {
              name: 'Waze',
              description: 'Información de tráfico en tiempo real',
              status: 'Disponible',
              icon: Globe,
            },
            {
              name: 'WhatsApp Business',
              description: 'Notificaciones por WhatsApp',
              status: 'Disponible',
              icon: Smartphone,
            },
            {
              name: 'SAP',
              description: 'Integración con sistema ERP',
              status: 'No disponible',
              icon: Database,
            },
          ].map((integration, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <integration.icon className="w-5 h-5 text-gray-600" />
                <h4 className="font-medium text-gray-900">
                  {integration.name}
                </h4>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {integration.description}
              </p>
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    integration.status === 'Conectado'
                      ? 'bg-green-100 text-green-800'
                      : integration.status === 'Disponible'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {integration.status}
                </span>
                <button
                  className={`px-3 py-1 text-sm rounded-lg ${
                    integration.status === 'Conectado'
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : integration.status === 'Disponible'
                        ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {integration.status === 'Conectado'
                    ? 'Desconectar'
                    : integration.status === 'Disponible'
                      ? 'Conectar'
                      : 'No disponible'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const createBackup = async () => {
    try {
      setLoading(true);
      const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
          companyData: JSON.parse(localStorage.getItem('companyData') || '{}'),
          users: users,
          systemSettings: {
            updateFrequency: localStorage.getItem('updateFrequency') || '30s',
            dataRetention: localStorage.getItem('dataRetention') || '1year',
            speedThreshold: localStorage.getItem('speedThreshold') || '80',
          },
        },
      };

      // Crear archivo JSON para descargar
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_flota_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Guardar también en localStorage como último backup
      localStorage.setItem('lastBackup', JSON.stringify(backup));
      localStorage.setItem('lastBackupDate', new Date().toISOString());

      alert('✅ Respaldo creado y descargado correctamente');
      setLoading(false);
    } catch (error) {
      console.error('Error al crear respaldo:', error);
      alert('❌ Error al crear respaldo: ' + error.message);
      setLoading(false);
    }
  };

  const restoreBackup = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const text = await file.text();
      const backup = JSON.parse(text);

      // Validar estructura del backup
      if (!backup.version || !backup.data) {
        throw new Error('Formato de respaldo inválido');
      }

      // Confirmar restauración
      if (
        !confirm(
          `¿Restaurar respaldo del ${new Date(backup.timestamp).toLocaleString()}?\n\nEsto sobrescribirá los datos actuales.`
        )
      ) {
        setLoading(false);
        return;
      }

      // Restaurar datos de empresa
      if (backup.data.companyData) {
        localStorage.setItem(
          'companyData',
          JSON.stringify(backup.data.companyData)
        );
        setCompanyData(backup.data.companyData);
        window.dispatchEvent(new Event('companyDataUpdated'));
      }

      // Restaurar configuraciones del sistema
      if (backup.data.systemSettings) {
        Object.entries(backup.data.systemSettings).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
      }

      alert('✅ Respaldo restaurado correctamente. Recargando página...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error al restaurar respaldo:', error);
      alert('❌ Error al restaurar respaldo: ' + error.message);
      setLoading(false);
    }
  };

  const getLastBackupDate = () => {
    const date = localStorage.getItem('lastBackupDate');
    if (!date) return 'Nunca';
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configuración del Sistema
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frecuencia de Actualización de Ubicación
            </label>
            <select
              defaultValue={localStorage.getItem('updateFrequency') || '30s'}
              onChange={(e) =>
                localStorage.setItem('updateFrequency', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="30s">30 segundos</option>
              <option value="1m">1 minuto</option>
              <option value="5m">5 minutos</option>
              <option value="10m">10 minutos</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Retención de Datos Históricos
            </label>
            <select
              defaultValue={localStorage.getItem('dataRetention') || '1year'}
              onChange={(e) =>
                localStorage.setItem('dataRetention', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="6months">6 meses</option>
              <option value="1year">1 año</option>
              <option value="2years">2 años</option>
              <option value="5years">5 años</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Umbral de Velocidad (km/h)
            </label>
            <input
              type="number"
              defaultValue={localStorage.getItem('speedThreshold') || '80'}
              onChange={(e) =>
                localStorage.setItem('speedThreshold', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Database className="w-5 h-5 text-blue-600" />
          <span>Respaldo y Recuperación</span>
        </h3>
        <div className="space-y-4">
          {/* Crear Respaldo */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900 flex items-center space-x-2">
                  <Save className="w-4 h-4 text-blue-600" />
                  <span>Crear Respaldo Manual</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Último respaldo: {getLastBackupDate()}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Incluye: datos de empresa, configuraciones del sistema
                </p>
              </div>
              <button
                onClick={createBackup}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>{loading ? 'Creando...' : 'Crear Respaldo'}</span>
              </button>
            </div>
          </div>

          {/* Restaurar Respaldo */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900 flex items-center space-x-2">
                  <Database className="w-4 h-4 text-green-600" />
                  <span>Restaurar desde Respaldo</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Selecciona un archivo de respaldo (.json)
                </p>
                <p className="text-xs text-red-500 mt-2">
                  ⚠️ Advertencia: Esto sobrescribirá los datos actuales
                </p>
              </div>
              <label className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-center space-x-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={restoreBackup}
                  className="hidden"
                  disabled={loading}
                />
                <Upload className="w-4 h-4" />
                <span>Seleccionar Archivo</span>
              </label>
            </div>
          </div>

          {/* Información adicional */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Importante:</span>
            </p>
            <ul className="text-xs text-yellow-700 mt-2 ml-6 space-y-1 list-disc">
              <li>Los respaldos se descargan como archivos JSON</li>
              <li>Guarda los respaldos en un lugar seguro</li>
              <li>Los respaldos NO incluyen datos de la base de datos</li>
              <li>Para respaldo completo, consulta con tu administrador</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'users':
        return renderUserSettings();
      case 'notifications':
        return renderNotifications();
      case 'integrations':
        return renderIntegrations();
      case 'system':
        return renderSystemSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-1">
            Gestiona la configuración del sistema
          </p>
        </div>
        <button className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Save className="w-4 h-4" />
          <span>Guardar Cambios</span>
        </button>
      </div>

      {/* Tabs */}
      <Card className="p-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default Settings;
