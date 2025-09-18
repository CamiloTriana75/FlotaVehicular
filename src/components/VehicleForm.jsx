import React, { useState } from 'react';
import { Save, X } from 'lucide-react';

const VehicleForm = ({ vehicle, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    placa: vehicle?.placa || '',
    modelo: vehicle?.modelo || '',
    conductor: vehicle?.conductor || '',
    status: vehicle?.status || 'activo',
    combustible: vehicle?.combustible || 0,
    kilometraje: vehicle?.kilometraje || 0,
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.placa.trim()) {
      newErrors.placa = 'La placa es obligatoria';
    }
    
    if (!formData.modelo.trim()) {
      newErrors.modelo = 'El modelo es obligatorio';
    }
    
    if (!formData.conductor.trim()) {
      newErrors.conductor = 'El conductor es obligatorio';
    }

    if (formData.combustible < 0 || formData.combustible > 100) {
      newErrors.combustible = 'El combustible debe estar entre 0 y 100';
    }

    if (formData.kilometraje < 0) {
      newErrors.kilometraje = 'El kilometraje no puede ser negativo';
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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Placa *
        </label>
        <input
          type="text"
          value={formData.placa}
          onChange={(e) => handleChange('placa', e.target.value.toUpperCase())}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.placa ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="ABC-123"
          maxLength={8}
        />
        {errors.placa && (
          <p className="text-red-600 text-xs mt-1">{errors.placa}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Modelo *
        </label>
        <input
          type="text"
          value={formData.modelo}
          onChange={(e) => handleChange('modelo', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.modelo ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Toyota Corolla 2023"
        />
        {errors.modelo && (
          <p className="text-red-600 text-xs mt-1">{errors.modelo}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Conductor *
        </label>
        <input
          type="text"
          value={formData.conductor}
          onChange={(e) => handleChange('conductor', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.conductor ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Nombre del conductor"
        />
        {errors.conductor && (
          <p className="text-red-600 text-xs mt-1">{errors.conductor}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estado
        </label>
        <select
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="activo">Activo</option>
          <option value="estacionado">Estacionado</option>
          <option value="mantenimiento">Mantenimiento</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Combustible (%)
        </label>
        <input
          type="number"
          min="0"
          max="100"
          value={formData.combustible}
          onChange={(e) => handleChange('combustible', parseInt(e.target.value) || 0)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.combustible ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.combustible && (
          <p className="text-red-600 text-xs mt-1">{errors.combustible}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kilometraje
        </label>
        <input
          type="number"
          min="0"
          value={formData.kilometraje}
          onChange={(e) => handleChange('kilometraje', parseInt(e.target.value) || 0)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.kilometraje ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.kilometraje && (
          <p className="text-red-600 text-xs mt-1">{errors.kilometraje}</p>
        )}
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="h-4 w-4 mr-2" />
          Guardar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default VehicleForm;