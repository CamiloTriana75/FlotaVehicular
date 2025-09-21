import React, { useState } from 'react';
import Card from '../components/Card';
import {
  Settings,
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
} from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'users', name: 'Usuarios', icon: User },
    { id: 'security', name: 'Seguridad', icon: Shield },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'integrations', name: 'Integraciones', icon: Globe },
    { id: 'system', name: 'Sistema', icon: Database },
  ];

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
              defaultValue="FleetManager Colombia"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NIT
            </label>
            <input
              type="text"
              defaultValue="900.123.456-7"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <input
              type="text"
              defaultValue="Calle 123 #45-67, Bogotá"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="text"
              defaultValue="+57 1 234 5678"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
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

  const renderUserSettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Usuarios del Sistema
          </h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Agregar Usuario
          </button>
        </div>
        <div className="space-y-4">
          {[
            {
              name: 'Admin Usuario',
              email: 'admin@fleetmanager.com',
              role: 'Administrador',
              status: 'Activo',
            },
            {
              name: 'Supervisor 1',
              email: 'supervisor1@fleetmanager.com',
              role: 'Supervisor',
              status: 'Activo',
            },
            {
              name: 'Operador 1',
              email: 'operador1@fleetmanager.com',
              role: 'Operador',
              status: 'Activo',
            },
            {
              name: 'Conductor 1',
              email: 'conductor1@fleetmanager.com',
              role: 'Conductor',
              status: 'Inactivo',
            },
          ].map((user, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {user.role}
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
                <button className="text-blue-600 hover:text-blue-800 text-sm">
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configuración de Seguridad
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña Actual
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa tu contraseña actual"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ingresa tu nueva contraseña"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirma tu nueva contraseña"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Autenticación de Dos Factores
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">2FA Habilitado</p>
            <p className="text-sm text-gray-500">
              Protección adicional para tu cuenta
            </p>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Configurar
          </button>
        </div>
      </Card>
    </div>
  );

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
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>30 segundos</option>
              <option>1 minuto</option>
              <option>5 minutos</option>
              <option>10 minutos</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Retención de Datos Históricos
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>6 meses</option>
              <option>1 año</option>
              <option>2 años</option>
              <option>5 años</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Umbral de Velocidad (km/h)
            </label>
            <input
              type="number"
              defaultValue="80"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Respaldo y Recuperación
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Respaldo Automático</p>
              <p className="text-sm text-gray-500">
                Último respaldo: 15/01/2024 02:00
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Crear Respaldo
            </button>
          </div>
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">
                Restaurar desde Respaldo
              </p>
              <p className="text-sm text-gray-500">
                Selecciona un punto de restauración
              </p>
            </div>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Restaurar
            </button>
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
      case 'security':
        return renderSecuritySettings();
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
