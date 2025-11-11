import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import DriverForm from '../components/DriverForm';
import { driverService } from '../services/driverService';

/**
 * Página para crear un nuevo conductor
 * Accesible para rol RRHH y Admin
 */
export default function NewDriver() {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      // Crear registro en la tabla 'drivers' (no en 'conductor')
      const { data, error } = await driverService.createFromForm(formData);

      if (error) {
        throw new Error(error.message || 'Error al crear el conductor');
      }

      // Mostrar mensaje de éxito (opcional: usar toast/notification)
      console.log('✅ Conductor creado exitosamente:', data);

      // Redirigir a la lista de conductores
      navigate('/conductores');
    } catch (err) {
      console.error('Error creando conductor:', err);
      throw err; // Re-lanzar para que el formulario maneje el error
    }
  };

  const handleCancel = () => {
    navigate('/conductores');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Nuevo Conductor
            </h1>
            <p className="text-gray-600">
              Registrar un nuevo conductor en el sistema
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <DriverForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>

      {/* Ayuda */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • Los campos marcados con <span className="text-red-600">*</span>{' '}
            son obligatorios
          </li>
          <li>
            • La fecha de vencimiento de la licencia debe ser hoy o una fecha
            futura
          </li>
          <li>
            • Se mostrará una alerta si la licencia vence en menos de 30 días
          </li>
          <li>
            • Los datos se guardarán en formato ISO para compatibilidad
            internacional
          </li>
        </ul>
      </div>
    </div>
  );
}
