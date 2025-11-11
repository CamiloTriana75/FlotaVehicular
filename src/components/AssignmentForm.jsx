/**
 * Formulario para crear/editar asignaciones de vehículos a conductores
 * Historia de Usuario: HU3
 */

import React, { useState, useEffect } from 'react';
import {
  createAssignment,
  updateAssignment,
  checkAssignmentConflicts,
} from '../services/assignmentService';

const AssignmentForm = ({
  assignment = null,
  vehicles = [],
  drivers = [],
  onSuccess,
  onCancel,
}) => {
  const isEditing = !!assignment;

  const [formData, setFormData] = useState({
    vehicleId: assignment?.vehicle_id || '',
    driverId: assignment?.driver_id || '',
    startTime: assignment?.start_time
      ? new Date(assignment.start_time).toISOString().slice(0, 16)
      : '',
    endTime: assignment?.end_time
      ? new Date(assignment.end_time).toISOString().slice(0, 16)
      : '',
    notes: assignment?.notes || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conflicts, setConflicts] = useState(null);
  const [showConflictWarning, setShowConflictWarning] = useState(false);

  // Validar conflictos cuando cambian las fechas o selecciones
  useEffect(() => {
    const validateConflicts = async () => {
      if (
        formData.vehicleId &&
        formData.driverId &&
        formData.startTime &&
        formData.endTime
      ) {
        const result = await checkAssignmentConflicts({
          vehicleId: formData.vehicleId,
          driverId: formData.driverId,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          excludeId: assignment?.id,
        });

        if (result.hasConflict) {
          setConflicts(result);
          setShowConflictWarning(true);
        } else {
          setConflicts(null);
          setShowConflictWarning(false);
        }
      }
    };

    // Debounce la validación
    const timeoutId = setTimeout(validateConflicts, 500);
    return () => clearTimeout(timeoutId);
  }, [
    formData.vehicleId,
    formData.driverId,
    formData.startTime,
    formData.endTime,
    assignment?.id,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validaciones básicas
      if (
        !formData.vehicleId ||
        !formData.driverId ||
        !formData.startTime ||
        !formData.endTime
      ) {
        throw new Error('Todos los campos son requeridos');
      }

      const startTime = new Date(formData.startTime);
      const endTime = new Date(formData.endTime);

      if (endTime <= startTime) {
        throw new Error(
          'La fecha de fin debe ser posterior a la fecha de inicio'
        );
      }

      // Si hay conflictos, mostrar advertencia
      if (conflicts?.hasConflict) {
        setShowConflictWarning(true);
        setLoading(false);
        return;
      }

      // Crear o actualizar asignación
      let result;
      if (isEditing) {
        result = await updateAssignment(assignment.id, formData);
      } else {
        result = await createAssignment(formData);
      }

      if (result.error) {
        throw result.error;
      }

      // Notificar éxito
      if (onSuccess) {
        onSuccess(result.data);
      }
    } catch (err) {
      console.error('Error al guardar asignación:', err);
      setError(err.message || 'Error al guardar la asignación');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedVehicle = () => {
    return vehicles.find((v) => v.id === formData.vehicleId);
  };

  const getSelectedDriver = () => {
    return drivers.find((d) => d.id === formData.driverId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? 'Editar Asignación' : 'Nueva Asignación'}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">❌ {error}</p>
        </div>
      )}

      {showConflictWarning && conflicts?.hasConflict && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 font-bold mb-2">
            ⚠️ Conflictos de Horario Detectados
          </p>

          {conflicts.driverConflicts?.length > 0 && (
            <div className="mb-2">
              <p className="font-medium text-yellow-700">
                Conflictos del Conductor:
              </p>
              <ul className="list-disc list-inside text-sm text-yellow-600">
                {conflicts.driverConflicts.map((c, i) => (
                  <li key={i}>
                    Ya asignado a {c.vehicle?.marca} {c.vehicle?.modelo} (
                    {c.vehicle?.placa})
                    <br />
                    Desde: {new Date(c.start_time).toLocaleString()} hasta{' '}
                    {new Date(c.end_time).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {conflicts.vehicleConflicts?.length > 0 && (
            <div>
              <p className="font-medium text-yellow-700">
                Conflictos del Vehículo:
              </p>
              <ul className="list-disc list-inside text-sm text-yellow-600">
                {conflicts.vehicleConflicts.map((c, i) => (
                  <li key={i}>
                    Ya asignado a {c.driver?.nombre} {c.driver?.apellidos}
                    <br />
                    Desde: {new Date(c.start_time).toLocaleString()} hasta{' '}
                    {new Date(c.end_time).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => setShowConflictWarning(false)}
            className="mt-2 text-sm text-yellow-700 underline hover:text-yellow-900"
          >
            Cerrar advertencia
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selector de Vehículo */}
        <div>
          <label
            htmlFor="vehicleId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Vehículo *
          </label>
          <select
            id="vehicleId"
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            required
            disabled={isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Seleccione un vehículo</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.placa} - {vehicle.marca} {vehicle.modelo} (
                {vehicle.año})
              </option>
            ))}
          </select>
          {getSelectedVehicle() && (
            <p className="mt-1 text-sm text-gray-500">
              Estado:{' '}
              <span className="font-medium">{getSelectedVehicle().estado}</span>
            </p>
          )}
        </div>

        {/* Selector de Conductor */}
        <div>
          <label
            htmlFor="driverId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Conductor *
          </label>
          <select
            id="driverId"
            name="driverId"
            value={formData.driverId}
            onChange={handleChange}
            required
            disabled={isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Seleccione un conductor</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.nombre} {driver.apellidos} - Lic:{' '}
                {driver.numero_licencia}
              </option>
            ))}
          </select>
          {getSelectedDriver() && (
            <p className="mt-1 text-sm text-gray-500">
              Estado:{' '}
              <span className="font-medium">{getSelectedDriver().estado}</span>{' '}
              | Cédula: {getSelectedDriver().cedula}
            </p>
          )}
        </div>

        {/* Fecha y hora de inicio */}
        <div>
          <label
            htmlFor="startTime"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Fecha y Hora de Inicio *
          </label>
          <input
            type="datetime-local"
            id="startTime"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Fecha y hora de fin */}
        <div>
          <label
            htmlFor="endTime"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Fecha y Hora de Fin *
          </label>
          <input
            type="datetime-local"
            id="endTime"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
            min={formData.startTime}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Calcular duración */}
        {formData.startTime && formData.endTime && (
          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Duración:</strong>{' '}
              {(
                (new Date(formData.endTime) - new Date(formData.startTime)) /
                (1000 * 60 * 60)
              ).toFixed(2)}{' '}
              horas
            </p>
          </div>
        )}

        {/* Notas */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Notas
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Notas adicionales sobre la asignación..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={
              loading || (conflicts?.hasConflict && showConflictWarning)
            }
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading
              ? 'Guardando...'
              : isEditing
                ? 'Actualizar Asignación'
                : 'Crear Asignación'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 disabled:bg-gray-100 font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignmentForm;
