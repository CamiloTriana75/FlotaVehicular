import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserCog, Trash2, AlertCircle } from 'lucide-react';
import DriverForm from '../components/DriverForm';
import { conductorService } from '../services/conductorService';

/**
 * Página para editar/ver detalle de un conductor
 * Accesible para rol RRHH y Admin (edición)
 * Otros roles solo lectura
 */
export default function DriverDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    cargarConductor();
  }, [id]);

  const cargarConductor = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await conductorService.getById(id);

      if (fetchError) {
        throw new Error(fetchError.message || 'Error al cargar el conductor');
      }

      if (!data) {
        throw new Error('Conductor no encontrado');
      }

      setDriver(data);
    } catch (err) {
      console.error('Error cargando conductor:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const { data, error: updateError } = await conductorService.update(
        id,
        formData
      );

      if (updateError) {
        throw new Error(
          updateError.message || 'Error al actualizar el conductor'
        );
      }

      console.log('✅ Conductor actualizado exitosamente:', data);
      navigate('/conductores');
    } catch (err) {
      console.error('Error actualizando conductor:', err);
      throw err;
    }
  };

  const handleDelete = async () => {
    const confirmacion = window.confirm(
      `¿Estás seguro de que deseas eliminar al conductor ${driver?.nombre_completo}?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmacion) return;

    setDeleting(true);

    try {
      const { error: deleteError } = await conductorService.delete(id);

      if (deleteError) {
        throw new Error(
          deleteError.message || 'Error al eliminar el conductor'
        );
      }

      console.log('✅ Conductor eliminado exitosamente');
      navigate('/conductores');
    } catch (err) {
      console.error('Error eliminando conductor:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    navigate('/conductores');
  };

  // Estados de carga y error
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando conductor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-2">
              Error al cargar conductor
            </h3>
            <p className="text-sm text-red-700 mb-4">{error}</p>
            <button
              onClick={() => navigate('/conductores')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Volver a la lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">No se encontró el conductor</p>
          <button
            onClick={() => navigate('/conductores')}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserCog className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Editar Conductor
              </h1>
              <p className="text-gray-600">
                Actualizar información de {driver.nombre_completo}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <DriverForm
          mode="edit"
          initialData={driver}
          onSubmit={handleUpdate}
          onCancel={handleCancel}
        />
      </div>

      {/* Sección de eliminación */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Zona Peligrosa
        </h3>
        <p className="text-sm text-red-700 mb-4">
          Eliminar este conductor borrará permanentemente todos sus datos del
          sistema. Esta acción no se puede deshacer.
        </p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          {deleting ? 'Eliminando...' : 'Eliminar Conductor'}
        </button>
      </div>
    </div>
  );
}
