/**
 * Lista de asignaciones de vehículos a conductores
 * Historia de Usuario: HU3
 */

import React, { useState } from 'react';
import {
  completeAssignment,
  cancelAssignment,
  deleteAssignment,
} from '../services/assignmentService';

const AssignmentList = ({ assignments = [], onUpdate, onEdit, onDelete }) => {
  const [actionLoading, setActionLoading] = useState({});

  const handleComplete = async (id) => {
    if (
      !window.confirm('¿Está seguro de marcar esta asignación como completada?')
    ) {
      return;
    }

    setActionLoading((prev) => ({ ...prev, [id]: 'completing' }));

    try {
      const result = await completeAssignment(id);
      if (result.error) {
        throw result.error;
      }

      alert('✅ Asignación completada exitosamente');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error al completar asignación:', error);
      alert('❌ Error al completar la asignación: ' + error.message);
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('¿Está seguro de cancelar esta asignación?')) {
      return;
    }

    setActionLoading((prev) => ({ ...prev, [id]: 'cancelling' }));

    try {
      const result = await cancelAssignment(id);
      if (result.error) {
        throw result.error;
      }

      alert('✅ Asignación cancelada exitosamente');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error al cancelar asignación:', error);
      alert('❌ Error al cancelar la asignación: ' + error.message);
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        '¿Está seguro de eliminar esta asignación? Esta acción no se puede deshacer.'
      )
    ) {
      return;
    }

    setActionLoading((prev) => ({ ...prev, [id]: 'deleting' }));

    try {
      const result = await deleteAssignment(id);
      if (result.error) {
        throw result.error;
      }

      alert('✅ Asignación eliminada exitosamente');
      if (onDelete) onDelete(id);
    } catch (error) {
      console.error('Error al eliminar asignación:', error);
      alert('❌ Error al eliminar la asignación: ' + error.message);
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800 border-green-300',
      completed: 'bg-blue-100 text-blue-800 border-blue-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };

    const labels = {
      active: 'Activa',
      completed: 'Completada',
      cancelled: 'Cancelada',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full border ${badges[status] || 'bg-gray-100 text-gray-800'}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const isCurrentlyActive = (assignment) => {
    const now = new Date();
    const start = new Date(assignment.start_time);
    const end = new Date(assignment.end_time);
    return assignment.status === 'active' && now >= start && now <= end;
  };

  const isPending = (assignment) => {
    const now = new Date();
    const start = new Date(assignment.start_time);
    return assignment.status === 'active' && now < start;
  };

  const formatDuration = (start, end) => {
    const duration = (new Date(end) - new Date(start)) / (1000 * 60 * 60);
    return duration.toFixed(1) + ' hrs';
  };

  if (assignments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500 text-lg">
          No hay asignaciones para mostrar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <div
          key={assignment.id}
          className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
            isCurrentlyActive(assignment)
              ? 'border-green-500'
              : isPending(assignment)
                ? 'border-yellow-500'
                : 'border-gray-300'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              {/* Indicador de estado actual */}
              {isCurrentlyActive(assignment) && (
                <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full mb-2">
                  🚗 EN CURSO
                </span>
              )}
              {isPending(assignment) && (
                <span className="inline-block px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full mb-2">
                  ⏰ PENDIENTE
                </span>
              )}

              {/* Información del vehículo y conductor */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Vehículo</p>
                  <p className="text-lg font-bold text-gray-900">
                    {assignment.vehicle?.placa}
                  </p>
                  <p className="text-sm text-gray-600">
                    {assignment.vehicle?.marca} {assignment.vehicle?.modelo}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Conductor</p>
                  <p className="text-lg font-bold text-gray-900">
                    {assignment.driver?.nombre} {assignment.driver?.apellidos}
                  </p>
                  <p className="text-sm text-gray-600">
                    Lic: {assignment.driver?.numero_licencia}
                  </p>
                </div>
              </div>
            </div>

            {/* Estado */}
            <div>{getStatusBadge(assignment.status)}</div>
          </div>

          {/* Fechas y duración */}
          <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-md">
            <div>
              <p className="text-xs text-gray-500 font-medium">Inicio</p>
              <p className="text-sm font-semibold">
                {new Date(assignment.start_time).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(assignment.start_time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Fin</p>
              <p className="text-sm font-semibold">
                {new Date(assignment.end_time).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(assignment.end_time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Duración</p>
              <p className="text-sm font-semibold">
                {formatDuration(assignment.start_time, assignment.end_time)}
              </p>
            </div>
          </div>

          {/* Notas */}
          {assignment.notes && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-xs text-blue-700 font-medium mb-1">Notas:</p>
              <p className="text-sm text-blue-900">{assignment.notes}</p>
            </div>
          )}

          {/* Información de creación */}
          <div className="mb-4 text-xs text-gray-500">
            Creada el {new Date(assignment.created_at).toLocaleDateString()}
          </div>

          {/* Acciones */}
          {assignment.status === 'active' && (
            <div className="flex gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(assignment)}
                  disabled={actionLoading[assignment.id]}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium transition-colors"
                >
                  ✏️ Editar
                </button>
              )}
              <button
                onClick={() => handleComplete(assignment.id)}
                disabled={actionLoading[assignment.id]}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 text-sm font-medium transition-colors"
              >
                {actionLoading[assignment.id] === 'completing'
                  ? 'Completando...'
                  : '✓ Completar'}
              </button>
              <button
                onClick={() => handleCancel(assignment.id)}
                disabled={actionLoading[assignment.id]}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400 text-sm font-medium transition-colors"
              >
                {actionLoading[assignment.id] === 'cancelling'
                  ? 'Cancelando...'
                  : '✗ Cancelar'}
              </button>
              {isPending(assignment) && (
                <button
                  onClick={() => handleDelete(assignment.id)}
                  disabled={actionLoading[assignment.id]}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 text-sm font-medium transition-colors"
                >
                  {actionLoading[assignment.id] === 'deleting'
                    ? 'Eliminando...'
                    : '🗑️ Eliminar'}
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AssignmentList;
