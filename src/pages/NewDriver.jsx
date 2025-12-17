import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import DriverForm from '../components/DriverForm';
import { driverService } from '../services/driverService';
import { userService } from '../services/userService';
import { HR_CONFIG } from '../shared/constants';

/**
 * Página para crear un nuevo conductor
 * Accesible para rol RRHH y Admin
 */
export default function NewDriver() {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      // 1) Si se solicitó cuenta de acceso, crear usuario con rol 'conductor'
      if (formData._createAccount) {
        // Usar cédula como username para evitar duplicados (más único que el nombre)
        const username =
          formData.cedula || (formData.email || '').split('@')[0];
        const password = formData._password || 'Temporal2025$';
        const email = formData.email || null;

        const { error: userErr } = await userService.create({
          username,
          email,
          rol: 'conductor',
          password,
        });
        if (userErr) throw userErr;
      }

      // 2) Crear registro del conductor en 'drivers'
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
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Nuevo Conductor
            </h1>
            <p className="text-sm text-gray-600">
              Registrar un nuevo conductor en el sistema
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg border shadow-sm">
        <DriverForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>

      {/* Ayuda */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Información
        </h3>
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
            • Se mostrará una alerta si la licencia vence en menos de{' '}
            {HR_CONFIG.LICENSE_EXPIRY_THRESHOLD_DAYS} días
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
