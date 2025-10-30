import React, { useState } from 'react';
import { Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import {
  VEHICLE_TYPES,
  FUEL_TYPES,
  VEHICLE_STATUS,
  CURRENT_YEAR,
  MIN_YEAR,
  MAX_YEAR,
  PLATE_REGEX,
} from '../shared/constants/vehicleConstants';
import { useVehicles } from '../hooks/useVehicles';

const VehicleForm = ({ vehicle, onSave, onCancel }) => {
  const { vehicles } = useVehicles();
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);

  const [formData, setFormData] = useState({
    // Identificación
    placa: vehicle?.placa || '',
    marca: vehicle?.marca || '',
    modelo: vehicle?.modelo || '',
    anio: vehicle?.anio || CURRENT_YEAR,
    color: vehicle?.color || '',
    vin: vehicle?.vin || '',
    numeroMotor: vehicle?.numeroMotor || '',

    // Características
    tipo: vehicle?.tipo || 'sedan',
    capacidad: vehicle?.capacidad || '',
    tipoCombustible: vehicle?.tipoCombustible || 'gasolina',

    // Estado
    estado: vehicle?.estado || 'disponible',
    kilometraje: vehicle?.kilometraje || 0,

    // Mantenimiento (opcional)
    fechaUltimoMantenimiento: vehicle?.fechaUltimoMantenimiento || '',
    fechaProximoMantenimiento: vehicle?.fechaProximoMantenimiento || '',

    // Compra (opcional)
    fechaCompra: vehicle?.fechaCompra || '',
    precioCompra: vehicle?.precioCompra || '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Identificación
    if (!formData.placa.trim()) {
      newErrors.placa = 'La placa es obligatoria';
    } else if (!PLATE_REGEX.test(formData.placa)) {
      newErrors.placa = 'Formato de placa inválido (Ej: ABC-123 o ABC123)';
    } else {
      // Validar placa única (excepto si estamos editando el mismo vehículo)
      const isDuplicate = vehicles.some(
        (v) => v.placa === formData.placa && v.id !== vehicle?.id
      );
      if (isDuplicate) {
        newErrors.placa = 'Esta placa ya está registrada';
      }
    }

    if (!formData.marca.trim()) {
      newErrors.marca = 'La marca es obligatoria';
    } else if (formData.marca.trim().length < 2) {
      newErrors.marca = 'La marca debe tener al menos 2 caracteres';
    }

    if (!formData.modelo.trim()) {
      newErrors.modelo = 'El modelo es obligatorio';
    } else if (formData.modelo.trim().length < 2) {
      newErrors.modelo = 'El modelo debe tener al menos 2 caracteres';
    }

    if (!formData.anio) {
      newErrors.anio = 'El año es obligatorio';
    } else if (formData.anio < MIN_YEAR || formData.anio > MAX_YEAR) {
      newErrors.anio = `El año debe estar entre ${MIN_YEAR} y ${MAX_YEAR}`;
    }

    // Características
    if (!formData.tipo) {
      newErrors.tipo = 'El tipo de vehículo es obligatorio';
    }

    if (!formData.tipoCombustible) {
      newErrors.tipoCombustible = 'El tipo de combustible es obligatorio';
    }

    if (
      formData.capacidad &&
      (formData.capacidad < 1 || formData.capacidad > 100)
    ) {
      newErrors.capacidad = 'La capacidad debe estar entre 1 y 100';
    }

    // Estado
    if (!formData.estado) {
      newErrors.estado = 'El estado es obligatorio';
    }

    if (formData.kilometraje < 0) {
      newErrors.kilometraje = 'El kilometraje no puede ser negativo';
    }

    // Mantenimiento
    if (
      formData.fechaUltimoMantenimiento &&
      formData.fechaProximoMantenimiento
    ) {
      if (
        new Date(formData.fechaProximoMantenimiento) <=
        new Date(formData.fechaUltimoMantenimiento)
      ) {
        newErrors.fechaProximoMantenimiento =
          'La fecha del próximo mantenimiento debe ser posterior al último';
      }
    }

    if (formData.fechaUltimoMantenimiento) {
      if (new Date(formData.fechaUltimoMantenimiento) > new Date()) {
        newErrors.fechaUltimoMantenimiento =
          'La fecha del último mantenimiento no puede ser futura';
      }
    }

    // Compra
    if (formData.fechaCompra) {
      if (new Date(formData.fechaCompra) > new Date()) {
        newErrors.fechaCompra = 'La fecha de compra no puede ser futura';
      }
    }

    if (formData.precioCompra && formData.precioCompra < 0) {
      newErrors.precioCompra = 'El precio de compra no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSave({ ...vehicle, ...formData });
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* SECCIÓN: IDENTIFICACIÓN */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Identificación
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Placa */}
          <div>
            <label
              htmlFor="placa"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Placa <span className="text-red-500">*</span>
            </label>
            <input
              id="placa"
              type="text"
              value={formData.placa}
              onChange={(e) =>
                handleChange('placa', e.target.value.toUpperCase())
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.placa ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="ABC-123"
              maxLength={7}
            />
            {errors.placa && (
              <p className="text-red-600 text-xs mt-1">{errors.placa}</p>
            )}
          </div>

          {/* Marca */}
          <div>
            <label
              htmlFor="marca"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Marca <span className="text-red-500">*</span>
            </label>
            <input
              id="marca"
              type="text"
              value={formData.marca}
              onChange={(e) => handleChange('marca', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.marca ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Toyota"
            />
            {errors.marca && (
              <p className="text-red-600 text-xs mt-1">{errors.marca}</p>
            )}
          </div>

          {/* Modelo */}
          <div>
            <label
              htmlFor="modelo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Modelo <span className="text-red-500">*</span>
            </label>
            <input
              id="modelo"
              type="text"
              value={formData.modelo}
              onChange={(e) => handleChange('modelo', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.modelo ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Corolla"
            />
            {errors.modelo && (
              <p className="text-red-600 text-xs mt-1">{errors.modelo}</p>
            )}
          </div>

          {/* Año */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Año <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={MIN_YEAR}
              max={MAX_YEAR}
              value={formData.anio}
              onChange={(e) =>
                handleChange('anio', parseInt(e.target.value) || '')
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.anio ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={CURRENT_YEAR.toString()}
            />
            {errors.anio && (
              <p className="text-red-600 text-xs mt-1">{errors.anio}</p>
            )}
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Blanco"
            />
          </div>

          {/* VIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              VIN
            </label>
            <input
              type="text"
              value={formData.vin}
              onChange={(e) =>
                handleChange('vin', e.target.value.toUpperCase())
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="1HGBH41JXMN109186"
              maxLength={17}
            />
          </div>

          {/* Número de Motor */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Motor
            </label>
            <input
              type="text"
              value={formData.numeroMotor}
              onChange={(e) =>
                handleChange('numeroMotor', e.target.value.toUpperCase())
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="AB12345678"
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN: CARACTERÍSTICAS */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Características
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tipo de Vehículo */}
          <div>
            <label
              htmlFor="tipo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tipo de Vehículo <span className="text-red-500">*</span>
            </label>
            <select
              id="tipo"
              value={formData.tipo}
              onChange={(e) => handleChange('tipo', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.tipo ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {VEHICLE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.tipo && (
              <p className="text-red-600 text-xs mt-1">{errors.tipo}</p>
            )}
          </div>

          {/* Capacidad */}
          <div>
            <label
              htmlFor="capacidad"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Capacidad (pasajeros)
            </label>
            <input
              id="capacidad"
              type="number"
              min="1"
              max="100"
              value={formData.capacidad}
              onChange={(e) =>
                handleChange('capacidad', parseInt(e.target.value) || '')
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.capacidad ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="5"
            />
            {errors.capacidad && (
              <p className="text-red-600 text-xs mt-1">{errors.capacidad}</p>
            )}
          </div>

          {/* Tipo de Combustible */}
          <div>
            <label
              htmlFor="tipoCombustible"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tipo de Combustible <span className="text-red-500">*</span>
            </label>
            <select
              id="tipoCombustible"
              value={formData.tipoCombustible}
              onChange={(e) => handleChange('tipoCombustible', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.tipoCombustible ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {FUEL_TYPES.map((fuel) => (
                <option key={fuel.value} value={fuel.value}>
                  {fuel.label}
                </option>
              ))}
            </select>
            {errors.tipoCombustible && (
              <p className="text-red-600 text-xs mt-1">
                {errors.tipoCombustible}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN: ESTADO OPERATIVO */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Estado Operativo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.estado}
              onChange={(e) => handleChange('estado', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.estado ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {VEHICLE_STATUS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            {errors.estado && (
              <p className="text-red-600 text-xs mt-1">{errors.estado}</p>
            )}
          </div>

          {/* Kilometraje */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kilometraje Actual <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={formData.kilometraje}
                onChange={(e) =>
                  handleChange('kilometraje', parseInt(e.target.value) || 0)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.kilometraje ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              <span className="absolute right-3 top-2 text-gray-500 text-sm">
                km
              </span>
            </div>
            {errors.kilometraje && (
              <p className="text-red-600 text-xs mt-1">{errors.kilometraje}</p>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN: MANTENIMIENTO (Colapsable) */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowMaintenance(!showMaintenance)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50"
        >
          <h2 className="text-lg font-semibold text-gray-900">
            Mantenimiento{' '}
            <span className="text-gray-500 text-sm font-normal">
              (opcional)
            </span>
          </h2>
          {showMaintenance ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {showMaintenance && (
          <div className="px-6 pb-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Fecha Último Mantenimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Último Mantenimiento
                </label>
                <input
                  type="date"
                  value={formData.fechaUltimoMantenimiento}
                  onChange={(e) =>
                    handleChange('fechaUltimoMantenimiento', e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.fechaUltimoMantenimiento
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {errors.fechaUltimoMantenimiento && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.fechaUltimoMantenimiento}
                  </p>
                )}
              </div>

              {/* Fecha Próximo Mantenimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Próximo Mantenimiento
                </label>
                <input
                  type="date"
                  value={formData.fechaProximoMantenimiento}
                  onChange={(e) =>
                    handleChange('fechaProximoMantenimiento', e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.fechaProximoMantenimiento
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {errors.fechaProximoMantenimiento && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.fechaProximoMantenimiento}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN: INFORMACIÓN DE COMPRA (Colapsable) */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowPurchase(!showPurchase)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50"
        >
          <h2 className="text-lg font-semibold text-gray-900">
            Información de Compra{' '}
            <span className="text-gray-500 text-sm font-normal">
              (opcional)
            </span>
          </h2>
          {showPurchase ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {showPurchase && (
          <div className="px-6 pb-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Fecha de Compra */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Compra
                </label>
                <input
                  type="date"
                  value={formData.fechaCompra}
                  onChange={(e) => handleChange('fechaCompra', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.fechaCompra ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.fechaCompra && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.fechaCompra}
                  </p>
                )}
              </div>

              {/* Precio de Compra */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio de Compra
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.precioCompra}
                    onChange={(e) =>
                      handleChange(
                        'precioCompra',
                        parseFloat(e.target.value) || ''
                      )
                    }
                    className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.precioCompra ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-2 text-gray-500 text-sm">
                    COP
                  </span>
                </div>
                {errors.precioCompra && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.precioCompra}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex space-x-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Save className="h-5 w-5 mr-2" />
          Guardar Vehículo
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          <X className="h-5 w-5 mr-2" />
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default VehicleForm;
