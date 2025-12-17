import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { HR_CONFIG } from '../shared/constants';

/**
 * Valida los datos del conductor
 * @param {Object} data - Datos a validar
 * @returns {Object} Objeto con errores (vacío si no hay errores)
 */
export function validateDriverData(data) {
  const errors = {};

  // Nombre completo obligatorio
  if (!data.nombre_completo || data.nombre_completo.trim() === '') {
    errors.nombre_completo = 'El nombre completo es obligatorio';
  }

  // Cédula obligatoria
  if (!data.cedula || data.cedula.trim() === '') {
    errors.cedula = 'La cédula es obligatoria';
  }

  // Fecha de vencimiento de licencia (opcional): validar si se proporciona
  const fechaVenc =
    data.fecha_venc_licencia || data.fecha_vencimiento_licencia || null;
  if (fechaVenc) {
    const value = String(fechaVenc);
    const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoPattern.test(value)) {
      errors.fecha_venc_licencia = 'Formato de fecha inválido';
    } else {
      const [y, m, d] = value.split('-').map((p) => parseInt(p, 10));
      const fecha = new Date(y, m - 1, d);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (isNaN(fecha.getTime())) {
        errors.fecha_venc_licencia = 'Formato de fecha inválido';
      } else if (fecha < hoy) {
        errors.fecha_venc_licencia =
          'La fecha de vencimiento debe ser hoy o una fecha futura';
      }
    }
  }

  // Email válido (si se proporciona)
  if (data.email && data.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.email = 'Email inválido';
    }
  }

  // Número de licencia obligatorio para registro en 'drivers'
  if (!data.numero_licencia || String(data.numero_licencia).trim() === '') {
    errors.numero_licencia = 'El número de licencia es obligatorio';
  }

  return errors;
}

/**
 * Formulario de Conductor (Crear/Editar)
 * Componente reutilizable con validaciones
 */
function DriverForm({ initialData = {}, onSubmit, onCancel, mode = 'create' }) {
  const [formData, setFormData] = useState({
    nombre_completo: initialData.nombre_completo || '',
    cedula: initialData.cedula || '',
    telefono: initialData.telefono || '',
    email: initialData.email || '',
    numero_licencia: initialData.numero_licencia || '',
    categoria_licencia: initialData.categoria_licencia || '',
    fecha_expedicion_licencia: initialData.fecha_expedicion_licencia || '',
    fecha_vencimiento_licencia:
      initialData.fecha_vencimiento_licencia ||
      initialData.fecha_venc_licencia ||
      '',
    estado: initialData.estado || 'activo',
    direccion: initialData.direccion || '',
    fecha_ingreso:
      initialData.fecha_ingreso || new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [licenciaWarning, setLicenciaWarning] = useState(null);
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Verificar si la licencia vence pronto
    if (formData.fecha_vencimiento_licencia) {
      const hoy = new Date();
      const fecha = new Date(formData.fecha_vencimiento_licencia);
      const diasRestantes = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));

      if (
        diasRestantes >= 0 &&
        diasRestantes <= HR_CONFIG.LICENSE_EXPIRY_THRESHOLD_DAYS
      ) {
        setLicenciaWarning(diasRestantes);
      } else {
        setLicenciaWarning(null);
      }
    }
  }, [formData.fecha_vencimiento_licencia]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo al modificarlo
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar datos
    const validation = validateDriverData(formData);
    // Validación extra si se crea cuenta
    if (createAccount) {
      if (!formData.email || formData.email.trim() === '') {
        validation.email = 'Email es obligatorio para crear la cuenta';
      }
      if (!password || password.length < 8) {
        validation.password = 'La contraseña debe tener al menos 8 caracteres';
      }
    }
    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        _createAccount: createAccount,
        _password: createAccount ? password : undefined,
      });
    } catch (err) {
      console.error('Error en formulario:', err);
      setErrors({
        _global: err.message || 'Error al guardar el conductor',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error global */}
      {errors._global && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700">{errors._global}</p>
          </div>
        </div>
      )}

      {/* Sección: Datos Personales */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Datos Personales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre Completo */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre_completo"
              value={formData.nombre_completo}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.nombre_completo ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Juan Pérez García"
            />
            {errors.nombre_completo && (
              <p className="text-xs text-red-600 mt-1">
                {errors.nombre_completo}
              </p>
            )}
          </div>

          {/* Cédula */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cédula <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.cedula ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: 1234567890"
            />
            {errors.cedula && (
              <p className="text-xs text-red-600 mt-1">{errors.cedula}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: 3001234567"
            />
          </div>

          {/* Email */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: conductor@email.com"
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Dirección */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <textarea
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Calle 123 # 45-67, Bogotá"
            />
          </div>
        </div>
      </div>

      {/* Sección: Licencia y Empleo */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Licencia y Empleo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Número de Licencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Licencia <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="numero_licencia"
              value={formData.numero_licencia}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.numero_licencia ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: 123456789"
            />
            {errors.numero_licencia && (
              <p className="text-xs text-red-600 mt-1">
                {errors.numero_licencia}
              </p>
            )}
          </div>
          {/* Categoría de Licencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría de Licencia
            </label>
            <select
              name="categoria_licencia"
              value={formData.categoria_licencia}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccionar...</option>
              <option value="A1">A1 - Motocicletas hasta 125cc</option>
              <option value="A2">A2 - Motocicletas superiores a 125cc</option>
              <option value="B1">
                B1 - Automóviles, motocarros y cuatrimotos
              </option>
              <option value="B2">B2 - Camionetas y microbuses</option>
              <option value="B3">B3 - Vehículos de más de 5 toneladas</option>
              <option value="C1">
                C1 - Automóviles, camperos y camionetas de servicio público
              </option>
              <option value="C2">
                C2 - Camiones, buses y busetas de servicio público
              </option>
              <option value="C3">C3 - Vehículos articulados</option>
            </select>
          </div>
          {/* Fecha Expedición Licencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Expedición Licencia
            </label>
            <input
              type="date"
              name="fecha_expedicion_licencia"
              value={formData.fecha_expedicion_licencia}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Fecha Vencimiento Licencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Vencimiento Licencia
            </label>
            <input
              type="date"
              name="fecha_vencimiento_licencia"
              value={formData.fecha_vencimiento_licencia}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.fecha_vencimiento_licencia
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
            />
            {errors.fecha_vencimiento_licencia && (
              <p className="text-xs text-red-600 mt-1">
                {errors.fecha_vencimiento_licencia}
              </p>
            )}
            {licenciaWarning !== null && !errors.fecha_vencimiento_licencia && (
              <p className="text-xs text-yellow-700 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                ⚠️ Licencia vence en {licenciaWarning} días
              </p>
            )}
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="activo">Activo</option>
              <option value="disponible">Disponible</option>
              <option value="en_servicio">En Servicio</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          {/* Fecha de Ingreso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Ingreso
            </label>
            <input
              type="date"
              name="fecha_ingreso"
              value={formData.fecha_ingreso}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Sección: Cuenta de Acceso (Opcional) */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Cuenta de Acceso (opcional)
        </h3>
        <label className="inline-flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={createAccount}
            onChange={(e) => setCreateAccount(e.target.checked)}
            disabled={loading}
          />
          <span>Crear usuario con rol "conductor" para iniciar sesión</span>
        </label>
        {createAccount && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email de acceso <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => handleChange(e)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="usuario@dominio.com"
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Mínimo 8 caracteres"
              />
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">{errors.password}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading
            ? 'Guardando...'
            : mode === 'create'
              ? 'Crear Conductor'
              : 'Guardar Cambios'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 disabled:opacity-50 transition-colors font-medium"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default DriverForm;
